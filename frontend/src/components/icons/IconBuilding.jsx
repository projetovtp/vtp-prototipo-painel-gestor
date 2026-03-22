export default function IconBuilding({ width = 16, height = 16, ...props }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M3 21h18M5 21V7l8-4v14M19 21V11l-6-4M9 9v0M9 15v0M15 11v0M15 17v0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
