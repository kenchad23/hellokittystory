
const TOTAL = 25;

const story = document.getElementById("story");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const music = document.getElementById("music");
const musicBtn = document.getElementById("musicBtn");
const finale = document.getElementById("birthday");
const main = document.querySelector("main");
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

// Your original webp images: 1.png, 2.png, ... 25.png
const photos = Array.from(
  { length: TOTAL },
  (_, i) => `images/${i + 1}.webp`
);

const moods = [
  "#ffe2ec", "#ffe6ef", "#fce2f0", "#f9e3f5", "#f8e5f6",
  "#f2e6fa", "#ece4fb", "#e7e4fb", "#e3e7fb", "#dfeafa",
  "#dae8fa", "#e0e4fa", "#e7e2f7", "#ede1f6", "#f1e2f3",
  "#f6e2ef", "#fbe3ef", "#ffe6ee", "#ffe7ed", "#ffe6f1",
  "#ffe5f2", "#fce4f5", "#f8e4f7", "#f9e3f1", "#ffe4ec"
];

// CREATE ALL 25 STORY PANELS
photos.forEach((src, index) => {
  const section = document.createElement("section");

  section.className = "scene";
  section.id = `scene-${index + 1}`;
  section.style.setProperty("--scene-bg", moods[index]);

  const inner = document.createElement("div");
  inner.className = "scene-inner";

  const label = document.createElement("p");
  label.className = "scene-label";
  label.textContent =
    `Our Story · ${String(index + 1).padStart(2, "0")} / 25`;

  const frame = document.createElement("div");
  frame.className = "photo-frame";

  const img = document.createElement("img");
  img.src = src;
  img.alt = `Hello Kitty Story Panel ${index + 1}`;
  img.loading = index < 2 ? "eager" : "lazy";
  img.decoding = "async";

  // Show the actual photo directly.
  img.style.display = "block";
  img.style.width = "100%";
  img.style.height = "100%";
  img.style.objectFit = "contain";
  img.style.opacity = "1";
  img.style.visibility = "visible";

 img.addEventListener("load", () => {
  inner.classList.add("has-image");
});

  img.addEventListener("error", () => {
    console.error("Could not load:", src);
    frame.textContent = `Could not load ${src}`;
  });

  frame.appendChild(img);
  inner.appendChild(label);
  inner.appendChild(frame);
  section.appendChild(inner);
  story.appendChild(section);
});

// HORIZONTAL NAVIGATION
const slides = [
  document.querySelector(".intro"),
  ...document.querySelectorAll(".scene"),
  finale
];

const scenes = slides.slice(1, -1);

let activeIndex = 0;
let wheelLocked = false;
let unlockTimer;

const clamp = (n) =>
  Math.max(0, Math.min(slides.length - 1, n));

function goToSlide(index, behavior = "smooth") {
  activeIndex = clamp(index);

  slides[activeIndex].scrollIntoView({
    behavior: reducedMotion.matches ? "auto" : behavior,
    inline: "start",
    block: "nearest"
  });

  updateIndicators();
}

function updateIndicators() {
  const count = Math.min(TOTAL, Math.max(0, activeIndex));

  progressText.textContent =
    `${String(count).padStart(2, "0")} / 25`;

  progressBar.style.width = `${(count / TOTAL) * 100}%`;

  const moodIndex = Math.max(
    0,
    Math.min(TOTAL - 1, count - 1)
  );

  document.documentElement.style.setProperty(
    "--bg",
    moods[moodIndex]
  );

  scenes.forEach((scene, i) => {
    scene.classList.toggle(
      "is-active",
      i + 1 === activeIndex
    );
  });
}

// DETECT ACTIVE PANEL
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (
        entry.isIntersecting &&
        entry.intersectionRatio >= 0.6
      ) {
        activeIndex = slides.indexOf(entry.target);
        updateIndicators();
      }
    }
  },
  {
    root: main,
    threshold: [0.6]
  }
);

slides.forEach((slide) => observer.observe(slide));

// MOUSE WHEEL: ONE PANEL PER SCROLL
main.addEventListener(
  "wheel",
  (e) => {
    if (
      Math.abs(e.deltaY) < 5 &&
      Math.abs(e.deltaX) < 5
    ) return;

    e.preventDefault();

    if (wheelLocked) return;

    wheelLocked = true;

    const delta =
      Math.abs(e.deltaX) > Math.abs(e.deltaY)
        ? e.deltaX
        : e.deltaY;

    goToSlide(activeIndex + (delta > 0 ? 1 : -1));

    clearTimeout(unlockTimer);

    unlockTimer = setTimeout(() => {
      wheelLocked = false;
    }, 750);
  },
  { passive: false }
);

// KEYBOARD NAVIGATION
window.addEventListener("keydown", (e) => {
  if (
    ["ArrowRight", "ArrowDown", "PageDown"].includes(e.key)
  ) {
    e.preventDefault();
    goToSlide(activeIndex + 1);
  }

  if (
    ["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)
  ) {
    e.preventDefault();
    goToSlide(activeIndex - 1);
  }
});

// INTRO AND REPLAY LINKS
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const target = document.querySelector(
      link.getAttribute("href")
    );

    const index = slides.indexOf(target);

    if (index >= 0) {
      e.preventDefault();
      goToSlide(index);
    }
  });
});

// MUSIC CONTROL
musicBtn.addEventListener("click", async () => {
  if (!music.paused) {
    music.pause();
    musicBtn.textContent = "♫ Off";
    musicBtn.setAttribute("aria-pressed", "false");
    return;
  }

  try {
    await music.play();
    musicBtn.textContent = "♫ On";
    musicBtn.setAttribute("aria-pressed", "true");
  } catch {
    musicBtn.textContent = "Add audio/music.mp3";
  }
});

// BIRTHDAY FINALE WITH CONFETTI
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");

let particles = [];
let animationId = 0;

function celebrate() {
  if (reducedMotion.matches) return;

  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const dpr = window.devicePixelRatio || 1;

  if (!w || !h) return;

  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const colors = [
    "#f49abc",
    "#a7bde9",
    "#ffe8a1",
    "#ffffff",
    "#c6a4df"
  ];

  particles = Array.from({ length: 110 }, () => ({
    x: Math.random() * w,
    y: -Math.random() * h * 0.9 - 10,
    vx: (Math.random() - 0.5) * 2,
    vy: 1.5 + Math.random() * 2.6,
    size: 3 + Math.random() * 6,
    rotation: Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)]
  }));

  cancelAnimationFrame(animationId);

  let frames = 0;

  function frame() {
    ctx.clearRect(0, 0, w, h);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += 0.04;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;

      ctx.fillRect(
        -p.size / 2,
        -p.size / 2,
        p.size,
        p.size * 0.65
      );

      ctx.restore();
    });

    if (++frames < 340) {
      animationId = requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, w, h);
    }
  }

  frame();
}

// TRIGGER BIRTHDAY SURPRISE
let finaleTriggered = false;

const finaleObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries[0].isIntersecting;

    finale.classList.toggle("is-visible", visible);

    if (visible && !finaleTriggered) {
      finaleTriggered = true;
      celebrate();
    }

    if (!visible) {
      finaleTriggered = false;
    }
  },
  {
    root: main,
    threshold: 0.35
  }
);

finaleObserver.observe(finale);

document
  .getElementById("celebrateBtn")
  .addEventListener("click", celebrate);

// INITIALIZE
updateIndicators();
