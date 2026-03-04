import { useEffect } from "react";

function upsertMeta(selector, attributes) {
  let tag = document.querySelector(selector);

  if (!tag) {
    tag = document.createElement("meta");
    Object.entries(attributes).forEach(([key, value]) => {
      if (key !== "content") {
        tag.setAttribute(key, value);
      }
    });
    document.head.appendChild(tag);
  }

  if (attributes.content) {
    tag.setAttribute("content", attributes.content);
  }
}

function normalizePath(pathname = "/") {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function usePageSeo({ title, description, path }) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    const pathname = normalizePath(path || window.location.pathname);
    const canonicalUrl = `${window.location.origin}${pathname}`;

    let canonical = document.querySelector('link[rel="canonical"]');

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }

    canonical.setAttribute("href", canonicalUrl);
    upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: canonicalUrl,
    });
    upsertMeta('meta[name="twitter:url"]', {
      name: "twitter:url",
      content: canonicalUrl,
    });

    if (!description) {
      return;
    }

    upsertMeta('meta[name="description"]', {
      name: "description",
      content: description,
    });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: description,
    });
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: description,
    });
  }, [title, description, path]);
}
