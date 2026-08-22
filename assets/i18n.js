const LANGS = ["zh", "en"];
const I18N = {
  zh: {
    meta: {
      title: "Galdr — GPU 加速终端",
      desc: "GPU 加速终端。打开就是 galdr-shell，标签、分屏，会话可以分离后再附着。",
      docsTitle: "文档 — Galdr",
      docsDesc: "安装、galdrc、快捷键、配置、mux 与会话恢复。",
    },
    nav: { home: "首页", download: "下载", docs: "文档", github: "GitHub" },
    hero: {
      kicker: "你的桌面上",
      title: "一台\nGPU 加速的终端",
      lede: "GPU 加速的终端。打开就是 galdr-shell，启动文件只有 galdrc。标签、分屏、搜索都在窗口里，会话可以分离后再附着。",
      install: "立即安装",
      quickStart: "快速开始",
      manual: "手动下载",
      downloading: "加载中…",
      docs: "文档",
      waiting: "正在加载最新版",
    },
    install: {
      unix: "Linux / macOS",
      linux: "Linux",
      mac: "macOS",
      win: "Windows",
      copy: "复制",
      copied: "已复制",
    },
    howto: {
      install: "安装",
      update: "更新",
      uninstall: "卸载",
      docs: "安装说明",
      installHint: "装到 ~/.galdr/bin，并加入应用菜单和文件夹右键。装完请 source ~/.galdr/env 或新开终端。",
      updateHint: "再跑一次安装器。先关掉正在跑的 Galdr，装完 source ~/.galdr/env 再看版本。",
      uninstallHint: "运行 ~/.galdr/uninstall（Windows 为 uninstall.ps1），会去掉菜单项。配置在 ~/.config/galdr/，不会一起删。",
      macUnavailable: "macOS 预编译包暂未开放",
      macHint: "当前公开版本仅提供 Linux 与 Windows 安装包。",
    },
    proof: {
      checksum: "安装器自动校验下载文件",
      platformsT: "跨平台",
      platforms: "Linux 与 Windows，支持 x64 / ARM64",
      modelsT: "内置 shell",
      models: "默认 galdr-shell，启动文件只有 galdrc",
    },
    sec: {
      install: "安装",
      howto: "安装",
      why: "为什么用它",
      download: "手动下载",
    },
    cards: {
      capT: "GPU 渲染",
      cap: "屏幕刷新走 GPU，高分屏上字形仍然对齐像素。中文和 emoji 自动换回退字体，不会糊成方块。",
      safeT: "自己的 shell",
      safe: "打开就是 galdr-shell。启动只读 galdrc，不会偷偷加载 bashrc；要用旧配置就 include。",
      seeT: "标签与分屏",
      see: "拖标签换顺序，拖分割线改大小。放大一栏、搜索、命令面板。窗口只是附着，标签和分栏留在会话里。",
      completeT: "按频率补全",
      complete: "Tab 在提示符上方弹出菜单，常用命令排在前面。子串和缩写也能对上。回车或 Tab 选中后菜单关掉。",
      modelT: "会话恢复",
      model: "下次打开还是原来的标签、分屏和目录。若还有命令在跑，会先列出来让你确认。",
      extendT: "分离再附着",
      extend: "关掉窗口，进程还在。galdr --attach 回到原来的标签和分屏。",
    },
    docs: {
      loading: "正在加载文档…",
      fail: "文档加载失败。请用本地 HTTP 服务打开，不要用 file://。",
      toc: "目录",
      onpage: "本页目录",
      search: "搜索文档…",
      searchTitle: "搜索文档",
      product: "Galdr",
      prev: "上一页",
      next: "下一页",
      nohits: "没有匹配的页面。",
      contents: "目录",
    },
    table: {
      platform: "平台",
      build: "版本",
      size: "大小",
      this: "本版",
      total: "累计",
      here: "本机",
      checksum: "校验和",
      caption: "各平台最新版本下载",
      loading: "加载中…",
      stats: (a, b, n) => `本版 ${a} 次，一共 ${b} 次 · ${n} 个版本`,
      meta: (tag, label, date, a, b) =>
        `${tag} · ${label}${date ? ` · ${date}` : ""}`,
    },
    dl: {
      prefix: "下载",
      unavailable: "暂无可用版本",
      error: "最新版暂时读不到，用上面的命令安装即可。",
      releases: "用安装命令",
      unsupported: "macOS 预编译包暂未开放",
    },
    footer: {
      tagline: "Galdr · GPU 加速终端",
      docs: "安装文档",
      releases: "Releases",
      changelog: "更新记录",
      feedback: "反馈问题",
    },
    stage: {
      title: "Galdr · ~/Project/galdr",
      placeholder: "输入命令",
      complete: "补全",
      completeHint: "↑↓ 选择   Tab / 回车 采用",
      attached: "已附着  work  ·  3 个标签  ·  左右分屏",
    },
    notfound: { title: "没有这一页。", back: "回首页" },
  },
  en: {
    meta: {
      title: "Galdr — a GPU-accelerated terminal",
      desc: "A GPU-accelerated terminal. You land in galdr-shell, with tabs, splits, and sessions you can detach and attach.",
      docsTitle: "Docs — Galdr",
      docsDesc: "Install, galdrc, shortcuts, config, mux, and session restore.",
    },
    nav: { home: "Home", download: "Download", docs: "Docs", github: "GitHub" },
    hero: {
      kicker: "On your desktop",
      title: "A GPU-accelerated\nterminal",
      lede: "A GPU-accelerated terminal. You land in galdr-shell; the only startup file is galdrc. Tabs, splits, and search live in the window. Detach a session and attach it again.",
      install: "Install now",
      quickStart: "Quick start",
      manual: "Manual downloads",
      downloading: "Loading…",
      docs: "Docs",
      waiting: "Loading the latest build",
    },
    install: {
      unix: "Linux / macOS",
      linux: "Linux",
      mac: "macOS",
      win: "Windows",
      copy: "Copy",
      copied: "Copied",
    },
    howto: {
      install: "Install",
      update: "Update",
      uninstall: "Uninstall",
      docs: "Install docs",
      installHint: "Installs into ~/.galdr/bin and adds the app menu plus folder context menu. Afterwards source ~/.galdr/env or open a new terminal.",
      updateHint: "Run the installer again. Close running Galdr first, then source ~/.galdr/env and check the version.",
      uninstallHint: "Run ~/.galdr/uninstall (uninstall.ps1 on Windows) so menu entries are removed. Config in ~/.config/galdr/ is left alone.",
      macUnavailable: "macOS prebuilt packages are temporarily unavailable",
      macHint: "The current public release only provides Linux and Windows builds.",
    },
    proof: {
      checksum: "The installer verifies every download",
      platformsT: "Cross-platform",
      platforms: "Linux and Windows on x64 / ARM64",
      modelsT: "Builtin shell",
      models: "Default galdr-shell; the only startup file is galdrc",
    },
    sec: {
      install: "Install",
      howto: "Install",
      why: "Why use it",
      download: "Manual downloads",
    },
    cards: {
      capT: "GPU rendering",
      cap: "The screen refreshes on the GPU. Glyphs stay on the pixel grid at HiDPI. CJK and emoji fall back to other fonts instead of tofu.",
      safeT: "Its own shell",
      safe: "You land in galdr-shell. Startup reads only galdrc — include an old rc if you want it.",
      seeT: "Tabs and splits",
      see: "Drag tabs to reorder, drag a divider to resize. Zoom a pane, search, command palette. The window attaches; tabs and panes stay in the session.",
      completeT: "Frequency completion",
      complete: "Tab opens a menu above the prompt, most-used commands first. Substring and abbreviation matches work. Enter or Tab accepts and the menu closes.",
      modelT: "Session restore",
      model: "The next launch brings back tabs, splits, and the working directory. If a command is still running, you confirm first.",
      extendT: "Detach and attach",
      extend: "Close the window and the process keeps running. galdr --attach returns to the same tabs and splits.",
    },
    docs: {
      loading: "Loading docs…",
      fail: "Could not load the docs. Serve this site over HTTP, not file://.",
      toc: "Contents",
      onpage: "On this page",
      search: "Search the docs…",
      searchTitle: "Search documentation",
      product: "Galdr",
      prev: "Previous",
      next: "Next",
      nohits: "No matching pages.",
      contents: "Contents",
    },
    table: {
      platform: "Platform",
      build: "Version",
      size: "Size",
      this: "This build",
      total: "All time",
      here: "yours",
      checksum: "Checksums",
      caption: "Latest downloads for each platform",
      loading: "Loading…",
      stats: (a, b, n) => `${a} this build · ${b} all time · ${n} versions`,
      meta: (tag, label, date, a, b) =>
        `${tag} · ${label}${date ? ` · ${date}` : ""}`,
    },
    dl: {
      prefix: "Download",
      unavailable: "No build yet",
      error: "Could not load the latest build. Use the install command above.",
      releases: "Use the install command",
      unsupported: "macOS prebuilt packages are temporarily unavailable",
    },
    footer: {
      tagline: "Galdr · a GPU-accelerated terminal",
      docs: "Install docs",
      releases: "Releases",
      changelog: "Changelog",
      feedback: "Report an issue",
    },
    stage: {
      title: "Galdr · ~/Project/galdr",
      placeholder: "type a command",
      complete: "completion",
      completeHint: "↑↓ select   Tab / Enter accept",
      attached: "attached  work  ·  3 tabs  ·  split ×2",
    },
    notfound: { title: "This page is not here.", back: "Home" },
  },
};

