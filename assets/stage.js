const FALLBACK_PLACEHOLDER = "type a command";

function placeholderText() {
  const d = typeof dict === "function" ? dict().stage : null;
  return (d && d.placeholder) || FALLBACK_PLACEHOLDER;
}

function stageCopy() {
  return (typeof dict === "function" && dict().stage) || {};
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        reject(new DOMException("aborted", "AbortError"));
      },
      { once: true }
    );
  });
}

function el(tag, cls, html) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
}

function scrollStage() {
  const body = document.getElementById("stage-body");
  if (body) body.scrollTop = body.scrollHeight;
}

function append(log, node) {
  log.appendChild(node);
  scrollStage();
  return node;
}

function promptRow(text) {
  const row = el("div", "tui-row");
  row.append(
    el("span", "tui-gt", "galdr "),
    el("span", "tui-path", "~/Project/galdr"),
    el("span", "tui-gt", " · "),
    el("span", "tui-user", text)
  );
  return row;
}

function outRow(text) {
  return el("div", "tui-out", text);
}

function htmlRow(cls, html) {
  return el("div", cls, html);
}

function hideSheet() {
  const sheet = document.getElementById("stage-sheet");
  if (sheet) sheet.hidden = true;
}

function showComplete(prefix, items, selected) {
  const sheet = document.getElementById("stage-sheet");
  const copy = stageCopy();
  document.getElementById("stage-sheet-title").textContent = copy.complete || "completion";
  document.getElementById("stage-sheet-detail").textContent = prefix;
  const hint = document.querySelector("#stage-sheet .tui-sheet-hint");
  if (hint) hint.textContent = copy.completeHint || "↑↓ · enter · esc";
  const box = document.getElementById("stage-sheet-choices");
  box.replaceChildren();
  items.forEach((item, i) => {
    const on = i === selected;
    const row = el("div", on ? "tui-choice on" : "tui-choice");
    row.append(
      el("span", "tui-choice-mark", on ? "❯ " : "  "),
      el("span", "tui-choice-name", item.name),
      el("span", "tui-choice-freq", String(item.uses))
    );
    box.append(row);
  });
  sheet.hidden = false;
  scrollStage();
}

function setInput(text, placeholder) {
  const n = document.getElementById("stage-input");
  if (!n) return;
  n.textContent = text || placeholderText();
  n.classList.toggle("tui-ph", placeholder || !text);
}

async function typeCommand(input, draft, signal, from = "") {
  input.classList.remove("tui-ph");
  let typed = from;
  input.textContent = typed;
  input.append(el("span", "tui-caret"));
  for (const ch of draft.slice(from.length)) {
    if (signal.aborted) throw new DOMException("aborted", "AbortError");
    typed += ch;
    input.textContent = typed;
    input.append(el("span", "tui-caret"));
    await sleep(ch === " " ? 18 : 28, signal);
  }
  await sleep(200, signal);
}

function finalFrame(log) {
  const copy = stageCopy();
  log.replaceChildren();
  hideSheet();
  append(log, promptRow("ls"));
  append(
    log,
    htmlRow(
      "tui-out tui-ls",
      '<span class="tui-dir">src/</span>   <span class="tui-dir">hub/</span>   Cargo.toml   galdrc'
    )
  );
  append(log, promptRow("nvim src/app.rs"));
  append(log, htmlRow("tui-sys", "# pane 1"));
  append(log, promptRow("git status"));
  append(
    log,
    htmlRow(
      "tui-out",
      'On branch <span class="tui-ok">master</span><br>' +
        '<span class="tui-mut">modified:   src/app.rs</span>'
    )
  );
  append(log, promptRow("galdr --attach work"));
  append(log, htmlRow("tui-out tui-attach", copy.attached || "attached  work"));
  setInput("", true);
}

async function playLoop(signal) {
  const log = document.getElementById("stage-log");
  const input = document.getElementById("stage-input");
  if (!log || !input) return;
  if (prefersReducedMotion()) {
    finalFrame(log);
    return;
  }

  const complete = [
    { name: "nvim", uses: 128 },
    { name: "nvm", uses: 12 },
    { name: "nmap", uses: 3 },
  ];

  while (!signal.aborted) {
    log.replaceChildren();
    hideSheet();
    setInput("", true);

    await typeCommand(input, "ls", signal);
    append(log, promptRow("ls"));
    append(
      log,
      htmlRow(
        "tui-out tui-ls",
        '<span class="tui-dir">src/</span>   <span class="tui-dir">hub/</span>   Cargo.toml   galdrc'
      )
    );
    setInput("", true);
    await sleep(420, signal);

    await typeCommand(input, "nv", signal);
    showComplete("nv", complete, 0);
    await sleep(900, signal);
    hideSheet();
    await typeCommand(input, "nvim src/app.rs", signal, "nv");
    append(log, promptRow("nvim src/app.rs"));
    append(log, htmlRow("tui-sys", "# pane 1 · nvim"));
    setInput("", true);
    await sleep(480, signal);

    await typeCommand(input, "git status", signal);
    append(log, promptRow("git status"));
    append(
      log,
      htmlRow(
        "tui-out",
        'On branch <span class="tui-ok">master</span><br>' +
          '<span class="tui-mut">modified:   src/app.rs</span>'
      )
    );
    setInput("", true);
    await sleep(520, signal);

    await typeCommand(input, "galdr --attach work", signal);
    append(log, promptRow("galdr --attach work"));
    append(log, htmlRow("tui-out tui-attach", stageCopy().attached || "attached  work"));
    setInput("", true);
    await sleep(1800, signal);
  }
}

let stageAbort = null;

function startStage() {
  stageAbort?.abort();
  stageAbort = new AbortController();
  playLoop(stageAbort.signal).catch((err) => {
    if (err?.name !== "AbortError") console.warn(err);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("stage")) return;
  startStage();
});

document.addEventListener("galdr-lang", () => {
  if (document.getElementById("stage")) startStage();
});
