import { h, clear, toast, spinnerEl } from "../ui.js";
import { api } from "../api.js";

const STARTER_CODE = `// Read input from stdin and print to stdout.
let data = "";
process.stdin.on("data", c => data += c);
process.stdin.on("end", () => {
  const input = data.trim();
  // your solution here
  console.log(input);
});
`;

const STEPS = [
  { id: "resume",   label: "Resume",   icon: "fa-file-lines" },
  { id: "aptitude", label: "Aptitude", icon: "fa-brain" },
  { id: "coding",   label: "Coding",   icon: "fa-code" },
  { id: "report",   label: "Report",   icon: "fa-chart-simple" },
];

export function renderSession(main, ctx) {
  const { company, exit } = ctx;

  // Local session state
  const session = {
    company,
    step: "resume",
    resume: null,        // { score, feedback }
    mcq: null,           // { questions, answers, correct, total }
    coding: null,        // { question, code, result }  result = { passed, total }
  };

  function go(stepId) {
    session.step = stepId;
    render();
  }

  function render() {
    clear(main);

    // Header
    main.appendChild(h("div", { class: "page-head row between" },
      h("div", {},
        h("h1", {}, `${company} — Practice Round`),
        h("p", {}, "Complete each step to build your final report."),
      ),
      h("button", { class: "btn-ghost", onClick: exit }, "← All companies")
    ));

    // Stepper
    main.appendChild(renderStepper(session.step));

    // Body
    if (session.step === "resume")   return resumeStep(main, session, () => go("aptitude"));
    if (session.step === "aptitude") return aptitudeStep(main, session, () => go("coding"));
    if (session.step === "coding")   return codingStep(main, session, () => go("report"));
    if (session.step === "report")   return reportStep(main, session, exit);
  }

  render();
}

function renderStepper(currentStepId) {
  const wrap = h("div", { class: "stepper" });
  STEPS.forEach((s, i) => {
    const idx = STEPS.findIndex(x => x.id === currentStepId);
    const status = i < idx ? "done" : i === idx ? "active" : "todo";
    wrap.appendChild(h("div", { class: "step " + status },
      h("div", { class: "step-circle" }, status === "done" ? "✓" : (i + 1)),
      h("div", { class: "step-label" }, s.label),
    ));
    if (i < STEPS.length - 1) {
      wrap.appendChild(h("div", { class: "step-bar " + (i < idx ? "done" : "") }));
    }
  });
  return wrap;
}

