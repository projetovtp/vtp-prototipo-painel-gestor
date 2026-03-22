export default function IconAlertCircle({ width = 28, height = 28, ...props }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 9v4M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
