(() => {
  "use strict";

  const root = document.documentElement;
  const renderMode = new URLSearchParams(window.location.search).get("render") === "1";

  if (renderMode) {
    root.classList.add("architecture-static");
    return;
  }

  function replayArchitectureFlow() {
    root.classList.remove("architecture-motion");
    void root.offsetWidth;
    requestAnimationFrame(() => root.classList.add("architecture-motion"));
  }

  document.addEventListener("DOMContentLoaded", replayArchitectureFlow, { once: true });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) replayArchitectureFlow();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "r" && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      replayArchitectureFlow();
    }
  });

  window.replayArchitectureFlow = replayArchitectureFlow;
})();
