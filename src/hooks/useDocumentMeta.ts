import { useEffect } from "react";
import { SEO_DEFAULTS } from "@/lib/seo";

interface DocumentMeta {
  title: string;
  description?: string;
}

/**
 * Sets `document.title` and the `<meta name="description">` tag
 * for the current page. Reverts to defaults on unmount.
 */
const useDocumentMeta = ({ title, description }: DocumentMeta) => {
  useEffect(() => {
    // --- title ---
    const prevTitle = document.title;
    document.title = title;

    // --- description ---
    let metaDesc = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    );
    const prevDesc = metaDesc?.content ?? "";

    if (description) {
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = description;
    }

    // --- og:title ---
    const ogTitle = document.querySelector<HTMLMetaElement>(
      'meta[property="og:title"]'
    );
    if (ogTitle) ogTitle.content = title;

    // --- og:description ---
    const ogDesc = document.querySelector<HTMLMetaElement>(
      'meta[property="og:description"]'
    );
    if (ogDesc && description) ogDesc.content = description;

    // --- twitter:title ---
    const twTitle = document.querySelector<HTMLMetaElement>(
      'meta[name="twitter:title"]'
    );
    if (twTitle) twTitle.content = title;

    // --- twitter:description ---
    const twDesc = document.querySelector<HTMLMetaElement>(
      'meta[name="twitter:description"]'
    );
    if (twDesc && description) twDesc.content = description;

    return () => {
      document.title = prevTitle || SEO_DEFAULTS.title;
      if (metaDesc) metaDesc.content = prevDesc || SEO_DEFAULTS.description;
      if (ogTitle) ogTitle.content = prevTitle || SEO_DEFAULTS.title;
      if (ogDesc) ogDesc.content = prevDesc || SEO_DEFAULTS.description;
      if (twTitle) twTitle.content = prevTitle || SEO_DEFAULTS.title;
      if (twDesc) twDesc.content = prevDesc || SEO_DEFAULTS.description;
    };
  }, [title, description]);
};

export default useDocumentMeta;
