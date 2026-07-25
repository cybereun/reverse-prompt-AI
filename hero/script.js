const resultData = {
  subway: {
    src: "./assets/example-edited-subway.jpg",
    alt: "지하철 장면으로 변환한 결과 이미지",
    title: "새로운 지하철 장면",
  },
  stairs: {
    src: "./assets/example-edited-stairs.jpg",
    alt: "계단 장면으로 변환한 결과 이미지",
    title: "새로운 계단 장면",
  },
};

const preview = document.querySelector("#result-preview");
const resultTitle = document.querySelector("#result-title");
const tabs = document.querySelectorAll(".result-tab");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const next = resultData[tab.dataset.result];
    if (!next || !preview || !resultTitle) return;

    tabs.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-selected", "false");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");

    preview.style.opacity = "0";
    window.setTimeout(() => {
      preview.src = next.src;
      preview.alt = next.alt;
      resultTitle.textContent = next.title;
      preview.style.opacity = "1";
    }, 150);
  });
});

const revealItems = document.querySelectorAll(".reveal");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );
  revealItems.forEach((item) => observer.observe(item));
}
