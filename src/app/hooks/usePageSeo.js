import { useEffect } from "react";

export function usePageSeo({ title, description }) {
  useEffect(() => {
    const baseUrl = "https://www.omerzahid.com";
    const imageUrl = `${baseUrl}/OMER_ZAHID.jpeg`;
    const canonicalUrl = `${baseUrl}${window.location.pathname || "/"}`;

    const upsertMetaByName = (name, content) => {
      if (!content) {
        return;
      }

      const existing = document.querySelector(`meta[name="${name}"]`);
      if (existing) {
        existing.setAttribute("content", content);
        return;
      }

      const meta = document.createElement("meta");
      meta.setAttribute("name", name);
      meta.setAttribute("content", content);
      document.head.appendChild(meta);
    };

    const upsertMetaByProperty = (property, content) => {
      if (!content) {
        return;
      }

      const existing = document.querySelector(`meta[property="${property}"]`);
      if (existing) {
        existing.setAttribute("content", content);
        return;
      }

      const meta = document.createElement("meta");
      meta.setAttribute("property", property);
      meta.setAttribute("content", content);
      document.head.appendChild(meta);
    };

    const upsertCanonical = (href) => {
      if (!href) {
        return;
      }

      const existing = document.querySelector('link[rel="canonical"]');
      if (existing) {
        existing.setAttribute("href", href);
        return;
      }

      const link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      link.setAttribute("href", href);
      document.head.appendChild(link);
    };

    if (title) {
      document.title = title;
    }

    if (description) {
      upsertMetaByName("description", description);
      upsertMetaByProperty("og:description", description);
      upsertMetaByName("twitter:description", description);
      upsertMetaByName("twitter:title", title || "Omer Zahid");
      upsertMetaByProperty("og:title", title || "Omer Zahid");
      upsertMetaByName("twitter:image", imageUrl);
    }

    upsertMetaByProperty("og:image", imageUrl);
    upsertMetaByName("twitter:image", imageUrl);
    upsertMetaByProperty("og:url", canonicalUrl);
    upsertMetaByName("twitter:url", canonicalUrl);
    upsertCanonical(canonicalUrl);
  }, [title, description]);
}
