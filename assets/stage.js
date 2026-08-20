const FALLBACK_PLACEHOLDER = "type a command";

function placeholderText() {
  const d = typeof dict === "function" ? dict().stage : null;
  return (d && d.placeholder) || FALLBACK_PLACEHOLDER;
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
  row.append(el("span", "tui-gt", "~ "), el("span", "tui-user", text));
  return row;
}

function outRow(text) {
  return el("div", "tui-out", text);
}

function setInput(text, placeholder) {
  const n = document.getElementById("stage-input");
  if (!n) return;
  n.textContent = text || placeholderText();
  n.classList.toggle("tui-ph", placeholder || !text);
}

function finalFrame(log) {
  log.replaceChildren();
  append(log, promptRow("galdr --version"));
  append(log, outRow("galdr 0.1.2"));
  append(log, promptRow("include bashrc"));
  append(log, outRow("# galdrc · optional"));
  setInput("", true);
}

async function typeCommand(input, draft, signal) {
  input.classList.remove("tui-ph");
  input.textContent = "";
  input.append(el("span", "tui-caret"));
  let typed = "";
  for (const ch of draft) {
    if (signal.aborted) throw new DOMException("aborted", "AbortError");
    typed += ch;
    input.textContent = typed;
    input.append(el("span", "tui-caret"));
    await sleep(ch === " " ? 18 : 28, signal);
  }
  await sleep(220, signal);
  setInput("", true);
}

async function playLoop(signal) {
  const log = document.getElementById("stage-log");
  if (!log) return;
  if (prefersReducedMotion()) {
    finalFrame(log);
    return;
  }
  const beats = [
    { cmd: "galdr --version", out: "galdr 0.1.2" },
    { cmd: "echo $SHELL", out: "galdr-shell" },
    { cmd: "include bashrc", out: "" },
  ];
  while (!signal.aborted) {
    log.replaceChildren();
    setInput("", true);
    const input = document.getElementById("stage-input");
    for (const beat of beats) {
      await typeCommand(input, beat.cmd, signal);
      append(log, promptRow(beat.cmd));
      if (beat.out) append(log, outRow(beat.out));
      await sleep(480, signal);
    }
    await sleep(1600, signal);
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
