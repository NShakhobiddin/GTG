const header = document.querySelector("[data-header]");
const progress = document.querySelector(".scroll-progress span");
const hero = document.querySelector("[data-hero]");
const heroScene = document.querySelector(".hero-scene");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function createStars() {
  const stars = document.querySelector("[data-stars]");
  if (!stars) return;

  const fragment = document.createDocumentFragment();
  const amount = window.innerWidth < 600 ? 42 : 76;

  for (let index = 0; index < amount; index += 1) {
    const star = document.createElement("i");
    const size = index % 9 === 0 ? 3 : index % 4 === 0 ? 2 : 1;
    star.style.left = `${(index * 37.71) % 100}%`;
    star.style.top = `${4 + ((index * 19.37) % 57)}%`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.setProperty("--duration", `${3 + (index % 5)}s`);
    star.style.setProperty("--delay", `${(index % 11) * -0.43}s`);
    fragment.append(star);
  }

  stars.append(fragment);
}

createStars();

function updateScrollState() {
  const scrollTop = window.scrollY;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollable > 0 ? scrollTop / scrollable : 0;

  header?.classList.toggle("scrolled", scrollTop > 35);
  if (progress) progress.style.transform = `scaleX(${clamp(ratio, 0, 1)})`;

  if (hero && heroScene && !reduceMotion) {
    const heroHeight = hero.offsetHeight;
    const heroRatio = clamp(scrollTop / Math.max(heroHeight, 1), 0, 1);
    heroScene.style.setProperty("--hero-offset", `${scrollTop * -0.13}px`);
    heroScene.style.setProperty("--hero-scale", `${heroRatio * 0.035}`);
  }
}

let scrollTicking = false;
window.addEventListener(
  "scroll",
  () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      updateScrollState();
      scrollTicking = false;
    });
  },
  { passive: true },
);

updateScrollState();

if (hero && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
  const layers = hero.querySelectorAll(".scene-layer[data-depth]");

  hero.addEventListener("pointermove", (event) => {
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;

    layers.forEach((layer) => {
      const depth = Number(layer.dataset.depth || 0);
      layer.style.transform = `translate3d(${x * depth * 90}px, ${y * depth * 55}px, 0)`;
    });
  });

  hero.addEventListener("pointerleave", () => {
    layers.forEach((layer) => {
      layer.style.transform = "translate3d(0, 0, 0)";
    });
  });
}

if (menuToggle && mobileMenu) {
  const closeMenu = () => {
    menuToggle.classList.remove("active");
    mobileMenu.classList.remove("open");
    header?.classList.remove("menu-active");
    document.body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Menyuni ochish");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeMenu();
      return;
    }

    menuToggle.classList.add("active");
    mobileMenu.classList.add("open");
    header?.classList.add("menu-active");
    document.body.classList.add("menu-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Menyuni yopish");
  });

  mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
}

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in-view");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.08, rootMargin: "0px 0px -8%" },
);

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 65}ms`;
  revealObserver.observe(element);
});

document.querySelectorAll(".course-item .course-button").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".course-item");
    if (!item) return;
    const wasOpen = item.classList.contains("open");

    document.querySelectorAll(".course-item").forEach((course) => {
      course.classList.remove("open");
      course.querySelector(".course-button")?.setAttribute("aria-expanded", "false");
    });

    if (!wasOpen) {
      item.classList.add("open");
      button.setAttribute("aria-expanded", "true");
    }
  });
});

document.querySelectorAll(".accordion-item button").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".accordion-item");
    if (!item) return;
    const wasOpen = item.classList.contains("open");

    document.querySelectorAll(".accordion-item").forEach((accordionItem) => {
      accordionItem.classList.remove("open");
      accordionItem.querySelector("button")?.setAttribute("aria-expanded", "false");
    });

    if (!wasOpen) {
      item.classList.add("open");
      button.setAttribute("aria-expanded", "true");
    }
  });
});

const methodVisual = document.querySelector("[data-method-visual]");
const methodCore = methodVisual?.querySelector(".method-core");
const methodLabel = methodVisual?.querySelector("[data-method-label]");
const methodSteps = document.querySelectorAll(".method-step");

if (methodVisual && methodCore && methodLabel && methodSteps.length) {
  const setActiveMethod = (activeStep) => {
    methodSteps.forEach((step) => step.classList.toggle("active", step === activeStep));
    methodCore.textContent = activeStep.dataset.step || "01";
    methodLabel.textContent = activeStep.dataset.label || "Anglash";
  };

  const methodObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveMethod(visible.target);
    },
    { threshold: [0.35, 0.55, 0.75], rootMargin: "-22% 0px -36%" },
  );

  methodSteps.forEach((step) => methodObserver.observe(step));
}

