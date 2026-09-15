(() => {
  "use strict";

  const slides = [
    "portada_s6.html",
    "propuesta_01_contexto.html",
    "diapositiva-03-crud-mineros.html",
    "diapositiva-04-acopio-g2.html",
    "diapositiva-05-cierre-g1.html",
    "diapositiva-06-regla-cierre.html",
    "diapositiva-07-evidencias.html",
    "diapositiva-08-prometheus.html",
    "diapositiva-09-despedida.html"
  ];

  const frame = document.getElementById("slideFrame");
  const previousButton = document.getElementById("previousSlide");
  const nextButton = document.getElementById("nextSlide");

  const requestedSlide = Number.parseInt(location.hash.replace("#", ""), 10);
  let current = Number.isInteger(requestedSlide)
    ? Math.min(Math.max(requestedSlide - 1, 0), slides.length - 1)
    : 0;

  function updateControls() {
    previousButton.disabled = current === 0;
    nextButton.disabled = current === slides.length - 1;
  }

  function connectSlideNavigation() {
    const slideWindow = frame.contentWindow;
    const slideDocument = frame.contentDocument;

    if (!slideWindow || !slideDocument) return;

    slideWindow.addEventListener("keydown", handleKeydown);

    slideDocument.querySelectorAll(".dots i").forEach((dot, index) => {
      if (index >= slides.length) return;
      dot.setAttribute("role", "button");
      dot.setAttribute("aria-label", `Ir a la diapositiva ${index + 1}`);
      dot.style.cursor = "pointer";
      dot.addEventListener("click", () => showSlide(index));
    });
  }

  function showSlide(index) {
    const nextIndex = Math.min(Math.max(index, 0), slides.length - 1);
    if (nextIndex === current && frame.getAttribute("src")) return;

    current = nextIndex;
    frame.src = slides[current];
    history.replaceState(null, "", `#${current + 1}`);
    updateControls();
  }

  function step(amount) {
    showSlide(current + amount);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  function handleKeydown(event) {
    const key = event.key;

    if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(key)) {
      event.preventDefault();
      step(1);
    } else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(key)) {
      event.preventDefault();
      step(-1);
    } else if (key === "Home") {
      event.preventDefault();
      showSlide(0);
    } else if (key === "End") {
      event.preventDefault();
      showSlide(slides.length - 1);
    } else if (key.toLowerCase() === "f") {
      event.preventDefault();
      toggleFullscreen();
    }
  }

  let touchStartX = null;

  document.addEventListener("keydown", handleKeydown);
  frame.addEventListener("load", connectSlideNavigation);
  previousButton.addEventListener("click", () => step(-1));
  nextButton.addEventListener("click", () => step(1));

  document.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });

  document.addEventListener("touchend", (event) => {
    if (touchStartX === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 70) step(distance < 0 ? 1 : -1);
    touchStartX = null;
  }, { passive: true });

  frame.src = slides[current];
  history.replaceState(null, "", `#${current + 1}`);
  updateControls();
})();
