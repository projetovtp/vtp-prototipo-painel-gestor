export default function IconCourtField({ width = 32, height = 32, size, ...props }) {
  const w = size ?? width;
  const h = size ?? height;
  return (
    <svg width={w} height={h} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 9h18M9 3v18" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}
