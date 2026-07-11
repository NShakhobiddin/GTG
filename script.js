const header = document.querySelector("[data-header]");
const progress = document.querySelector(".scroll-progress span");
const hero = document.querySelector("[data-hero]");
const heroScene = document.querySelector(".hero-scene");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileBreakpoint = window.matchMedia("(max-width: 820px)");

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

  if (hero && heroScene && !motionPreference.matches) {
    const heroHeight = hero.offsetHeight;
    const heroScroll = Math.min(scrollTop, heroHeight);
    const heroRatio = clamp(heroScroll / Math.max(heroHeight, 1), 0, 1);
    heroScene.style.setProperty("--hero-offset", `${heroScroll * -0.13}px`);
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

window.addEventListener("resize", () => requestAnimationFrame(updateScrollState), { passive: true });

if (hero && !motionPreference.matches && window.matchMedia("(pointer: fine)").matches) {
  const layers = hero.querySelectorAll(".scene-layer[data-depth]");
  let pointerFrame = 0;
  let pointerX = 0;
  let pointerY = 0;

  hero.addEventListener("pointermove", (event) => {
    pointerX = event.clientX / window.innerWidth - 0.5;
    pointerY = event.clientY / window.innerHeight - 0.5;
    if (pointerFrame) return;

    pointerFrame = requestAnimationFrame(() => {
      layers.forEach((layer) => {
        const depth = Number(layer.dataset.depth || 0);
        layer.style.transform = `translate3d(${pointerX * depth * 90}px, ${pointerY * depth * 55}px, 0)`;
      });
      pointerFrame = 0;
    });
  });

  hero.addEventListener("pointerleave", () => {
    if (pointerFrame) cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    layers.forEach((layer) => {
      layer.style.transform = "translate3d(0, 0, 0)";
    });
  });
}

if (menuToggle && mobileMenu) {
  const backgroundRegions = [document.querySelector("main"), document.querySelector(".site-footer")].filter(Boolean);
  const headerBackgroundActions = document.querySelectorAll(".header-inner .brand, .header-social, .header-cta");

  const setBackgroundInert = (isInert) => {
    [...backgroundRegions, ...headerBackgroundActions].forEach((element) => {
      element.toggleAttribute("inert", isInert);
    });
  };

  const closeMenu = (restoreFocus = false) => {
    menuToggle.classList.remove("active");
    mobileMenu.classList.remove("open");
    header?.classList.remove("menu-active");
    document.body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Menyuni ochish");
    mobileMenu.setAttribute("aria-hidden", "true");
    mobileMenu.setAttribute("inert", "");
    setBackgroundInert(false);
    if (restoreFocus) menuToggle.focus();
  };

  const openMenu = () => {
    menuToggle.classList.add("active");
    mobileMenu.classList.add("open");
    header?.classList.add("menu-active");
    document.body.classList.add("menu-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Menyuni yopish");
    mobileMenu.setAttribute("aria-hidden", "false");
    mobileMenu.removeAttribute("inert");
    setBackgroundInert(true);
    requestAnimationFrame(() => mobileMenu.querySelector("a")?.focus());
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeMenu();
      return;
    }

    openMenu();
  });

  mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMenu()));

  document.addEventListener("keydown", (event) => {
    if (menuToggle.getAttribute("aria-expanded") !== "true") return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(true);
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = [menuToggle, ...mobileMenu.querySelectorAll("a, button:not([disabled])")];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  mobileBreakpoint.addEventListener?.("change", (event) => {
    if (!event.matches) closeMenu();
  });
}

const revealElements = [...document.querySelectorAll(".reveal")];

if ("IntersectionObserver" in window && !motionPreference.matches) {
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

  revealElements.forEach((element, index) => {
    element.classList.add("reveal-pending");
    element.style.transitionDelay = `${Math.min(index % 4, 3) * 65}ms`;
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => element.classList.add("in-view"));
}

const setDisclosureState = (item, isOpen, buttonSelector, panelSelector) => {
  const button = item.querySelector(buttonSelector);
  const panel = item.querySelector(panelSelector);
  if (!button || !panel) return;

  item.classList.toggle("open", isOpen);
  button.setAttribute("aria-expanded", String(isOpen));
  panel.setAttribute("aria-hidden", String(!isOpen));
  panel.toggleAttribute("inert", !isOpen);
};

const courseItems = [...document.querySelectorAll(".course-item")];
courseItems.forEach((course) => {
  setDisclosureState(course, course.classList.contains("open"), ".course-button", ".course-detail");
});

document.querySelectorAll(".course-item .course-button").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".course-item");
    if (!item) return;
    const wasOpen = item.classList.contains("open");

    courseItems.forEach((course) => setDisclosureState(course, false, ".course-button", ".course-detail"));

    if (!wasOpen) {
      setDisclosureState(item, true, ".course-button", ".course-detail");
    }

    requestAnimationFrame(updateScrollState);
  });
});

const accordionItems = [...document.querySelectorAll(".accordion-item")];
accordionItems.forEach((item) => setDisclosureState(item, item.classList.contains("open"), "button", ":scope > div"));

document.querySelectorAll(".accordion-item button").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".accordion-item");
    if (!item) return;
    const wasOpen = item.classList.contains("open");

    accordionItems.forEach((accordionItem) => setDisclosureState(accordionItem, false, "button", ":scope > div"));

    if (!wasOpen) {
      setDisclosureState(item, true, "button", ":scope > div");
    }

    requestAnimationFrame(updateScrollState);
  });
});

const applicationForm = document.querySelector("[data-application-form]");
const formStatus = document.querySelector("[data-form-status]");

if (applicationForm) {
  applicationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!applicationForm.reportValidity()) return;

    const data = new FormData(applicationForm);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const course = String(data.get("course") || "").trim();
    const message = String(data.get("message") || "").trim();
    const telegramMessage = [
      "Global Trainings saytidan yangi ariza",
      `Ism: ${name}`,
      `Telefon: ${phone}`,
      `Yoʻnalish: ${course}`,
      message ? `Savol yoki maqsad: ${message}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    const telegramUrl = `https://t.me/Global_Admin19?text=${encodeURIComponent(telegramMessage)}`;
    if (formStatus) formStatus.textContent = "Telegram ochilmoqda…";
    window.location.href = telegramUrl;
  });
}

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

  if ("IntersectionObserver" in window) {
    const methodRatios = new Map([...methodSteps].map((step) => [step, 0]));
    const methodObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => methodRatios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0));
        const [activeStep, activeRatio] = [...methodRatios.entries()].sort((a, b) => b[1] - a[1])[0];
        if (activeRatio > 0) setActiveMethod(activeStep);
      },
      { threshold: [0.2, 0.35, 0.55, 0.75], rootMargin: "-22% 0px -36%" },
    );

    methodSteps.forEach((step) => methodObserver.observe(step));
  } else {
    setActiveMethod(methodSteps[0]);
  }
}

document.querySelectorAll('a[target="_blank"]').forEach((link) => {
  const visibleLabel = link.textContent.replace(/[↗↓↑]/g, "").replace(/\s+/g, " ").trim();
  const baseLabel = link.getAttribute("aria-label") || visibleLabel;
  link.setAttribute("aria-label", `${baseLabel} — yangi oynada ochiladi`);
});

motionPreference.addEventListener?.("change", (event) => {
  if (!event.matches) return;
  heroScene?.style.setProperty("--hero-offset", "0px");
  heroScene?.style.setProperty("--hero-scale", "0");
  hero?.querySelectorAll(".scene-layer[data-depth]").forEach((layer) => {
    layer.style.transform = "translate3d(0, 0, 0)";
  });
});

