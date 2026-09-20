// Staggered reveal for a slide's [data-reveal] children, and count-up for [data-count-to].

export function playSlideAnimations(slide) {
  const revealed = slide.querySelectorAll("[data-reveal]");
  revealed.forEach((el, i) => {
    el.style.setProperty("--delay", `${i * 90}ms`);
    // restart the animation each time the slide becomes active
    el.classList.remove("reveal", "reveal-scale");
    void el.offsetWidth; // force reflow so the animation restarts
    el.classList.add(el.dataset.reveal === "scale" ? "reveal-scale" : "reveal");
  });

  const counters = slide.querySelectorAll("[data-count-to]");
  counters.forEach((el) => {
    const target = parseInt(el.dataset.countTo, 10);
    const duration = 900;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * progress);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}
