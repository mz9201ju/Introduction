import { useCallback, useEffect, useRef } from "react";
import { marked } from "marked";

export function useAskMeTypewriter({ setMessages, setIsTyping, setIsMatrixActive }) {
  const typingIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  const startTypewriter = useCallback((text) => {
    const html = marked.parse(text);

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    let index = 0;
    const aiMsg = { role: "assistant", content: "" };
    setMessages((messages) => [...messages, aiMsg]);

    typingIntervalRef.current = setInterval(() => {
      index = Math.min(index + 3, html.length);
      const displayed = html.slice(0, index);

      setMessages((messages) => {
        const updated = [...messages];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          role: "assistant",
          content: displayed,
          isHTML: true,
        };
        return updated;
      });

      if (index >= html.length) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
        setIsTyping(false);
        setIsMatrixActive(false);
      }
    }, 16);
  }, [setIsMatrixActive, setIsTyping, setMessages]);

  return startTypewriter;
}
