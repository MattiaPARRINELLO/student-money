<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email invalide']);
    exit;
}

$subscribersFile = __DIR__ . '/subscribers.json';
$subscribers = [];

if (file_exists($subscribersFile)) {
    $subscribers = json_decode(file_get_contents($subscribersFile), true) ?? [];
}

if (in_array($email, $subscribers)) {
    echo json_encode(['success' => true, 'message' => 'Déjà inscrit']);
    exit;
}

$subscribers[] = $email;
file_put_contents($subscribersFile, json_encode($subscribers, JSON_PRETTY_PRINT));

echo json_encode(['success' => true]);
