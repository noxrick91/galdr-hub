const LANGS = ["zh", "en"];
const I18N = {
  zh: {
    home: {
      pillNew: "最新",
      pillText: "查看更新内容",
      title: "心无旁骛。\n<em>一行，进入状态。</em>",
      lede: "从第一行命令，到最后一个构建。GPU 加速的原生终端，让 Shell、分屏、会话与插件融入你的工作节奏。",
      quickStart: "阅读快速开始",
      demoWorkspace: "工作空间",
      demoSplit: "自由分屏",
      demoCompletion: "智能补全",
      demoCaption: "交互演示 · 切换工作模式",
      sessionLabel: "开发会话",
      workspaceLabel: "工作空间",
      sessionsLabel: "会话",
      demoHelp: "准备就绪。保持专注，继续创造。",
      completionLabel: "命令补全",
      specGpu: "实例化单元格渲染",
      specRc: "唯一的启动文件",
      specSession: "会话独立于窗口",
      specPlugin: "按能力授权的插件",
      foundationKicker: "基础能力",
      foundationTitle: "少一点阻力。\n多一点心流。",
      foundationLead: "打磨每一次输入，照顾每一处细节。你需要的终端基础能力，从一开始就完整。",
      gpuTitle: "每个像素，各就其位。",
      gpuBody: "wgpu 实例化单元格渲染，适配 HiDPI。中文、emoji 与输入法从一开始就是完整体验的一部分。",
      shellTitle: "熟悉的命令，自己的节奏。",
      shellBody: "内置 galdr-shell，只读取一个 galdrc。旧配置按需 include，也可以换回系统 Shell。",
      panesTitle: "给每项工作，一席之地。",
      panesBody: "自由拆分、拖动标签、调整分栏。代码、日志和远程会话井然有序。",
      completeTitle: "少打几个字。",
      completeBody: "Tab 呼出补全菜单，支持子串与缩写匹配：cko 也能找到 checkout。",
      keysTitle: "双手不离键盘。",
      keysBody: "命令面板、分屏、搜索与分离都有快捷键，每个绑定都能在 config.toml 中改写。",
      keyPalette: "命令面板",
      keySplit: "向右分屏",
      keyDetach: "分离会话",
      configTitle: "保存即生效。",
      configBody: "零配置即可启动。保存 config.toml，不到半秒自动重载；字体、主题与光标也能在设置里调整。",
      sessionKicker: "会话",
      sessionTitle: "离开窗口。\n<em>留住工作。</em>",
      sessionBody: "会话独立于窗口运行。分离，再附着，回到原来的标签与分屏。让工作延续，少一次从头开始。",
      sessionLink: "了解会话与分屏",
      sessionPersistent: "持续运行",
      step1T: "工作",
      step1: "标签、分屏、构建与日志，都在同一个会话里。",
      step2T: "分离",
      step2: "按 <kbd>Ctrl</kbd><kbd>Shift</kbd><kbd>L</kbd> 或关闭窗口，进程继续运行。",
      step3T: "附着",
      step3: "回到原来的标签、分屏与目录，接着往下做。",
      pluginsKicker: "插件",
      pluginsTitle: "一个终端。\n更多可能。",
      pluginsBody: "把常用工具带进工作流。浏览官方插件，安装前查看平台支持和请求权限。",
      pluginsLink: "浏览插件市场",
      git: "版本管理，触手可及。",
      ssh: "远程主机，即刻连接。",
      downloader: "下载任务，尽在掌握。",
      vault: "凭证管理，安心有序。",
      trustProcess: "进程插件运行在严格的平台沙箱中",
      trustWasm: "Wasm 组件有内存上限与执行期限",
      trustGrant: "每一项能力都由你授予",
      installKicker: "安装",
      installTitle: "下一行命令，\n<em>从这里开始。</em>",
      installBody: "选择你的平台，复制命令。安装器会自动匹配架构并校验下载文件。",
      factArch: "自动识别 x64 / ARM64",
      factSum: "下载后校验，失败即停止",
      factPath: "装在用户目录，无需 root",
      manualDownloads: "手动下载与校验和",
    },
    site: { theme: "切换明暗主题" },
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
      installHintWin: "在 PowerShell 中运行，安装到用户目录的 .galdr/bin，并加入 PATH、开始菜单与文件夹右键菜单。",
      updateHintWin: "在 PowerShell 中重新运行安装器，校验并替换运行时。完成后重启已打开的 Galdr，再运行 galdr --version 确认版本。",
      uninstallHintWin: "在 PowerShell 中运行卸载脚本，移除程序与菜单项，保留用户配置。",
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
      close: "关闭",
      searchHint: "输入关键词，按 Enter 打开",
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
      title: "让终端，\n<em>多一种可能。</em>",
      lede: "连接远程主机、管理代码与凭证、处理下载。把需要的工具带进终端，每项权限都由你决定。",
      explore: "浏览插件",
      build: "开发插件",
      manage: "管理插件",
      catalogKicker: "官方目录",
      catalogTitle: "官方插件目录",
      mockAsk: "该插件请求以下能力：",
      mockAllow: "授予",
      mockDeny: "暂不",
      ctaTitle: "为 Galdr 写一个插件。",
      ctaBody: "版本化的插件 API，覆盖命令、Shell 集成、事件与声明式 UI。从一个 plugin.toml 开始。",
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
        `${tag}${date ? ` · ${date}` : ""}`,
    },
    dl: {
      prefix: "下载",
      unavailable: "暂无可用版本",
      error: "最新版暂时读不到，用上面的命令安装即可。",
      releases: "用安装命令",
      unsupported: "macOS 预编译包暂未开放",
    },
    footer: {
      tagline: "留在终端，进入状态。",
      colProduct: "产品",
      colDocs: "文档",
      colMore: "更多",
      install: "安装 Galdr",
      quickStart: "快速开始",
      keys: "快捷键",
      config: "配置",
      pluginDev: "插件开发",
      help: "故障排除",
      backTop: "回到顶部 ↑",
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
    notfound: { title: "这个页面，\n<em>暂时离线。</em>", back: "返回首页", lede: "路径可能已经变更，或者链接有误。回到首页，继续你的探索。", docs: "浏览文档", metaTitle: "未找到页面 — Galdr" },
  },
  en: {
    home: {
      pillNew: "NEW",
      pillText: "See what changed",
      title: "Make room\n<em>for flow.</em>",
      lede: "From the first command to the final build. A native, GPU-accelerated terminal where your shell, splits, sessions, and tools move at your pace.",
      quickStart: "Read the quick start",
      demoWorkspace: "Workspace",
      demoSplit: "Split panes",
      demoCompletion: "Completion",
      demoCaption: "Interactive preview · switch modes",
      sessionLabel: "dev session",
      workspaceLabel: "Workspace",
      sessionsLabel: "Sessions",
      demoHelp: "Ready when you are. Stay focused. Keep creating.",
      completionLabel: "Completion",
      specGpu: "Instanced cell rendering",
      specRc: "One startup file",
      specSession: "Sessions outlive windows",
      specPlugin: "Capability-scoped plugins",
      foundationKicker: "Foundations",
      foundationTitle: "Less friction.\nMore momentum.",
      foundationLead: "Thoughtful from the first keystroke. The terminal essentials, complete from day one.",
      gpuTitle: "Every pixel. In its place.",
      gpuBody: "wgpu instanced cell rendering, built for HiDPI. CJK, emoji, and input methods are part of the experience from the start.",
      shellTitle: "Your shell. Your rhythm.",
      shellBody: "galdr-shell reads exactly one galdrc. Include your old config when you want it, or switch back to a system shell.",
      panesTitle: "Space for every thought.",
      panesBody: "Split, drag tabs, and resize. Code, logs, and remote sessions stay in view.",
      completeTitle: "Type less.",
      completeBody: "Tab opens a completion menu with substring and abbreviation matching: cko finds checkout.",
      keysTitle: "Hands on the keys.",
      keysBody: "Palette, splits, search, and detach all have shortcuts, and every binding can be rewritten in config.toml.",
      keyPalette: "Command palette",
      keySplit: "Split right",
      keyDetach: "Detach session",
      configTitle: "Save. It's live.",
      configBody: "Starts with zero config. Save config.toml and it reloads in under half a second; font, theme, and cursor are in Settings too.",
      sessionKicker: "Sessions",
      sessionTitle: "Leave the window.\n<em>Keep the work.</em>",
      sessionBody: "Sessions live beyond the window. Detach, reattach, and return to your tabs and splits. Less starting over. More carrying on.",
      sessionLink: "Explore sessions and splits",
      sessionPersistent: "running",
      step1T: "Work",
      step1: "Tabs, splits, builds, and logs, all in one session.",
      step2T: "Detach",
      step2: "Press <kbd>Ctrl</kbd><kbd>Shift</kbd><kbd>L</kbd> or close the window. Processes keep running.",
      step3T: "Attach",
      step3: "Back to the same tabs, splits, and directories. Carry on.",
      pluginsKicker: "Plugins",
      pluginsTitle: "One terminal.\nMore possibilities.",
      pluginsBody: "Bring your everyday tools into the flow. Explore official plugins, with platforms and permissions visible before you install.",
      pluginsLink: "Browse the marketplace",
      git: "Your code, under control.",
      ssh: "Remote feels right here.",
      downloader: "Downloads, all in hand.",
      vault: "Credentials, kept in order.",
      trustProcess: "Process plugins run in a strict platform sandbox",
      trustWasm: "Wasm components have memory and time limits",
      trustGrant: "Every capability is granted by you",
      installKicker: "Install",
      installTitle: "Your next command\n<em>starts here.</em>",
      installBody: "Choose your platform. Copy the command. The installer matches your architecture and verifies the download.",
      factArch: "Detects x64 / ARM64 for you",
      factSum: "Verified after download, stops on mismatch",
      factPath: "Installs per user, no root needed",
      manualDownloads: "Manual downloads & checksums",
    },
    site: { theme: "Toggle light and dark theme" },
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
      installHintWin: "Run in PowerShell. Installs into .galdr/bin in your user directory and adds PATH, Start menu, and folder context menu entries.",
      updateHintWin: "Run the installer again in PowerShell to verify and replace the runtime. Restart open Galdr windows, then run galdr --version to check the version.",
      uninstallHintWin: "Run the uninstaller in PowerShell to remove the app and menu entries. Your user configuration is kept.",
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
      close: "Close",
      searchHint: "Type to search, press Enter to open",
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
      title: "Your terminal.\n<em>More possibilities.</em>",
      lede: "Connect to remote hosts. Manage code and credentials. Keep downloads moving. Bring your tools into the terminal, with permissions you control.",
      explore: "Browse plugins",
      build: "Build a plugin",
      manage: "Manage plugins",
      catalogKicker: "Official catalog",
      catalogTitle: "Official plugin catalog",
      mockAsk: "This plugin requests:",
      mockAllow: "Grant",
      mockDeny: "Not now",
      ctaTitle: "Build a plugin for Galdr.",
      ctaBody: "A versioned plugin API for commands, shell integration, events, and declarative UI. Start with one plugin.toml.",
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
        `${tag}${date ? ` · ${date}` : ""}`,
    },
    dl: {
      prefix: "Download",
      unavailable: "No build yet",
      error: "Could not load the latest build. Use the install command above.",
      releases: "Use the install command",
      unsupported: "macOS prebuilt packages are temporarily unavailable",
    },
    footer: {
      tagline: "Stay in your terminal. Find your flow.",
      colProduct: "Product",
      colDocs: "Docs",
      colMore: "More",
      install: "Install Galdr",
      quickStart: "Quick start",
      keys: "Shortcuts",
      config: "Config",
      pluginDev: "Build a plugin",
      help: "Troubleshooting",
      backTop: "Back to top ↑",
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
    notfound: { title: "A little off\n<em>the command line.</em>", back: "Back home", lede: "This path may have moved, or the link took a wrong turn. Head home and find your flow again.", docs: "Explore the docs", metaTitle: "Page not found — Galdr" },
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
    title.textContent = key === "notfound" ? d.notfound.metaTitle : key === "docs"
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
  root.querySelectorAll("[data-i18n-label]").forEach((el) => {
    const val = lookup(d, el.getAttribute("data-i18n-label"));
    if (val != null) el.setAttribute("aria-label", val);
  });
  root.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.getAttribute("data-lang") === getLang()));
  });
  root.querySelectorAll("a[data-keep-lang]").forEach((a) => {
    const href = a.getAttribute("href") || "./";
    const hashAt = href.indexOf("#");
    const hash = hashAt >= 0 ? href.slice(hashAt) : "";
    const before = hashAt >= 0 ? href.slice(0, hashAt) : href;
    const [path, query = ""] = before.split("?");
    const params = new URLSearchParams(query);
    params.set("lang", getLang());
    a.setAttribute("href", `${path}?${params}${hash}`);
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

// The saved theme is applied by an inline script in <head>; this only toggles it.
function currentTheme() {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function bindThemeToggle(root = document) {
  root.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(currentTheme() === "light"));
    btn.addEventListener("click", () => {
      const next = currentTheme() === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem("galdr-theme", next);
      } catch {
        /* ignore */
      }
      btn.setAttribute("aria-pressed", String(next === "light"));
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  applyI18n();
  bindLangSwitch();
  bindThemeToggle();
});
