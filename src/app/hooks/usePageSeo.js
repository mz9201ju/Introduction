import { useEffect } from "react";

export function usePageSeo({ title, description }) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    if (!description) {
      return;
    }

    const metaDesc = document.querySelector('meta[name="description"]');

    if (metaDesc) {
      metaDesc.setAttribute("content", description);
      return;
    }

    const meta = document.createElement("meta");
    meta.name = "description";
    meta.content = description;
    document.head.appendChild(meta);
  }, [title, description]);
}
