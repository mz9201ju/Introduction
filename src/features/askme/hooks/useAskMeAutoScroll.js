import { useEffect, useRef } from "react";

export function useAskMeAutoScroll({ chatAreaRef, messages, isTyping }) {
  const autoScrollPausedRef = useRef(false);
  const autoScrollTimeoutRef = useRef(null);

  useEffect(() => {
    const chatArea = chatAreaRef.current;
    if (!chatArea) return;

    const handleUserScroll = () => {
      const distanceFromBottom = chatArea.scrollHeight - chatArea.clientHeight - chatArea.scrollTop;
      autoScrollPausedRef.current = distanceFromBottom > 80;

      clearTimeout(autoScrollTimeoutRef.current);
      autoScrollTimeoutRef.current = setTimeout(() => {
        autoScrollPausedRef.current = false;
      }, 1800);
    };

    chatArea.addEventListener("scroll", handleUserScroll, { passive: true });

    return () => {
      chatArea.removeEventListener("scroll", handleUserScroll);
      clearTimeout(autoScrollTimeoutRef.current);
    };
  }, [chatAreaRef]);

  useEffect(() => {
    const chatArea = chatAreaRef.current;
    if (!chatArea || autoScrollPausedRef.current) return;

    chatArea.scrollTo({
      top: chatArea.scrollHeight,
      behavior: "smooth",
    });
  }, [chatAreaRef, isTyping, messages]);

  useEffect(() => {
    return () => {
      clearTimeout(autoScrollTimeoutRef.current);
    };
  }, []);
}
