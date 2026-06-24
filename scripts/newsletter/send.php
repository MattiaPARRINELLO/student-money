<?php
// Cron : 0 10 * * 1 php /home/.../student-money/scripts/newsletter/send.php

$subscribersFile = __DIR__ . '/subscribers.json';
if (!file_exists($subscribersFile)) {
    echo "Aucun abonné.\n";
    exit;
}

$subscribers = json_decode(file_get_contents($subscribersFile), true);
if (empty($subscribers)) {
    echo "Aucun abonné.\n";
    exit;
}

$publishedDir = __DIR__ . '/../../content/published';
$files = glob($publishedDir . '/*.mdx');
if (empty($files)) {
    echo "Aucun article publié.\n";
    exit;
}

usort($files, function($a, $b) { return filemtime($b) - filemtime($a); });
$latestFile = $files[0];

$content = file_get_contents($latestFile);
preg_match('/title:\s*"(.+)"/', $content, $titleMatch);
preg_match('/excerpt:\s*"(.+)"/', $content, $excerptMatch);
preg_match('/slug:\s*"(.+)"/', $content, $slugMatch);

$title = $titleMatch[1] ?? 'Nouvel article';
$excerpt = $excerptMatch[1] ?? '';
$slug = $slugMatch[1] ?? '';

$subject = "🤑 Student-Money : " . $title;
$siteUrl = "https://studentmoney.fr";
$articleUrl = $siteUrl . "/articles/" . $slug;

$headers = "From: Student-Money <noreply@studentmoney.fr>\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";

$message = "
<html>
<body style='font-family: sans-serif; max-width: 600px; margin: 0 auto;'>
  <h1 style='color: #1a1a2e;'>$title</h1>
  <p style='color: #555;'>$excerpt</p>
  <a href='$articleUrl' style='display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;'>
    Lire l'article
  </a>
  <hr style='margin: 30px 0; border: none; border-top: 1px solid #eee;'>
  <p style='color: #999; font-size: 12px;'>
    Tu reçois cet email car tu es inscrit à la newsletter Student-Money.
    <br><a href='$siteUrl/unsubscribe'>Se désinscrire</a>
  </p>
</body>
</html>
";

foreach ($subscribers as $email) {
    mail($email, $subject, $message, $headers);
}

echo "Newsletter envoyée à " . count($subscribers) . " abonnés.\n";
