// Slide navigation: mouse, keyboard, touch, progress indicator — Section 10/11.

export function createNavigator(slides, { onChange } = {}) {
  let current = 0;

  function apply() {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === current);
    });
    if (onChange) onChange(current, slides[current]);
    history.replaceState(null, "", `#slide-${current + 1}`);
  }

  function goTo(index) {
    if (index < 0 || index >= slides.length || index === current) return;
    current = index;
    apply();
  }

  function next() {
    goTo(current + 1);
  }

  function prev() {
    goTo(current - 1);
  }

  function first() {
    goTo(0);
  }

  function last() {
    goTo(slides.length - 1);
  }

  function getCurrent() {
    return current;
  }

  // Deep-link support: #slide-4 opens directly to slide 4
  const hashMatch = window.location.hash.match(/^#slide-(\d+)$/);
  if (hashMatch) {
    const requested = parseInt(hashMatch[1], 10) - 1;
    if (requested >= 0 && requested < slides.length) {
      current = requested;
    }
  }

  document.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "ArrowRight":
      case " ":
        event.preventDefault();
        next();
        break;
      case "ArrowLeft":
        event.preventDefault();
        prev();
        break;
      case "Home":
        event.preventDefault();
        first();
        break;
      case "End":
        event.preventDefault();
        last();
        break;
      case "Escape":
        if (document.fullscreenElement) document.exitFullscreen();
        break;
    }
  });

  let touchStartX = null;
  document.addEventListener("touchstart", (event) => {
    touchStartX = event.touches[0].clientX;
  });
  document.addEventListener("touchend", (event) => {
    if (touchStartX === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 60) {
      delta < 0 ? next() : prev();
    }
    touchStartX = null;
  });

  apply();

  return { next, prev, first, last, goTo, getCurrent, total: slides.length };
}

export function setupFullscreenToggle(button) {
  button.addEventListener("click", () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  });
}
