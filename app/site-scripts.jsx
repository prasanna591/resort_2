"use client";

import { useEffect } from "react";

const scriptSources = ["/js/site-custom.js"];

function loadScript(src) {
  return new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = resolve;
    script.onerror = resolve;
    document.body.appendChild(script);
  });
}

export default function SiteScripts() {
  useEffect(() => {
    let cancelled = false;

    const revealHiddenElements = () => {
      if (document.documentElement.classList.contains("w-mod-ix")) return;
      document.querySelectorAll('[style*="opacity: 0"]').forEach((element) => {
        element.style.opacity = "1";
        element.style.transform = "none";
      });
      document.querySelector(".preloader")?.setAttribute("style", "display:none");
    };

    const fallbackTimer = window.setTimeout(revealHiddenElements, 2500);

    const loadAll = async () => {
      for (const src of scriptSources) {
        if (cancelled) return;
        await loadScript(src);
      }
      if (!cancelled) {
        window.setTimeout(revealHiddenElements, 400);
      }
    };

    loadAll();

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  return null;
}
