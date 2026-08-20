const LANGS = ["zh", "en"];
const I18N = {
  zh: {
    meta: {
      title: "Galdr — GPU 加速终端",
      desc: "用 Rust 写的 GPU 终端。默认登录内置 galdr-shell，支持标签、分屏与会话恢复。",
      docsTitle: "文档 — Galdr",
      docsDesc: "安装、galdrc、快捷键、配置、mux 与会话恢复。",
    },
    nav: { home: "首页", download: "下载", docs: "文档", github: "GitHub" },
    hero: {
      kicker: "你的桌面上",
      title: "一台\nGPU 加速的终端",
      lede: "用 Rust 写的 GPU 终端。默认登录内置 galdr-shell，启动文件只有 galdrc。标签、分屏、搜索，会话可以分离再附着。",
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
      installHint: "装到 ~/.galdr/bin。装完请 source ~/.galdr/env 或新开终端。",
      updateHint: "再跑一次安装器。先关掉正在跑的 Galdr，装完 source ~/.galdr/env 再看版本。",
      uninstallHint: "删掉 ~/.galdr。配置在 ~/.config/galdr/，不会一起删。",
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
      cap: "wgpu 实例化单元格，HiDPI 下字形按物理像素栅格化，CJK 和 emoji 走回退字体。",
      safeT: "自己的 shell",
      safe: "默认登录 galdr-shell。只读 galdrc，不会偷偷 source .bashrc；要用旧 rc 就 include。",
      seeT: "标签与分屏",
      see: "拖分屏、放大 pane、搜索、命令面板。mux 拥有 pane，窗口只是附着。",
      modelT: "会话恢复",
      model: "可重开上次的标签、分屏和 cwd。也可以先列出上次前台命令再确认。",
      extendT: "分离再附着",
      extend: "galdr --server 然后 galdr --attach。Linux 用 Unix socket，Windows 用 named pipe。",
      automateT: "诚实限制",
      automate: "不是 bash 5 认证。Tab 不跑 complete -F；Windows 没有 setpgid 作业控制。",
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
      title: "Galdr · ~",
      placeholder: "输入命令",
    },
    notfound: { title: "没有这一页。", back: "回首页" },
  },
  en: {
    meta: {
      title: "Galdr — a GPU-accelerated terminal",
      desc: "A GPU terminal written in Rust. Default login is galdr-shell, with tabs, splits, and session restore.",
      docsTitle: "Docs — Galdr",
      docsDesc: "Install, galdrc, shortcuts, config, mux, and session restore.",
    },
    nav: { home: "Home", download: "Download", docs: "Docs", github: "GitHub" },
    hero: {
      kicker: "On your desktop",
      title: "A GPU-accelerated\nterminal",
      lede: "A GPU terminal written in Rust. Default login is galdr-shell; the only startup file is galdrc. Tabs, splits, search, and a mux you can detach and reattach.",
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
      installHint: "Installs into ~/.galdr/bin. Afterwards source ~/.galdr/env or open a new terminal.",
      updateHint: "Run the installer again. Close running Galdr first, then source ~/.galdr/env and check the version.",
      uninstallHint: "Deletes ~/.galdr. Config in ~/.config/galdr/ is left alone.",
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
      cap: "wgpu instanced cells. Glyphs raster in physical pixels on HiDPI, with CJK and emoji fallback fonts.",
      safeT: "Its own shell",
      safe: "Default login is galdr-shell. It only reads galdrc — include an old rc if you want it.",
      seeT: "Tabs and splits",
      see: "Drag splits, zoom a pane, search, command palette. The mux owns panes; the window attaches.",
      modelT: "Session restore",
      model: "Reopen last tabs, splits, and cwd. Or list last foreground commands and confirm first.",
      extendT: "Detach and attach",
      extend: "galdr --server then galdr --attach. Unix socket on Linux, named pipe on Windows.",
      automateT: "Honest limits",
      automate: "Not a bash 5 certification. Tab does not eval complete -F. Windows has no setpgid job control.",
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
      title: "Galdr · ~",
      placeholder: "type a command",
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
