// A small phone-shaped diagram of a training screen's answer zones, shown on
// mode home screens so the fixed positions can be learned once and then
// found by feel.
export default function ZoneMap({ layout, zones, caption }) {
  return (
    <figure className="zone-map">
      <div className="zone-map-phone" aria-hidden="true">
        <span className="zone-map-card" />
        <div className={`zone-map-zones zm-${layout}`}>
          {zones.map((z) => (
            <span key={z.id} className={`zone-map-zone zone-${z.tone || 'neutral'}`}>
              {z.glyph}
            </span>
          ))}
        </div>
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
