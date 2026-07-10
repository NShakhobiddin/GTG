const header = document.querySelector("[data-header]");
const progress = document.querySelector(".scroll-progress span");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function updateScrollUI() {
  const scrollTop = window.scrollY;
  const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = pageHeight > 0 ? scrollTop / pageHeight : 0;

  header?.classList.toggle("scrolled", scrollTop > 20);
  if (progress) progress.style.transform = `scaleX(${clamp(ratio, 0, 1)})`;

  if (!reduceMotion) {
    document.querySelectorAll("[data-parallax]").forEach((element) => {
      const speed = Number(element.dataset.parallax || 0);
      element.style.transform = `translate3d(0, ${scrollTop * speed}px, 0)`;
    });
  }
}

let scrollTicking = false;
window.addEventListener(
  "scroll",
  () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        updateScrollUI();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  },
  { passive: true },
);
updateScrollUI();

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
  { rootMargin: "0px 0px -8%", threshold: 0.08 },
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const numberFormatter = new Intl.NumberFormat("uz-UZ");
const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const target = Number(element.dataset.counter || 0);
      const duration = reduceMotion ? 0 : 1500;
      const start = performance.now();

      const draw = (now) => {
        const elapsed = duration === 0 ? 1 : clamp((now - start) / duration, 0, 1);
        const eased = 1 - Math.pow(1 - elapsed, 4);
        element.textContent = numberFormatter.format(Math.round(target * eased));
        if (elapsed < 1) requestAnimationFrame(draw);
      };

      requestAnimationFrame(draw);
      observer.unobserve(element);
    });
  },
  { threshold: 0.7 },
);

document.querySelectorAll("[data-counter]").forEach((counter) => counterObserver.observe(counter));

document.querySelectorAll(".accordion-item button").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".accordion-item");
    const wasOpen = item?.classList.contains("open");

    document.querySelectorAll(".accordion-item").forEach((accordionItem) => {
      accordionItem.classList.remove("open");
      accordionItem.querySelector("button")?.setAttribute("aria-expanded", "false");
    });

    if (!wasOpen && item) {
      item.classList.add("open");
      button.setAttribute("aria-expanded", "true");
    }
  });
});

const tiltCard = document.querySelector("[data-tilt]");
if (tiltCard && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
  tiltCard.addEventListener("pointermove", (event) => {
    const rect = tiltCard.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    tiltCard.style.transform = `perspective(1000px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
  });

  tiltCard.addEventListener("pointerleave", () => {
    tiltCard.style.transform = "perspective(1000px) rotateY(0) rotateX(0)";
  });
}

