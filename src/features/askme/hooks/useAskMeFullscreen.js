import { useCallback, useEffect, useState } from "react";

function isIOSDevice() {
  const touchMac = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) || touchMac;
}

function getFullscreenElement() {
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement ||
    null
  );
}

async function requestNativeFullscreen(element) {
  if (element.requestFullscreen) {
    await element.requestFullscreen();
    return true;
  }
  if (element.webkitRequestFullscreen) {
    await element.webkitRequestFullscreen();
    return true;
  }
  if (element.msRequestFullscreen) {
    await element.msRequestFullscreen();
    return true;
  }
  return false;
}

async function exitNativeFullscreen() {
  if (document.exitFullscreen) {
    await document.exitFullscreen();
    return true;
  }
  if (document.webkitExitFullscreen) {
    await document.webkitExitFullscreen();
    return true;
  }
  if (document.msExitFullscreen) {
    await document.msExitFullscreen();
    return true;
  }
  return false;
}

export function useAskMeFullscreen(wrapperRef) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isIOS = isIOSDevice();

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(getFullscreenElement()));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const element = wrapperRef.current;
    if (!element) return;

    const nativeFullscreenElement = getFullscreenElement();

    if (nativeFullscreenElement) {
      try {
        const didExit = await exitNativeFullscreen();
        if (!didExit) {
          setIsFullscreen(false);
        }
      } catch (error) {
        console.error("Fullscreen exit failed", error);
        setIsFullscreen(false);
      }
      return;
    }

    if (!isIOS) {
      try {
        const didEnter = await requestNativeFullscreen(element);
        if (didEnter) {
          return;
        }
      } catch (error) {
        console.error("Fullscreen enter failed", error);
      }
    }

    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);

    if (newFullscreenState) {
      window.scrollTo(0, 1);
    }
  }, [wrapperRef, isIOS, isFullscreen]);

  return { isFullscreen, toggleFullscreen };
}
