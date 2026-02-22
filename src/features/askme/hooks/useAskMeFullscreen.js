import { useCallback, useEffect, useState } from "react";

function isIOSDevice() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function useAskMeFullscreen(wrapperRef) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isIOS = isIOSDevice();

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const element = wrapperRef.current;
    if (!element) return;

    if (isIOS) {
      const newFullscreenState = !isFullscreen;
      setIsFullscreen(newFullscreenState);
      if (newFullscreenState) {
        window.scrollTo(0, 1);
      }
      return;
    }

    try {
      if (!document.fullscreenElement) {
        await element.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen toggle failed", error);
    }
  }, [wrapperRef, isIOS, isFullscreen]);

  return { isFullscreen, toggleFullscreen };
}
