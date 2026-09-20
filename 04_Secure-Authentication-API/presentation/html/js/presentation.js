import { playSlideAnimations } from "./animations.js";
import { createNavigator, setupFullscreenToggle } from "./navigation.js";

const STAGE_WIDTH = 1920;
const STAGE_HEIGHT = 1080;

function scaleStage() {
  const stage = document.querySelector(".stage");
  const scale = Math.min(window.innerWidth / STAGE_WIDTH, window.innerHeight / STAGE_HEIGHT);
  stage.style.transform = `scale(${scale})`;
}

function buildProgressDots(container, total, navigator) {
  for (let i = 0; i < total; i++) {
    const dot = document.createElement("button");
    dot.className = "progress-dot";
    dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
    dot.addEventListener("click", () => navigator.goTo(i));
    container.appendChild(dot);
  }
}

function init() {
  scaleStage();
  window.addEventListener("resize", scaleStage);

  const slides = Array.from(document.querySelectorAll(".slide"));
  const counterEl = document.getElementById("slide-counter");
  const progressFill = document.getElementById("progress-fill");
  const dotsContainer = document.getElementById("progress-dots");
  const prevBtn = document.getElementById("nav-prev");
  const nextBtn = document.getElementById("nav-next");
  const fullscreenBtn = document.getElementById("nav-fullscreen");

  const navigator = createNavigator(slides, {
    onChange(index, slide) {
      const total = slides.length;
      counterEl.textContent = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
      progressFill.style.width = `${((index + 1) / total) * 100}%`;
      dotsContainer.querySelectorAll(".progress-dot").forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
      });
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === total - 1;
      playSlideAnimations(slide);
    },
  });

  buildProgressDots(dotsContainer, slides.length, navigator);
  navigator.goTo(navigator.getCurrent()); // trigger initial onChange (dots/counter/animations)

  prevBtn.addEventListener("click", () => navigator.prev());
  nextBtn.addEventListener("click", () => navigator.next());
  setupFullscreenToggle(fullscreenBtn);
}

document.addEventListener("DOMContentLoaded", init);
