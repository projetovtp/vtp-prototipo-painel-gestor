// src/hooks/useDevice.js
import { useState, useEffect } from "react";

export function useDevice() {
  const [device, setDevice] = useState("desktop");
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      setWindowSize({ width, height: window.innerHeight });

      if (width < 768) {
        setDevice("mobile");
      } else if (width < 1024) {
        setDevice("tablet");
      } else {
        setDevice("desktop");
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { device, windowSize, isMobile: device === "mobile", isTablet: device === "tablet", isDesktop: device === "desktop" };
}
