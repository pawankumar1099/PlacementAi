import { h, clear, toast } from "../ui.js";
import { api } from "../api.js";

export function renderAuth(root, onAuthed) {
  let mode = "login";
  let error = "";
  let loading = false;

  function render() {
    clear(root);
    const card = h("div", { class: "auth-card" });

    card.appendChild(h("div", { class: "brand" },
      h("span", { class: "brand-dot" }),
      "Placement AI"
    ));
    card.appendChild(h("h1", {}, mode === "login" ? "Welcome back" : "Create your account"));
    card.appendChild(h("p", { class: "lead" },
      mode === "login"
        ? "Practice MCQs, coding rounds, and resume reviews."
        : "Join in seconds and start your placement prep."
    ));

    const tabs = h("div", { class: "tab-bar" });
    const loginBtn = h("button", {
      class: mode === "login" ? "active" : "",
      onClick: () => { mode = "login"; error = ""; render(); }
    }, "Log in");
    const signupBtn = h("button", {
      class: mode === "signup" ? "active" : "",
      onClick: () => { mode = "signup"; error = ""; render(); }
    }, "Sign up");
    tabs.append(loginBtn, signupBtn);
    card.appendChild(tabs);

    if (error) {
      card.appendChild(h("div", { class: "form-error" }, error));
    }

    const nameInput = h("input", { type: "text", placeholder: "Jane Doe", autocomplete: "name" });
    const emailInput = h("input", { type: "email", placeholder: "you@example.com", autocomplete: "email", required: true });
    const passInput = h("input", { type: "password", placeholder: "••••••••", autocomplete: mode === "login" ? "current-password" : "new-password", required: true });

    const form = h("form", {
      onSubmit: async (e) => {
        e.preventDefault();
        if (loading) return;
        error = "";
        loading = true;
        render.lastSubmit && render.lastSubmit();
        try {
          let user;
          if (mode === "signup") {
            if (!nameInput.value.trim()) throw new Error("Name is required");
            await api.signup({
              name: nameInput.value.trim(),
              email: emailInput.value.trim(),
              password: passInput.value,
            });
            toast("Account created! Please log in.", "success");
            mode = "login";
            loading = false;
            error = "";
            render();
            return;
          } else {
            user = await api.login({
              email: emailInput.value.trim(),
              password: passInput.value,
            });
            toast(`Welcome back, ${user.name || ""}`.trim(), "success");
          }
          onAuthed(user);
        } catch (err) {
          error = err.message || "Something went wrong";
          loading = false;
          render();
        }
      }
    });

    if (mode === "signup") {
      form.appendChild(h("div", { class: "form-row" },
        h("label", {}, "Name"),
        nameInput
      ));
    }
    form.appendChild(h("div", { class: "form-row" },
      h("label", {}, "Email"),
      emailInput
    ));
    form.appendChild(h("div", { class: "form-row" },
      h("label", {}, "Password"),
      passInput
    ));

    const submit = h("button", { class: "btn-primary", type: "submit", disabled: loading || false },
      loading ? "Please wait…" : (mode === "login" ? "Log in" : "Create account")
    );
    form.appendChild(h("div", { class: "form-actions" }, submit));

    card.appendChild(form);

    // Restore focus to email when re-rendering
    setTimeout(() => {
      if (mode === "signup" && !nameInput.value) nameInput.focus();
      else if (!emailInput.value) emailInput.focus();
    }, 0);

    root.appendChild(h("div", { class: "auth-wrap" }, card));
  }

  render();
}
