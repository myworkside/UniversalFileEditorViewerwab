const root = document.body;
const themeToggle = document.querySelector(".theme-toggle");
const revealEls = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll(".counter");
const shots = document.querySelectorAll("[data-shot]");
const lightbox = document.getElementById("lightbox");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxLabel = document.getElementById("lightboxLabel");
const lightboxText = document.getElementById("lightboxText");
const lightboxDevice = document.getElementById("lightboxDevice");

const storedTheme = localStorage.getItem("ufe-theme");
const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
const initialTheme = storedTheme || (systemPrefersLight ? "light" : "dark");

function applyTheme(theme) {
  root.dataset.theme = theme;
  const isLight = theme === "light";
  themeToggle.setAttribute("aria-pressed", String(isLight));
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", isLight ? "#eff2ff" : "#130d28");
}

applyTheme(initialTheme);

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
  localStorage.setItem("ufe-theme", nextTheme);
  applyTheme(nextTheme);
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.14 }
  );

  revealEls.forEach((el) => revealObserver.observe(el));
}

function animateCounter(el, target) {
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  const duration = 1500;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    el.textContent = `${prefix}${value}${suffix}`;
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

if (counters.length) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          animateCounter(entry.target, Number(entry.target.dataset.count || 0));
          counterObserver.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

const lightboxCopyMap = {
  Dashboard: {
    label: "Product Preview",
    title: "Dashboard",
    text: "A polished file workspace with strong hierarchy, active states, and premium Android UI styling.",
    tone: "blue",
  },
  Vault: {
    label: "Private Vault",
    title: "Encrypted Vault",
    text: "A secure experience emphasizing biometric unlock, encryption, and zero-knowledge privacy cues.",
    tone: "purple",
  },
  Sharing: {
    label: "Wireless Share",
    title: "Fast Transfers",
    text: "Bluetooth and Wi-Fi Direct transfer visuals with progress tracking and verification messaging.",
    tone: "cyan",
  },
};

function buildLightboxPreview(tone) {
  lightboxDevice.className = `device-frame lightbox-device tone-${tone}`;
  lightboxDevice.innerHTML = `
    <span class="frame-notch"></span>
    <span class="frame-screen">
      <span class="shot-topline"></span>
      <span class="shot-main ${tone === "purple" ? "vault" : tone === "cyan" ? "sharing" : ""}"></span>
      <span class="shot-footer"></span>
    </span>
  `;
}

shots.forEach((shot) => {
  shot.addEventListener("click", () => {
    const shotName = shot.dataset.shot || "Preview";
    const meta = lightboxCopyMap[shotName] || lightboxCopyMap.Dashboard;
    lightboxTitle.textContent = meta.title;
    lightboxLabel.textContent = meta.label;
    lightboxText.textContent = meta.text;
    buildLightboxPreview(meta.tone);
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  });
});

function closeLightbox() {
  lightbox.classList.remove("active");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

lightbox?.addEventListener("click", (event) => {
  if (event.target.matches("[data-close-lightbox]")) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox.classList.contains("active")) {
    closeLightbox();
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
