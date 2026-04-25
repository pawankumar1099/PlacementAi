import { h } from "../ui.js";

const COMPANIES = [
  { name: "Google",    icon: "fa-brands fa-google", color: "#334155" },
  { name: "Microsoft", icon: "fa-brands fa-microsoft", color: "#334155" },
  { name: "Amazon",    icon: "fa-brands fa-amazon", color: "#334155" },
  { name: "Meta",      icon: "fa-brands fa-meta", color: "#334155" },
  { name: "Apple",     icon: "fa-brands fa-apple", color: "#334155" },
  { name: "TCS",       icon: "fa-solid fa-building", color: "#334155" },
  { name: "Infosys",   icon: "fa-solid fa-briefcase", color: "#334155" },
  { name: "Wipro",     icon: "fa-solid fa-bolt", color: "#334155" },
];

export function renderDashboard(main, ctx) {
  const { user, startSession } = ctx;

  main.appendChild(h("div", { class: "page-head" },
    h("h1", {}, `Hi ${user.name?.split(" ")[0] || "there"} — pick a company`),
    h("p", {}, "Choose a target company to begin your practice round.")
  ));

  const grid = h("div", { class: "company-grid" });
  COMPANIES.forEach(c => {
    grid.appendChild(h("div", {
      class: "company-tile",
      onClick: () => startSession(c.name),
      style: { "--accent": c.color }
    },
      h("div", { class: "company-emoji" }, h("i", { class: c.icon })),
      h("div", { class: "company-name" }, c.name),
      h("div", { class: "company-cta" }, "Start practice round"),
    ));
  });
  main.appendChild(grid);

  main.appendChild(h("div", { class: "card", style: { marginTop: "24px" } },
    h("h3", {}, "Preparation Roadmap"),
    h("div", { class: "round-steps", style: { marginTop: "16px" } },
      stepHint("1", "fa-file-lines", "Resume Analysis", "Instant ATS-style score and formatting feedback."),
      stepHint("2", "fa-brain", "Aptitude Assessment", "Quantitative and logical reasoning quiz."),
      stepHint("3", "fa-code", "Coding Challenge", "Submit solutions for technical problems."),
      stepHint("4", "fa-chart-simple", "Readiness Report", "A complete overview of your preparation status."),
    )
  ));
}

function stepHint(n, icon, title, desc) {
  return h("div", { class: "step-hint" },
    h("div", { class: "step-num" }, n),
    h("div", { class: "step-emoji" }, h("i", { class: `fa-solid ${icon}` })),
    h("div", {},
      h("div", { style: { fontWeight: 600 } }, title),
      h("div", { style: { color: "var(--text-dim)", fontSize: "13px" } }, desc),
    )
  );
}
