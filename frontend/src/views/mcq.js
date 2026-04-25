import { h, clear, toast, spinnerEl } from "../ui.js";
import { api } from "../api.js";

const COMPANIES = ["Google", "Amazon", "Microsoft", "Meta", "Apple"];

export async function renderMCQ(main) {
  let selectedCompany = null;
  let questions = [];
  let answers = {};
  let submitted = false;

  main.appendChild(h("div", { class: "page-head" },
    h("h1", {}, "Aptitude — MCQ"),
    h("p", {}, "Pick a company to fetch 5 random questions.")
  ));

  const chips = h("div", { class: "chips" });
  COMPANIES.forEach(c => {
    const chip = h("div", {
      class: "chip",
      onClick: async () => {
        document.querySelectorAll("#mcq-chips .chip").forEach(el => el.classList.remove("active"));
        chip.classList.add("active");
        selectedCompany = c;
        await loadQuestions();
      }
    }, c);
    chips.appendChild(chip);
  });
  chips.id = "mcq-chips";
  main.appendChild(h("div", { class: "card" },
    h("h3", {}, "Choose a company"),
    chips
  ));

  const area = h("div", { id: "mcq-area", style: { marginTop: "16px" } });
  main.appendChild(area);

  async function loadQuestions() {
    submitted = false;
    answers = {};
    clear(area);
    area.appendChild(h("div", { class: "card" }, spinnerEl("Loading questions…")));
    try {
      questions = await api.mcq(selectedCompany);
      if (!questions.length) {
        clear(area);
        area.appendChild(h("div", { class: "card empty" }, `No questions found for ${selectedCompany} yet.`));
        return;
      }
      renderQuiz();
    } catch (err) {
      clear(area);
      area.appendChild(h("div", { class: "card empty" }, err.message || "Failed to load"));
    }
  }

  function renderQuiz() {
    clear(area);
    const card = h("div", { class: "card" });
    card.appendChild(h("div", { class: "row between", style: { marginBottom: "16px" } },
      h("h3", {}, `${selectedCompany} — Quick Quiz`),
      h("div", { style: { color: "var(--text-dim)", fontSize: "13px" } }, `${questions.length} questions`)
    ));

    questions.forEach((q, qi) => {
      const block = h("div", { class: "question-block" });
      block.appendChild(h("div", { class: "question-text" }, `${qi + 1}. ${q.question}`));
      (q.options || []).forEach((opt) => {
        const isPicked = answers[qi] === opt;
        const isCorrect = submitted && opt === q.correctAnswer;
        const isWrong = submitted && isPicked && opt !== q.correctAnswer;
        const optEl = h("label", {
          class: `option ${isPicked ? "selected" : ""} ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`
        },
          h("input", {
            type: "radio",
            name: `q${qi}`,
            checked: isPicked || false,
            disabled: submitted || false,
            onChange: () => {
              answers[qi] = opt;
              renderQuiz();
            }
          }),
          h("span", {}, opt)
        );
        block.appendChild(optEl);
      });
      card.appendChild(block);
    });

    if (!submitted) {
      card.appendChild(h("div", { class: "row", style: { marginTop: "10px" } },
        h("button", {
          class: "btn-primary",
          onClick: () => {
            submitted = true;
            const correct = questions.reduce((acc, q, i) => acc + (answers[i] === q.correctAnswer ? 1 : 0), 0);
            toast(`Score: ${correct}/${questions.length}`, correct === questions.length ? "success" : "info");
            renderQuiz();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }, "Submit answers"),
        h("button", {
          class: "btn-ghost",
          onClick: loadQuestions
        }, "Reshuffle")
      ));
    } else {
      const correct = questions.reduce((acc, q, i) => acc + (answers[i] === q.correctAnswer ? 1 : 0), 0);
      area.insertBefore(h("div", { class: "score-banner" },
        h("div", { class: "label", style: { color: "var(--text-dim)", fontSize: "13px" } }, "Your score"),
        h("div", { class: "big" }, `${correct} / ${questions.length}`),
        h("div", { style: { color: "var(--text-dim)", fontSize: "13px", marginTop: "4px" } },
          correct === questions.length ? "Perfect run! 🎯" : "Review the highlighted answers below.")
      ), card);
      card.appendChild(h("div", { class: "row", style: { marginTop: "10px" } },
        h("button", { class: "btn-primary", onClick: loadQuestions }, "Try again"),
      ));
    }

    area.appendChild(card);
  }
}
