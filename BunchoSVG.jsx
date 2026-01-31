export default function BunchoSVG({ colors, action, sleeping, animFrame, isBlinking }) {
  const bounce = Math.sin(animFrame * 0.3) * 3;
  const eyesClosed = sleeping || isBlinking;

  return (
    <svg viewBox="0 0 200 200" style={{ width: '100%', maxWidth: 280 }}>
      <ellipse cx="100" cy="175" rx="70" ry="8" fill="#8b6914" />

      <ellipse cx="100" cy="120" rx="45" ry="40" fill={colors.body} />
      <circle cx="100" cy="70" r="38" fill={colors.head} />

      {eyesClosed ? (
        <>
          <path d="M72,65 Q80,70 88,65" stroke="#000" strokeWidth="3" fill="none" />
          <path d="M112,65 Q120,70 128,65" stroke="#000" strokeWidth="3" fill="none" />
        </>
      ) : (
        <>
          <circle cx="80" cy="65" r="8" fill="#000" />
          <circle cx="120" cy="65" r="8" fill="#000" />
        </>
      )}
    </svg>
  );
}
