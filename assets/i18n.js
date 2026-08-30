const LANGS = ["zh", "en"];
const I18N = {
  zh: {
    meta: {
      title: "Galdr — GPU 加速终端",
      desc: "GPU 加速的原生终端、内置 Shell、可恢复会话与安全插件系统。",
      docsTitle: "文档 — Galdr",
      docsDesc: "Galdr 的安装、Shell、快捷键、配置、会话与插件完整文档。",
      marketplaceTitle: "插件市场 — Galdr",
      marketplaceDesc: "浏览 Galdr 官方插件，了解平台支持与所需权限。",
    },
    a11y: { skip: "跳到正文" },
    nav: { home: "首页", download: "下载", market: "插件", docs: "文档", get: "获取 Galdr" },
    hero: {
      kicker: "GALDR / 原生终端系统",
      title: "终端不是窗口。\n<em>它是工作现场。</em>",
      lede: "从 GPU 渲染、内置 Shell 到可分离会话，Galdr 把每天的命令行工作流收进一个快、稳、可扩展的原生终端。",
      install: "安装 Galdr",
      quickStart: "阅读快速开始",
      manual: "手动下载",
      downloading: "加载中…",
      docs: "文档",
      waiting: "正在读取最新版本",
    },
    signals: {
      render: "实例化单元格渲染",
      rc: "唯一启动文件 galdrc",
      session: "标签与会话可重连",
      plugins: "隔离式插件运行时",
    },
    install: {
      unix: "Linux / macOS",
      linux: "Linux",
      mac: "macOS",
      win: "Windows",
      copy: "复制命令",
      copyInstall: "复制安装指令",
      copyUpdate: "复制更新指令",
      copyUninstall: "复制卸载指令",
      copied: "已复制",
      copyFailed: "复制失败，请手动选择指令",
    },
    howto: {
      install: "安装",
      update: "更新",
      uninstall: "卸载",
      docs: "查看完整安装说明",
      installHint: "装到 ~/.galdr/bin，并加入应用菜单和文件夹右键。装完请 source ~/.galdr/env 或新开终端。",
      updateHint: "再跑一次安装器。安装器会校验并可回滚地替换整套运行时，不会中断当前会话；完成后重启已打开的 Galdr，并 source ~/.galdr/env 确认版本。",
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
      install: "安装，然后保持更新。",
      installKicker: "一条命令开始",
      installLead: "自动识别 Linux / Windows 与 x64 / ARM64，校验 SHA-256，并在安装前停止进程、清理旧版本。",
      howto: "安装",
      why: "把终端该做的事，做完整。",
      whyKicker: "从像素到进程",
      whyLead: "不是套在系统 Shell 外的一层皮肤。渲染、Shell、会话和扩展能力在同一套清晰的边界里协作。",
      download: "选择你的构建。",
      downloadKicker: "RELEASE CHANNEL",
      downloadLead: "安装器会自动选择；这里也提供每个平台的原始文件与校验和。",
    },
    cards: {
      capT: "字形交给 GPU，细节留在像素里。",
      cap: "wgpu 实例化单元格渲染适配 HiDPI；CJK、emoji 和 IME 从一开始就是完整体验的一部分。",
      safeT: "一个真正属于 Galdr 的 Shell。",
      safe: "默认进入 galdr-shell，只读取 galdrc。需要旧配置时再明确 include，不暗中继承环境。",
      seeT: "标签、分屏，属于会话。",
      see: "拖动排序、调整分栏、放大 pane。窗口只是附着层，工作状态不必随窗口消失。",
      completeT: "按频率补全",
      complete: "Tab 在提示符上方弹出菜单，常用命令排在前面。打完命令名会提示参数。Esc 关掉弹出框。",
      modelT: "关掉窗口，不等于丢掉现场。",
      model: "恢复标签、分屏和目录；仍在运行的命令会在恢复前列出，由你决定是否继续。",
      extendT: "分离再附着",
      extend: "关掉窗口，进程还在。galdr --attach 回到原来的标签和分屏。",
    },
    pluginsPromo: {
      kicker: "GALDR PLUGIN API · V1",
      title: "能力可以扩展，\n信任必须有边界。",
      lede: "插件通过版本化协议接入命令、Shell、事件与声明式 UI。请求什么能力、授予什么能力，都清楚可见。",
      process: "进程插件在严格平台沙箱中运行",
      wasm: "Wasm 组件有内存上限与执行期限",
      native: "原生插件必须显式信任",
      market: "探索插件",
      docs: "插件文档",
      official: "官方插件",
      downloader: "并发与断点续传下载器，支持文件、媒体、HLS、Magnet 与 BitTorrent。",
      sandboxed: "由 galdr-plugin-host 隔离运行",
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
    market: {
      kicker: "GALDR PLUGIN API · V1",
      title: "扩展命令，\n<em>不扩张信任。</em>",
      lede: "插件可以贡献命令、Shell 集成、事件和声明式界面；版本、平台与权限在安装之前就清楚可见。",
      explore: "浏览插件",
      build: "开发插件",
      manage: "管理插件",
      catalogKicker: "OFFICIAL CATALOG",
      catalogTitle: "官方插件目录",
      principleVerifyT: "先校验，再安装",
      principleVerify: "市场包必须提供 SHA-256，版本资产不可变。",
      principleGrantT: "权限由你授予",
      principleGrant: "请求能力不会自动变成已授予能力。",
      principleHostT: "代码留在宿主之外",
      principleHost: "进程与 Wasm 插件不会加载进终端进程。",
      search: "搜索名称、ID 或描述",
      loading: "正在读取插件索引…",
      empty: "没有匹配的插件",
      error: "插件市场暂时不可用。",
      count: (n) => `${n} 个插件`,
      platforms: "平台",
      permissions: "请求权限",
      license: "许可证",
      none: "无",
      copy: "复制命令",
      copied: "已复制",
      copyFailed: "复制失败",
      capFilesRead: "读取下载目录",
      capFilesWrite: "写入下载目录",
      capUserFilesRead: "读取用户文件",
      capWorkspaceRead: "读取当前工作区",
      capWorkspaceWrite: "写入当前工作区",
      capCredentialsUse: "使用凭证",
      capCredentialsManage: "管理凭证",
      capSshAgent: "使用 SSH Agent",
      capShell: "Shell 状态",
      capNetwork: "远程网络",
      capP2p: "P2P 网络",
      capContextRead: "读取上下文",
      capTerminalRead: "读取终端",
      capTerminalWrite: "写入终端",
      capTabs: "管理标签",
      capPanes: "管理 Pane",
      capClipboardRead: "读取剪贴板",
      capClipboardWrite: "写入剪贴板",
      capNotifications: "系统通知",
      capEvents: "终端事件",
      capUi: "声明式 UI",
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
      tagline: "把 Shell、会话与扩展收进同一个工作现场。",
      docs: "安装文档",
      market: "插件市场",
      pluginDocs: "插件文档",
      releases: "下载",
      changelog: "更新记录",
    },
    stage: {
      title: "Galdr · ~/Project/galdr",
      placeholder: "输入命令",
      complete: "补全",
      completeHint: "↑↓ 选择   Tab / 回车 采用",
      attached: "已附着  work  ·  3 个标签  ·  左右分屏",
      attachedShort: "已附着",
    },
    notfound: { title: "没有这一页。", back: "回首页" },
  },
  en: {
    meta: {
      title: "Galdr — a GPU-accelerated terminal",
      desc: "A native GPU-accelerated terminal with its own shell, restorable sessions, and a capability-based plugin system.",
      docsTitle: "Docs — Galdr",
      docsDesc: "Complete Galdr documentation for install, shell, config, sessions, and plugins.",
      marketplaceTitle: "Plugin marketplace — Galdr",
      marketplaceDesc: "Browse official Galdr plugins, supported platforms, and requested capabilities.",
    },
    a11y: { skip: "Skip to content" },
    nav: { home: "Home", download: "Download", market: "Plugins", docs: "Docs", get: "Get Galdr" },
    hero: {
      kicker: "GALDR / NATIVE TERMINAL SYSTEM",
      title: "The terminal is not a window.\n<em>It is the workspace.</em>",
      lede: "From GPU rendering and a builtin shell to detachable sessions, Galdr brings the daily command-line workflow into one fast, stable, extensible native terminal.",
      install: "Install Galdr",
      quickStart: "Read the quick start",
      manual: "Manual downloads",
      downloading: "Loading…",
      docs: "Docs",
      waiting: "Reading the latest release",
    },
    signals: {
      render: "Instanced cell rendering",
      rc: "One startup file: galdrc",
      session: "Reconnect tabs and sessions",
      plugins: "Isolated plugin runtimes",
    },
    install: {
      unix: "Linux / macOS",
      linux: "Linux",
      mac: "macOS",
      win: "Windows",
      copy: "Copy command",
      copyInstall: "Copy install command",
      copyUpdate: "Copy update command",
      copyUninstall: "Copy uninstall command",
      copied: "Copied",
      copyFailed: "Copy failed — select the command manually",
    },
    howto: {
      install: "Install",
      update: "Update",
      uninstall: "Uninstall",
      docs: "Read the full install guide",
      installHint: "Installs into ~/.galdr/bin and adds the app menu plus folder context menu. Afterwards source ~/.galdr/env or open a new terminal.",
      updateHint: "Run the installer again. It verifies and replaces the complete runtime with rollback without interrupting the current session; afterwards restart open Galdr windows, source ~/.galdr/env, and check the version.",
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
      install: "Install once. Stay current.",
      installKicker: "One command to begin",
      installLead: "Detects Linux / Windows and x64 / ARM64, verifies SHA-256, then stops running processes and removes the previous install.",
      howto: "Install",
      why: "The whole job of a terminal, done well.",
      whyKicker: "From pixels to processes",
      whyLead: "Not a skin around the system shell. Rendering, shell, sessions, and extensions cooperate across explicit boundaries.",
      download: "Choose your build.",
      downloadKicker: "RELEASE CHANNEL",
      downloadLead: "The installer chooses automatically; raw platform builds and checksums are here when you need them.",
    },
    cards: {
      capT: "Glyphs on the GPU. Detail on the pixel grid.",
      cap: "wgpu instanced cell rendering is built for HiDPI; CJK, emoji, and IME are first-class parts of the experience.",
      safeT: "A shell that actually belongs to Galdr.",
      safe: "Land in galdr-shell, which reads only galdrc. Include legacy config explicitly instead of inheriting it in secret.",
      seeT: "Tabs and splits belong to the session.",
      see: "Reorder tabs, resize splits, and zoom a pane. The window is an attachment, so working state need not vanish with it.",
      completeT: "Frequency completion",
      complete: "Tab opens a menu above the prompt, most-used commands first. A finished command name offers its arguments. Esc closes the popup.",
      modelT: "Closing a window does not erase the scene.",
      model: "Restore tabs, splits, and directories. Commands that were running are listed first, and you decide whether they continue.",
      extendT: "Detach and attach",
      extend: "Close the window and the process keeps running. galdr --attach returns to the same tabs and splits.",
    },
    pluginsPromo: {
      kicker: "GALDR PLUGIN API · V1",
      title: "Capability can expand.\nTrust stays bounded.",
      lede: "A versioned protocol connects commands, shell integration, events, and declarative UI. Requested and granted capabilities stay explicit.",
      process: "Process plugins run inside a strict platform sandbox",
      wasm: "Wasm components have memory and execution limits",
      native: "Native plugins always require explicit trust",
      market: "Explore plugins",
      docs: "Plugin docs",
      official: "OFFICIAL",
      downloader: "A concurrent, resumable downloader for files, media, HLS, magnets, and BitTorrent.",
      sandboxed: "Isolated by galdr-plugin-host",
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
    market: {
      kicker: "GALDR PLUGIN API · V1",
      title: "Extend commands.\n<em>Not trust.</em>",
      lede: "Plugins can contribute commands, shell integration, events, and declarative UI. Version, platform support, and permissions are visible before install.",
      explore: "Browse plugins",
      build: "Build a plugin",
      manage: "Manage plugins",
      catalogKicker: "OFFICIAL CATALOG",
      catalogTitle: "Official plugin catalog",
      principleVerifyT: "Verify before install",
      principleVerify: "Marketplace packages require SHA-256 and immutable version assets.",
      principleGrantT: "You grant capabilities",
      principleGrant: "Requested access never becomes granted access automatically.",
      principleHostT: "Code stays outside Galdr",
      principleHost: "Process and Wasm plugins never load into the terminal process.",
      search: "Search names, IDs, or descriptions",
      loading: "Loading the plugin index…",
      empty: "No matching plugins",
      error: "The plugin marketplace is temporarily unavailable.",
      count: (n) => `${n} plugin${n === 1 ? "" : "s"}`,
      platforms: "Platforms",
      permissions: "Requested permissions",
      license: "License",
      none: "None",
      copy: "Copy command",
      copied: "Copied",
      copyFailed: "Copy failed",
      capFilesRead: "Read downloads",
      capFilesWrite: "Write downloads",
      capUserFilesRead: "Read user files",
      capWorkspaceRead: "Read current workspace",
      capWorkspaceWrite: "Write current workspace",
      capCredentialsUse: "Use credentials",
      capCredentialsManage: "Manage credentials",
      capSshAgent: "Use SSH agent",
      capShell: "Shell state",
      capNetwork: "Remote network",
      capP2p: "P2P network",
      capContextRead: "Read context",
      capTerminalRead: "Read terminal",
      capTerminalWrite: "Write terminal",
      capTabs: "Manage tabs",
      capPanes: "Manage panes",
      capClipboardRead: "Read clipboard",
      capClipboardWrite: "Write clipboard",
      capNotifications: "Notifications",
      capEvents: "Terminal events",
      capUi: "Declarative UI",
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
      tagline: "Shell, sessions, and extensions in one working context.",
      docs: "Install docs",
      market: "Plugin marketplace",
      pluginDocs: "Plugin docs",
      releases: "Downloads",
      changelog: "Changelog",
    },
    stage: {
      title: "Galdr · ~/Project/galdr",
      placeholder: "type a command",
      complete: "completion",
      completeHint: "↑↓ select   Tab / Enter accept",
      attached: "attached  work  ·  3 tabs  ·  split ×2",
      attachedShort: "attached",
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
    title.textContent = key === "docs"
      ? d.meta.docsTitle
      : key === "plugins"
      ? d.meta.marketplaceTitle
      : d.meta.title;
  }
  const desc = document.querySelector('meta[name="description"]');
  if (desc && desc.dataset.i18nDesc) {
    desc.content = desc.dataset.i18nDesc === "docs"
      ? d.meta.docsDesc
      : desc.dataset.i18nDesc === "plugins"
      ? d.meta.marketplaceDesc
      : d.meta.desc;
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