/* ---------------- Step 1: Resume ---------------- */
function resumeStep(main, session, next) {
  const card = h("div", { class: "card" });
  card.appendChild(h("h3", {}, "Step 1 — Upload your resume"));
  card.appendChild(h("p", { style: { marginTop: "4px" } },
    "We'll score it instantly. You can skip this step if you don't have a PDF handy."));

  const resultArea = h("div", { style: { marginTop: "12px" } });

  const fileInput = h("input", {
    type: "file",
    accept: "application/pdf",
    style: { display: "none" },
    onChange: (e) => upload(e.target.files[0])
  });

  const zone = h("div", { class: "upload-zone" },
    h("div", { class: "big" }, h("i", { class: "fa-solid fa-cloud-arrow-up" })),
    h("div", { style: { fontWeight: 600 } }, "Click or drop a PDF to analyze"),
    h("div", { class: "sub" }, "We extract text and score against keywords, sections and length"),
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

  card.appendChild(zone);
  card.appendChild(resultArea);

  const actions = h("div", { class: "row", style: { marginTop: "16px", justifyContent: "space-between" } },
    h("button", { class: "btn-ghost", onClick: () => { session.resume = null; next(); } }, "Skip resume"),
    h("button", {
      class: "btn-primary",
      disabled: !session.resume,
      onClick: next
    }, session.resume ? "Continue to aptitude →" : "Upload to continue")
  );
  card.appendChild(actions);

  if (session.resume) {
    renderResumeResult();
  }

  main.appendChild(card);

  async function upload(file) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast("Please choose a PDF file", "error");
      return;
    }
    clear(resultArea);
    resultArea.appendChild(spinnerEl("Analyzing your resume…"));
    const fd = new FormData();
    fd.append("resume", file);
    try {
      const r = await api.resumeUpload(fd);
      session.resume = { score: r.score, feedback: r.feedback };
      toast("Resume analyzed", "success");
      renderResumeResult();
      // Re-render to enable continue button
      actions.querySelectorAll("button")[1].disabled = false;
      actions.querySelectorAll("button")[1].textContent = "Continue to aptitude →";
    } catch (err) {
      clear(resultArea);
      resultArea.appendChild(h("div", { class: "test-result failed" }, err.message || "Upload failed"));
    }
  }

  function renderResumeResult() {
    clear(resultArea);
    const score = Math.max(0, Math.min(100, session.resume.score || 0));
    const items = (session.resume.feedback || "").split(";").map(s => s.trim()).filter(Boolean);
    resultArea.appendChild(h("div", { class: "grid grid-2", style: { marginTop: "8px" } },
      h("div", {},
        h("div", { class: "score-ring", style: { "--p": score } }, h("span", {}, `${score}`)),
        h("div", { style: { textAlign: "center", color: "var(--text-dim)", marginTop: "8px", fontSize: "13px" } },
          score >= 70 ? "Strong resume" : score >= 40 ? "Decent — keep iterating" : "Add more depth"),
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
  }
}

/* ---------------- Step 2: Aptitude ---------------- */
function aptitudeStep(main, session, next) {
  const card = h("div", { class: "card" });
  card.appendChild(h("h3", {}, "Step 2 — Aptitude quiz"));
  card.appendChild(h("p", { style: { marginTop: "4px" } },
    `5 questions tailored to ${session.company}. One at a time — pick the best answer.`));

  const body = h("div", { style: { marginTop: "16px" } });
  card.appendChild(body);
  main.appendChild(card);

  if (!session.mcq) {
    body.appendChild(spinnerEl("Loading questions…"));
    api.mcq(session.company).then(qs => {
      if (!qs.length) {
        clear(body);
        body.appendChild(h("div", { class: "empty" }, "No questions for this company yet."));
        body.appendChild(h("div", { class: "row", style: { marginTop: "10px" } },
          h("button", { class: "btn-primary", onClick: () => { session.mcq = { questions: [], answers: {}, correct: 0, total: 0, finished: true }; next(); } }, "Skip to coding →")
        ));
        return;
      }
      session.mcq = { questions: qs, answers: {}, current: 0, finished: false };
      renderQuiz();
    }).catch(err => {
      clear(body);
      body.appendChild(h("div", { class: "empty" }, err.message || "Failed to load"));
    });
  } else {
    renderQuiz();
  }

  function renderQuiz() {
    clear(body);
    const m = session.mcq;
    if (m.finished) {
      const correct = m.questions.reduce((acc, q, i) => acc + (m.answers[i] === q.correctAnswer ? 1 : 0), 0);
      m.correct = correct;
      m.total = m.questions.length;
      body.appendChild(h("div", { class: "score-banner" },
        h("div", { style: { color: "var(--text-dim)", fontSize: "13px" } }, "Aptitude score"),
        h("div", { class: "big" }, `${correct} / ${m.questions.length}`),
        h("div", { style: { color: "var(--text-dim)", fontSize: "13px", marginTop: "4px" } },
          correct === m.questions.length ? "Perfect run! 🎯" : "Review your answers below.")
      ));

      // Review per question
      m.questions.forEach((q, qi) => {
        const block = h("div", { class: "question-block" });
        block.appendChild(h("div", { class: "question-text" }, `${qi + 1}. ${q.question}`));
        (q.options || []).forEach(opt => {
          const isPicked = m.answers[qi] === opt;
          const isCorrect = opt === q.correctAnswer;
          const isWrong = isPicked && !isCorrect;
          block.appendChild(h("div", {
            class: `option ${isPicked ? "selected" : ""} ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`
          }, opt));
        });
        body.appendChild(block);
      });

      body.appendChild(h("div", { class: "row", style: { marginTop: "12px" } },
        h("button", { class: "btn-primary", onClick: next }, "Continue to coding →")
      ));
      return;
    }

    const idx = m.current;
    const q = m.questions[idx];

    body.appendChild(h("div", { class: "row between", style: { marginBottom: "12px" } },
      h("div", { style: { color: "var(--text-dim)", fontSize: "13px" } }, `Question ${idx + 1} of ${m.questions.length}`),
      h("div", { class: "progress" }, h("div", { class: "progress-bar", style: { width: `${((idx) / m.questions.length) * 100}%` } }))
    ));

    const block = h("div", { class: "question-block" });
    block.appendChild(h("div", { class: "question-text", style: { fontSize: "17px" } }, q.question));
    (q.options || []).forEach(opt => {
      const picked = m.answers[idx] === opt;
      block.appendChild(h("label", { class: "option" + (picked ? " selected" : "") },
        h("input", {
          type: "radio",
          name: `q-${idx}`,
          checked: picked || false,
          onChange: () => { m.answers[idx] = opt; renderQuiz(); }
        }),
        h("span", {}, opt)
      ));
    });
    body.appendChild(block);

    const isLast = idx === m.questions.length - 1;
    body.appendChild(h("div", { class: "row", style: { marginTop: "12px", justifyContent: "space-between" } },
      h("button", {
        class: "btn-ghost",
        disabled: idx === 0,
        onClick: () => { m.current = Math.max(0, idx - 1); renderQuiz(); }
      }, "← Previous"),
      h("button", {
        class: "btn-primary",
        disabled: !m.answers[idx],
        onClick: () => {
          if (isLast) {
            m.finished = true;
            renderQuiz();
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            m.current = idx + 1;
            renderQuiz();
          }
        }
      }, isLast ? "Submit answers" : "Next →")
    ));
  }
}

/* ---------------- Step 3: Coding ---------------- */
function codingStep(main, session, next) {
  const card = h("div", { class: "card" });
  card.appendChild(h("h3", {}, "Step 3 — Coding round"));
  card.appendChild(h("p", { style: { marginTop: "4px" } },
    `Solve a JavaScript problem from ${session.company}'s pool.`));

  const body = h("div", { style: { marginTop: "12px" } });
  card.appendChild(body);
  main.appendChild(card);

  if (!session.coding) {
    body.appendChild(spinnerEl("Loading problems…"));
    api.codingList(session.company).then(qs => {
      if (!qs.length) {
        session.coding = { question: null, code: "", result: null, attempted: false, finished: true };
        clear(body);
        body.appendChild(h("div", { class: "empty" }, "No coding problems for this company yet."));
        body.appendChild(h("div", { class: "row", style: { marginTop: "10px" } },
          h("button", { class: "btn-primary", onClick: next }, "Skip to report →")
        ));
        return;
      }
      // Pick a random problem from the company
      const pick = qs[Math.floor(Math.random() * qs.length)];
      session.coding = { question: pick, code: STARTER_CODE, result: null, attempted: false };
      renderCoding();
    }).catch(err => {
      clear(body);
      body.appendChild(h("div", { class: "empty" }, err.message || "Failed to load"));
    });
  } else {
    renderCoding();
  }

  function renderCoding() {
    clear(body);
    const c = session.coding;
    if (!c.question) return;

    body.appendChild(h("div", { style: { fontWeight: 700, fontSize: "16px", marginBottom: "6px" } }, c.question.title));
    body.appendChild(h("div", { class: "problem-desc" }, c.question.description || ""));

    body.appendChild(h("div", { style: { color: "var(--text-muted)", fontSize: "12px", margin: "12px 0 6px" } },
      "Your solution (JavaScript / Node)"));

    const ta = h("textarea", {
      class: "code-editor",
      spellcheck: "false",
      onInput: (e) => { c.code = e.target.value; }
    });
    ta.value = c.code;
    body.appendChild(ta);

    const runBtn = h("button", {
      class: "btn-primary",
      disabled: c.running || false,
      onClick: async () => {
        if (c.running) return;
        c.running = true;
        c.result = null;
        renderCoding();
        try {
          const r = await api.codingRun({ code: c.code, questionId: c.question._id });
          c.result = r;
          c.attempted = true;
          c.running = false;
          const passed = r.passed === r.total;
          toast(passed ? "All test cases passed 🎉" : "Tests failed", passed ? "success" : "error");
          renderCoding();
        } catch (err) {
          c.running = false;
          c.result = { error: err.message || "Run failed" };
          renderCoding();
        }
      }
    }, c.running ? "Running…" : "Run code");

    const resetBtn = h("button", {
      class: "btn-ghost",
      onClick: () => { c.code = STARTER_CODE; c.result = null; renderCoding(); }
    }, "Reset code");

    const continueBtn = h("button", {
      class: "btn-primary",
      onClick: next,
    }, "Continue to report →");

    body.appendChild(h("div", { class: "row", style: { marginTop: "10px", justifyContent: "space-between" } },
      h("div", { class: "row" }, runBtn, resetBtn),
      c.attempted ? continueBtn : h("button", { class: "btn-ghost", onClick: next }, "Skip to report")
    ));

    if (c.running) {
      body.appendChild(h("div", { class: "test-result", style: { marginTop: "12px" } }, spinnerEl("Submitting to Judge0…")));
    } else if (c.result) {
      if (c.result.error) {
        body.appendChild(h("div", { class: "test-result failed", style: { marginTop: "12px" } },
          h("strong", {}, "Error"),
          h("pre", {}, c.result.error)
        ));
      } else {
        const r0 = c.result.results?.[0] || {};
        const passed = r0.passed;
        const block = h("div", { class: "test-result " + (passed ? "passed" : "failed"), style: { marginTop: "12px" } });
        block.appendChild(h("div", { style: { fontWeight: 600, marginBottom: "6px" } }, passed ? "✓ Passed" : "✗ Failed"));
        block.appendChild(h("div", { style: { color: "var(--text-dim)", fontSize: "12px" } }, "Input"));
        block.appendChild(h("pre", {}, r0.input || "(empty)"));
        block.appendChild(h("div", { style: { color: "var(--text-dim)", fontSize: "12px" } }, "Expected"));
        block.appendChild(h("pre", {}, r0.expected || ""));
        block.appendChild(h("div", { style: { color: "var(--text-dim)", fontSize: "12px" } }, "Your output"));
        block.appendChild(h("pre", {}, r0.output || "(no output)"));
        if (r0.stderr) {
          block.appendChild(h("div", { style: { color: "var(--text-dim)", fontSize: "12px" } }, "stderr"));
          block.appendChild(h("pre", {}, r0.stderr));
        }
        body.appendChild(block);
      }
    }
  }
}

/* ---------------- Step 4: Report ---------------- */
function reportStep(main, session, exit) {
  const r = session.resume;
  const m = session.mcq;
  const c = session.coding;

  // Compose scores
  const resumeScore = r ? Math.max(0, Math.min(100, r.score)) : null;
  const mcqScore = m && m.total ? Math.round((m.correct / m.total) * 100) : null;
  const codingPassed = c && c.result && !c.result.error
    ? (c.result.passed === c.result.total)
    : null;
  const codingScore = codingPassed === null ? null : (codingPassed ? 100 : 0);

  const scores = [resumeScore, mcqScore, codingScore].filter(s => s !== null);
  const overall = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  let verdict = "Keep practicing — focus on weak areas below.";
  if (overall >= 80) verdict = "You're well prepared for this company! 🚀";
  else if (overall >= 60) verdict = "Solid foundation — sharpen the rough edges.";
  else if (overall >= 40) verdict = "Decent start — keep iterating.";

  const card = h("div", { class: "card" });
  card.appendChild(h("h3", {}, `${session.company} — Final Report`));
  card.appendChild(h("p", { style: { marginTop: "4px" } }, verdict));

  // Overall score
  card.appendChild(h("div", { class: "score-banner", style: { marginTop: "16px" } },
    h("div", { style: { color: "var(--text-dim)", fontSize: "13px" } }, "Overall readiness"),
    h("div", { class: "big" }, `${overall}%`),
  ));

  // Per-section scores
  card.appendChild(h("div", { class: "grid grid-3", style: { marginTop: "16px" } },
    reportTile("📄 Resume",
      resumeScore === null ? "Skipped" : `${resumeScore}/100`,
      resumeScore === null ? "Not submitted" : (resumeScore >= 70 ? "Strong" : resumeScore >= 40 ? "Decent" : "Needs work")),
    reportTile("📝 Aptitude",
      mcqScore === null ? "Skipped" : `${m.correct}/${m.total}`,
      mcqScore === null ? "Not attempted" : `${mcqScore}% accuracy`),
    reportTile("💻 Coding",
      codingScore === null ? "Skipped" : (codingPassed ? "Passed" : "Failed"),
      codingScore === null ? "Not attempted" : (codingPassed ? "All tests passed" : "Try again later")),
  ));

  // Suggestions
  const tips = [];
  if (resumeScore !== null && resumeScore < 60) tips.push("Add more keywords (skills, frameworks) and ensure clear sections (Education, Experience, Skills, Projects).");
  if (mcqScore !== null && mcqScore < 60) tips.push(`Brush up on core CS topics for ${session.company} — DSA, networks, OOP basics.`);
  if (codingScore !== null && !codingPassed) tips.push("Practice more stdin/stdout JS problems — test edge cases before submitting.");
  if (!tips.length) tips.push("You're on a great path. Try another company to broaden your prep.");

  card.appendChild(h("div", { style: { marginTop: "16px" } },
    h("div", { style: { color: "var(--text-muted)", fontSize: "12px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" } }, "Suggestions"),
    h("ul", { class: "feedback-list" }, tips.map(t => h("li", {},
      h("span", { class: "ico" }, "→"), h("span", {}, t)
    )))
  ));

  card.appendChild(h("div", { class: "row", style: { marginTop: "20px", justifyContent: "space-between" } },
    h("button", { class: "btn-ghost", onClick: exit }, "← Back to companies"),
    h("button", { class: "btn-primary", onClick: () => window.print() }, "Save / Print report"),
  ));

  main.appendChild(card);
}

function reportTile(title, big, sub) {
  return h("div", { class: "card stat" },
    h("div", { class: "label" }, title),
    h("div", { class: "num" }, big),
    h("div", { style: { color: "var(--text-dim)", fontSize: "13px", marginTop: "6px" } }, sub),
  );
}
