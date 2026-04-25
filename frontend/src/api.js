// Lightweight API client. All requests are credentialed (cookie-based JWT).

const BASE = "/api";

async function request(path, options = {}) {
  const opts = {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  };
  if (opts.body && typeof opts.body !== "string" && !(opts.body instanceof FormData)) {
    opts.body = JSON.stringify(opts.body);
  }
  if (opts.body instanceof FormData) {
    delete opts.headers["Content-Type"];
  }

  const res = await fetch(`${BASE}${path}`, opts);
  let data = null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    data = await res.json().catch(() => null);
  } else {
    data = await res.text().catch(() => null);
  }
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  // Auth
  signup: (body) => request("/auth/signup", { method: "POST", body }),
  login: (body) => request("/auth/login", { method: "POST", body }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),

  // MCQ
  companies: () => request("/questions/companies/list"),
  mcq: (company) => request(`/questions/${encodeURIComponent(company)}`),

  // Coding
  codingList: (company) => request(`/code/list/${encodeURIComponent(company)}`),
  codingQuestion: (id) => request(`/code/question/${id}`),
  codingRun: (body) => request("/code/run", { method: "POST", body }),

  // Resume
  resumeUpload: (formData) => request("/resume/upload", { method: "POST", body: formData }),
  resumeMy: () => request("/resume/my"),
};
