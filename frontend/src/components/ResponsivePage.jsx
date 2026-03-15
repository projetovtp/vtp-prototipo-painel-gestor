import { useDevice } from "../hooks/useDevice";

export default function ResponsivePage({ desktop: Desktop, mobile: Mobile }) {
  const { isMobile, isTablet } = useDevice();

  if ((isMobile || isTablet) && Mobile) return <Mobile />;
  return <Desktop />;
}
