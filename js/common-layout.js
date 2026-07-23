window.loadTrackitCommonLayout = async function loadTrackitCommonLayout({ pageScript } = {}) {
  const root = document.getElementById("common-root");
  if (!root) return;

  const response = await fetch(new URL("common.html", document.baseURI).href);
  if (!response.ok) throw new Error(`Unable to load common layout: ${response.status}`);

  root.innerHTML = await response.text();
  const slot = document.querySelector("[data-common-page-slot]");
  if (slot) {
    const pageRoot = document.createElement("section");
    pageRoot.className = "page active space-y-6";
    pageRoot.dataset.pageRoot = "";
    slot.appendChild(pageRoot);
  }

  const loadScript = src => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", () => reject(new Error(`Unable to load script: ${src}`)), { once: true });
    document.body.appendChild(script);
  });

  if (pageScript) await loadScript(pageScript);
  await loadScript("js/trackit-app.js");

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      document.dispatchEvent(new Event("trackit:ready"));
    }, { once: true });
  } else {
    if (typeof window.bootTrackit === "function") window.bootTrackit();
    document.dispatchEvent(new Event("trackit:ready"));
  }
};
