import { h, clear, toast, initials } from "./ui.js";
import { api } from "./api.js";
import { renderAuth } from "./views/auth.js";
import { renderDashboard } from "./views/dashboard.js";
import { renderSession } from "./views/session.js";

const root = document.getElementById("app");

let state = {
  user: null,
  view: "dashboard", // "dashboard" | "session"
  session: null,     // { company } when in session
};

async function start() {
  clear(root);
  root.appendChild(h("div", { class: "auth-wrap" },
    h("div", { class: "row", style: { gap: "10px", color: "var(--text-dim)" } },
      h("span", { class: "spinner" }), h("span", {}, "Loading…")
    )
  ));

  try {
    const me = await api.me();
    state.user = me;
    renderApp();
  } catch (err) {
    renderAuth(root, (user) => {
      state.user = user;
      state.view = "dashboard";
      state.session = null;
      renderApp();
    });
  }
}

function renderApp() {
  clear(root);
  const wrap = h("div", { class: "app" });

  // Sidebar
  const sidebar = h("div", { class: "sidebar" });
  sidebar.appendChild(h("div", { class: "brand" },
    h("span", { class: "brand-dot" }),
    "Placement AI"
  ));

  const homeItem = h("div", {
    class: "nav-item" + (state.view === "dashboard" ? " active" : ""),
    onClick: goHome,
  },
    h("span", { class: "ico" }, h("i", { class: "fa-solid fa-building" })),
    h("span", {}, "Companies")
  );
  sidebar.appendChild(homeItem);

  if (state.view === "session" && state.session) {
    sidebar.appendChild(h("div", { class: "nav-item active" },
      h("span", { class: "ico" }, h("i", { class: "fa-solid fa-play" })),
      h("span", {}, state.session.company),
    ));
  }

  const foot = h("div", { class: "sidebar-foot" });
  foot.appendChild(h("div", { class: "user-chip" },
    h("div", { class: "avatar" }, initials(state.user?.name)),
    h("div", {},
      h("div", { style: { color: "var(--text)", fontWeight: 600, fontSize: "13px" } }, state.user?.name || "—"),
      h("div", { style: { fontSize: "12px", color: "var(--text-muted)" } }, state.user?.email || "")
    )
  ));
  foot.appendChild(h("button", {
    class: "btn-ghost",
    style: { width: "100%" },
    onClick: async () => {
      try { await api.logout(); } catch (_) {}
      state.user = null;
      state.view = "dashboard";
      state.session = null;
      toast("Signed out", "info");
      start();
    }
  }, "Log out"));
  sidebar.appendChild(foot);

  wrap.appendChild(sidebar);

  // Main area
  const main = h("div", { class: "main" });
  wrap.appendChild(main);
  root.appendChild(wrap);

  if (state.view === "session" && state.session) {
    renderSession(main, {
      company: state.session.company,
      exit: goHome,
    });
  } else {
    renderDashboard(main, {
      user: state.user,
      startSession: (company) => {
        state.view = "session";
        state.session = { company };
        renderApp();
      }
    });
  }
}

function goHome() {
  state.view = "dashboard";
  state.session = null;
  renderApp();
}

start();
