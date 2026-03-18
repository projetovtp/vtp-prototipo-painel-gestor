import { useDevice } from "../hooks/useDevice";

const ResponsivePage = ({ desktop: Desktop, mobile: Mobile }) => {
  const { isMobile, isTablet } = useDevice();

  if ((isMobile || isTablet) && Mobile) return <Mobile />;
  return <Desktop />;
}

export default ResponsivePage;
