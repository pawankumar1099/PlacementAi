import { h, clear, toast, spinnerEl } from "../ui.js";
import { api } from "../api.js";

export async function renderResume(main) {
  main.appendChild(h("div", { class: "page-head" },
    h("h1", {}, "Resume Analyzer"),
    h("p", {}, "Upload your PDF resume — we score it against keywords, sections and length.")
  ));

  const resultArea = h("div", { id: "resume-result" });

  // Upload card
  const fileInput = h("input", {
    type: "file",
    accept: "application/pdf",
    style: { display: "none" },
    onChange: (e) => upload(e.target.files[0])
  });

  const zone = h("div", { class: "upload-zone" },
    h("div", { class: "big" }, "📄"),
    h("div", { style: { fontWeight: 600 } }, "Click or drop a PDF to analyze"),
    h("div", { class: "sub" }, "Max ~5MB · We only use the file text for keyword analysis"),
    fileInput
  );
  zone.addEventListener("click", () => fileInput.click());
  zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("dragover"); });
  zone.addEventListener("dragleave", () => zone.classList.remove("dragover"));
  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("dragover");
    const f = e.dataTransfer.files?.[0];
    if (f) upload(f);
  });

  main.appendChild(h("div", { class: "card" }, zone));
  main.appendChild(resultArea);

  // History card
  const historyCard = h("div", { class: "card", style: { marginTop: "16px" } });
  historyCard.appendChild(h("h3", {}, "Your past resumes"));
  const historyBody = h("div", { style: { marginTop: "10px" } });
  historyCard.appendChild(historyBody);
  main.appendChild(historyCard);

  await loadHistory();

  async function upload(file) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast("Please choose a PDF file", "error");
      return;
    }
    clear(resultArea);
    resultArea.appendChild(h("div", { class: "card", style: { marginTop: "16px" } },
      spinnerEl("Analyzing your resume…")));

    const fd = new FormData();
    fd.append("resume", file);
    try {
      const r = await api.resumeUpload(fd);
      renderResult(r);
      toast("Resume analyzed", "success");
      await loadHistory();
    } catch (err) {
      clear(resultArea);
      resultArea.appendChild(h("div", { class: "card empty", style: { marginTop: "16px" } },
        err.message || "Upload failed"));
    }
  }

  function renderResult(r) {
    clear(resultArea);
    const score = Math.max(0, Math.min(100, r.score || 0));
    const items = (r.feedback || "").split(";").map(s => s.trim()).filter(Boolean);
    const card = h("div", { class: "card", style: { marginTop: "16px" } });
    card.appendChild(h("h3", {}, "Analysis result"));
    card.appendChild(h("div", { class: "grid grid-2", style: { marginTop: "12px" } },
      h("div", {},
        h("div", { class: "score-ring", style: { "--p": score } }, h("span", {}, `${score}`)),
        h("div", { style: { textAlign: "center", color: "var(--text-dim)", marginTop: "8px", fontSize: "13px" } },
          score >= 70 ? "Strong resume" : score >= 40 ? "Decent — keep iterating" : "Add more depth")
      ),
      h("div", {},
        h("div", { style: { color: "var(--text-muted)", fontSize: "12px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" } }, "Feedback"),
        h("ul", { class: "feedback-list" },
          items.length ? items.map(t => {
            const miss = /missing|too short/i.test(t);
            return h("li", {},
              h("span", { class: "ico" + (miss ? " miss" : "") }, miss ? "!" : "✓"),
              h("span", {}, t)
            );
          }) : h("li", {}, "No feedback returned.")
        )
      )
    ));
    resultArea.appendChild(card);
  }

  async function loadHistory() {
    clear(historyBody);
    historyBody.appendChild(spinnerEl("Loading history…"));
    try {
      const list = await api.resumeMy();
      clear(historyBody);
      if (!list.length) {
        historyBody.appendChild(h("div", { class: "empty" }, "No resumes uploaded yet."));
        return;
      }
      const table = h("table", { class: "history-table" });
      table.appendChild(h("thead", {}, h("tr", {},
        h("th", {}, "Uploaded"),
        h("th", {}, "Score"),
        h("th", {}, "Feedback summary"),
      )));
      const tbody = h("tbody");
      list.forEach(r => {
        const date = new Date(r.createdAt).toLocaleString();
        const summary = (r.feedback || "").split(";").slice(0, 3).join("; ");
        tbody.appendChild(h("tr", {},
          h("td", {}, date),
          h("td", {}, String(r.score ?? "-")),
          h("td", {}, summary || "-"),
        ));
      });
      table.appendChild(tbody);
      historyBody.appendChild(table);
    } catch (err) {
      clear(historyBody);
      historyBody.appendChild(h("div", { class: "empty" }, err.message || "Failed to load history"));
    }
  }
}
