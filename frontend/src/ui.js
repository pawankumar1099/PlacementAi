// Tiny DOM helpers and shared UI bits.

export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;
    else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
    else if (k.startsWith("on") && typeof v === "function") {
      el.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (v !== false && v !== null && v !== undefined) {
      el.setAttribute(k, v === true ? "" : v);
    }
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    el.appendChild(typeof child === "string" || typeof child === "number"
      ? document.createTextNode(String(child))
      : child);
  }
  return el;
}

export function clear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

export function toast(msg, type = "info", timeout = 2800) {
  const c = document.getElementById("toast-container");
  const t = h("div", { class: `toast ${type}` }, msg);
  c.appendChild(t);
  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateX(20px)";
    t.style.transition = "all .2s ease";
    setTimeout(() => t.remove(), 220);
  }, timeout);
}

export function spinnerEl(label = "") {
  return h("div", { class: "row", style: { gap: "8px" } },
    h("span", { class: "spinner" }),
    label ? h("span", { style: { color: "var(--text-dim)", fontSize: "13px" } }, label) : null
  );
}

export function initials(name = "?") {
  return name.split(" ").map(s => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";
}
