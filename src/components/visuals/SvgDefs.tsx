
export function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <linearGradient id="silverGrad" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#E2E8F0" />
          <stop offset="80%" stopColor="#B8C2D1" />
          <stop offset="100%" stopColor="#7E8BA0" />
        </linearGradient>
        <linearGradient id="silverHi" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
          <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <symbol id="star" viewBox="0 0 100 100">
          <path
            d="M 50,4 L 54,46 L 96,50 L 54,54 L 50,96 L 46,54 L 4,50 L 46,46 Z"
            fill="url(#silverGrad)"
          />
          <path
            d="M 50,4 L 54,46 L 96,50 L 54,54 L 50,96 L 46,54 L 4,50 L 46,46 Z"
            fill="url(#silverHi)"
          />
        </symbol>
      </defs>
    </svg>
  );
}
