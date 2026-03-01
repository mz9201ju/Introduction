import { useEffect } from "react";
import { usePageSeo } from "@app/hooks/usePageSeo";

export function useAskMePageSetup() {
  usePageSeo({
    title: "Ask Me | Omer Zahid",
    description:
      "Chat with Omer AI to learn about Omer Zahid’s experience, projects, and technical stack through a fast, interactive terminal-style portfolio assistant.",
  });

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const updateViewportVars = () => {
      const viewportWidth = window.visualViewport?.width || window.innerWidth || window.screen.width;
      const viewportHeight = window.visualViewport?.height || window.innerHeight || window.screen.height;
      const viewportTop = window.visualViewport?.offsetTop || 0;
      const keyboardInset = Math.max(0, (window.innerHeight || viewportHeight) - (viewportHeight + viewportTop));

      document.documentElement.style.setProperty("--askme-vh", `${viewportHeight * 0.01}px`);
      document.documentElement.style.setProperty("--askme-vw", `${viewportWidth * 0.01}px`);
      document.documentElement.style.setProperty("--askme-vv-top", `${viewportTop}px`);
      document.documentElement.style.setProperty("--askme-keyboard-inset", `${keyboardInset}px`);
    };

    updateViewportVars();

    window.addEventListener("resize", updateViewportVars, { passive: true });
    window.addEventListener("orientationchange", updateViewportVars, { passive: true });
    document.addEventListener("fullscreenchange", updateViewportVars);
    window.visualViewport?.addEventListener("resize", updateViewportVars, { passive: true });
    window.visualViewport?.addEventListener("scroll", updateViewportVars, { passive: true });

    return () => {
      window.removeEventListener("resize", updateViewportVars);
      window.removeEventListener("orientationchange", updateViewportVars);
      document.removeEventListener("fullscreenchange", updateViewportVars);
      window.visualViewport?.removeEventListener("resize", updateViewportVars);
      window.visualViewport?.removeEventListener("scroll", updateViewportVars);
      document.documentElement.style.removeProperty("--askme-vh");
      document.documentElement.style.removeProperty("--askme-vw");
      document.documentElement.style.removeProperty("--askme-vv-top");
      document.documentElement.style.removeProperty("--askme-keyboard-inset");
    };
  }, []);

  useEffect(() => {
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    let createdViewport = false;

    if (!viewportMeta) {
      viewportMeta = document.createElement("meta");
      viewportMeta.name = "viewport";
      document.head.appendChild(viewportMeta);
      createdViewport = true;
    }

    const previousViewportContent = viewportMeta.getAttribute("content");
    viewportMeta.setAttribute(
      "content",
      "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
    );

    return () => {
      if (previousViewportContent) {
        viewportMeta.setAttribute("content", previousViewportContent);
      } else if (createdViewport) {
        viewportMeta.remove();
      }
    };
  }, []);
}
