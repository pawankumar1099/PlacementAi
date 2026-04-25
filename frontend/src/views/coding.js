import { h, clear, toast, spinnerEl } from "../ui.js";
import { api } from "../api.js";

const COMPANIES = ["Google", "Amazon", "Microsoft", "Meta", "Apple"];

const STARTER_CODE = `// Read input from stdin and print to stdout.
// Example for reading the whole input:
let data = "";
process.stdin.on("data", c => data += c);
process.stdin.on("end", () => {
  const input = data.trim();
  // your solution here
  console.log(input);
});
`;

export async function renderCoding(main) {
  let selectedCompany = "Google";
  let questions = [];
  let activeQuestion = null;
  let userCode = STARTER_CODE;
  let result = null;
  let running = false;

  main.appendChild(h("div", { class: "page-head" },
    h("h1", {}, "Coding Practice"),
    h("p", {}, "Solve problems in JavaScript and run them against the expected output.")
  ));

  // Company selector
  const chips = h("div", { class: "chips" });
  COMPANIES.forEach(c => {
    const chip = h("div", {
      class: "chip" + (c === selectedCompany ? " active" : ""),
      onClick: async () => {
        selectedCompany = c;
        document.querySelectorAll("#code-chips .chip").forEach(el => el.classList.remove("active"));
        chip.classList.add("active");
        await loadList();
      }
    }, c);
    chips.appendChild(chip);
  });
  chips.id = "code-chips";
  main.appendChild(h("div", { class: "card" },
    h("h3", {}, "Choose a company"),
    chips
  ));

  // Layout area
  const area = h("div", { style: { marginTop: "16px" } });
  main.appendChild(area);

  async function loadList() {
    activeQuestion = null;
    result = null;
    userCode = STARTER_CODE;
    clear(area);
    area.appendChild(h("div", { class: "card" }, spinnerEl("Loading problems…")));
    try {
      questions = await api.codingList(selectedCompany);
      renderLayout();
    } catch (err) {
      clear(area);
      area.appendChild(h("div", { class: "card empty" }, err.message || "Failed to load"));
    }
  }

  function renderLayout() {
    clear(area);

    const grid = h("div", { class: "coding-grid" });

    // Left: problem list
    const list = h("div", { class: "card" });
    list.appendChild(h("h3", { style: { marginBottom: "8px" } }, "Problems"));
    if (questions.length === 0) {
      list.appendChild(h("div", { class: "empty" }, "No problems for this company yet."));
    } else {
      const qList = h("div", { class: "q-list" });
      questions.forEach((q) => {
        const item = h("div", {
          class: "q-item" + (activeQuestion && activeQuestion._id === q._id ? " active" : ""),
          onClick: async () => {
            activeQuestion = q;
            result = null;
            userCode = STARTER_CODE;
            renderLayout();
          }
        },
          h("div", { class: "q-title" }, q.title),
          h("div", { class: "q-meta" }, q.company)
        );
        qList.appendChild(item);
      });
      list.appendChild(qList);
    }
    grid.appendChild(list);

    // Right: editor + result
    const right = h("div");

    if (!activeQuestion) {
      right.appendChild(h("div", { class: "card empty" }, "← Pick a problem to start coding."));
    } else {
      const card = h("div", { class: "card" });
      card.appendChild(h("h3", {}, activeQuestion.title));
      card.appendChild(h("div", { class: "problem-desc", style: { margin: "10px 0 14px" } },
        activeQuestion.description || ""));

      card.appendChild(h("div", { style: { color: "var(--text-muted)", fontSize: "12px", marginBottom: "6px" } },
        "Your solution (JavaScript / Node)"));

      const ta = h("textarea", {
        class: "code-editor",
        spellcheck: "false",
        onInput: (e) => { userCode = e.target.value; }
      });
      ta.value = userCode;
      card.appendChild(ta);

      const runBtn = h("button", {
        class: "btn-primary",
        disabled: running || false,
        onClick: async () => {
          if (running) return;
          running = true;
          result = null;
          renderLayout();
          try {
            const r = await api.codingRun({ code: userCode, questionId: activeQuestion._id });
            result = r;
            running = false;
            const passed = r.passed === r.total;
            toast(passed ? "All test cases passed 🎉" : "Some tests failed",
                  passed ? "success" : "error");
            renderLayout();
          } catch (err) {
            running = false;
            result = { error: err.message || "Run failed" };
            renderLayout();
          }
        }
      }, running ? "Running…" : "Run code");

      const resetBtn = h("button", {
        class: "btn-ghost",
        onClick: () => { userCode = STARTER_CODE; result = null; renderLayout(); }
      }, "Reset");

      card.appendChild(h("div", { class: "row", style: { marginTop: "10px" } }, runBtn, resetBtn));

      if (running) {
        card.appendChild(h("div", { class: "test-result" }, spinnerEl("Submitting to Judge0…")));
      } else if (result) {
        if (result.error) {
          card.appendChild(h("div", { class: "test-result failed" },
            h("strong", {}, "Error"),
            h("pre", {}, result.error)));
        } else {
          const stats = h("div", { style: { marginBottom: "12px", fontWeight: "bold" } },
            `Passed ${result.passed} / ${result.total} test cases`
          );
          card.appendChild(stats);

          (result.results || []).forEach((r, idx) => {
            const block = h("div", {
              class: "test-result " + (r.passed ? "passed" : "failed"),
              style: { marginBottom: "10px" }
            });
            block.appendChild(h("div", { style: { fontWeight: 600, marginBottom: "6px" } },
              (r.passed ? "✓ Passed" : "✗ Failed") + (r.isHidden ? " (Hidden Case)" : ` (Case ${idx + 1})`)));

            if (!r.isHidden || !r.passed) {
              block.appendChild(h("div", { style: { color: "var(--text-dim)", fontSize: "12px" } }, "Input"));
              block.appendChild(h("pre", {}, r.input || "(empty)"));
              block.appendChild(h("div", { style: { color: "var(--text-dim)", fontSize: "12px" } }, "Expected"));
              block.appendChild(h("pre", {}, r.expected || ""));
              block.appendChild(h("div", { style: { color: "var(--text-dim)", fontSize: "12px" } }, "Your output"));
              block.appendChild(h("pre", {}, r.output || "(no output)"));
              if (r.stderr) {
                block.appendChild(h("div", { style: { color: "var(--text-dim)", fontSize: "12px" } }, "stderr"));
                block.appendChild(h("pre", {}, r.stderr));
              }
              if (r.compileError) {
                block.appendChild(h("div", { style: { color: "var(--text-dim)", fontSize: "12px" } }, "Compile output"));
                block.appendChild(h("pre", {}, r.compileError));
              }
            } else {
              block.appendChild(h("div", { style: { fontStyle: "italic", fontSize: "13px" } },
                "Test case details are hidden for privacy."));
            }
            card.appendChild(block);
          });
        }
      }

      right.appendChild(card);
    }

    grid.appendChild(right);
    area.appendChild(grid);
  }

  await loadList();
}
