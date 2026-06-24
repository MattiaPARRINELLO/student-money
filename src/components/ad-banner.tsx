export default function AdBanner({ slot }: { slot?: string }) {
  if (process.env.NODE_ENV === "development") {
    return (
      <div className="my-8 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-8 text-gray-400">
        Publicité — AdSense (slot: {slot || "auto"})
      </div>
    )
  }

  return (
    <div className="my-8">
      <ins
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={slot || "auto"}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