let chosenLang = null;

function getLang() {
  if (LANGS.includes(chosenLang)) return chosenLang;
  const q = new URLSearchParams(location.search).get("lang");
  if (LANGS.includes(q)) return q;
  try {
    const saved = localStorage.getItem("galdr-lang");
    if (LANGS.includes(saved)) return saved;
  } catch {
    /* ignore */
  }
  return (navigator.language || "").toLowerCase().startsWith("zh") ? "zh" : "en";
}

function dict() {
  return I18N[getLang()] || I18N.zh;
}

function setLang(lang) {
  if (!LANGS.includes(lang)) return;
  chosenLang = lang;
  try {
    localStorage.setItem("galdr-lang", lang);
  } catch {
    /* ignore */
  }
  const url = new URL(location.href);
  url.searchParams.set("lang", lang);
  history.replaceState(null, "", url);
  applyI18n();
  document.dispatchEvent(new CustomEvent("galdr-lang", { detail: lang }));
}

function applyI18n(root = document) {
  const d = dict();
  document.documentElement.lang = getLang() === "zh" ? "zh-CN" : "en";
  const title = document.querySelector("title");
  if (title && title.dataset.i18nTitle) {
    const key = title.dataset.i18nTitle;
    title.textContent = key === "docs" ? d.meta.docsTitle : d.meta.title;
  }
  const desc = document.querySelector('meta[name="description"]');
  if (desc && desc.dataset.i18nDesc) {
    desc.content = desc.dataset.i18nDesc === "docs" ? d.meta.docsDesc : d.meta.desc;
  }
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    const val = lookup(d, el.getAttribute("data-i18n"));
    if (val != null) el.textContent = val;
  });
  root.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const val = lookup(d, el.getAttribute("data-i18n-html"));
    if (val != null) el.innerHTML = String(val).replace(/\n/g, "<br>");
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const val = lookup(d, el.getAttribute("data-i18n-placeholder"));
    if (val != null) el.setAttribute("placeholder", val);
  });
  root.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.getAttribute("data-lang") === getLang()));
  });
  root.querySelectorAll("a[data-keep-lang]").forEach((a) => {
    const href = a.getAttribute("href") || "./";
    const hashAt = href.indexOf("#");
    const hash = hashAt >= 0 ? href.slice(hashAt) : "";
    const before = hashAt >= 0 ? href.slice(0, hashAt) : href;
    const path = before.split("?")[0];
    a.setAttribute("href", `${path}?lang=${getLang()}${hash}`);
  });
}

function lookup(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
}

function bindLangSwitch(root = document) {
  root.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.getAttribute("data-lang")));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  applyI18n();
  bindLangSwitch();
});
