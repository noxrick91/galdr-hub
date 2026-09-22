const MARKET_INDEX = "./plugins/index.json";
const MARKET_METADATA = "./plugins/metadata.json";

// The protected publishing workflow replaces this snapshot with the signed
// marketplace indexes. Keeping a small snapshot here makes the catalog useful
// when previewing the hub directly from this repository (before a first
// publication has created plugins/index.json and metadata.json).
const EMBEDDED_MARKETPLACE = [
  {
    id: "com.noxcaw.term.downloader",
    name: "Galdr Downloader",
    version: "0.3.15",
    description: "Concurrent and resumable file, media, HLS, magnet, and BitTorrent downloader",
    license: "Proprietary",
    capabilities: ["http", "p2p_network", "files_write", "ui"],
    packages: ["linux x86_64", "linux aarch64", "windows x86_64", "windows aarch64"],
  },
  {
    id: "com.noxcaw.term.git",
    name: "Galdr Git",
    version: "0.1.9",
    description: "Visual Git history, changes, branches, commits, and remote operations",
    license: "Proprietary",
    capabilities: ["context_read", "workspace_write", "http", "ui", "credentials_use", "ssh_agent_use"],
    packages: ["linux x86_64", "linux aarch64", "windows x86_64", "windows aarch64"],
  },
  {
    id: "com.noxcaw.term.password-manager",
    name: "Galdr Password Manager",
    version: "0.1.4",
    description: "Encrypted credentials, scoped plugin authorization, and security controls",
    license: "Proprietary",
    capabilities: ["ui", "credentials_manage"],
    packages: ["linux x86_64", "linux aarch64", "windows x86_64", "windows aarch64"],
  },
  {
    id: "com.noxcaw.term.ssh",
    name: "Galdr SSH",
    version: "0.1.12",
    description: "Managed SSH connections with explicit password or key login and secure SFTP browsing",
    license: "Proprietary",
    capabilities: ["context_read", "terminal_write", "tabs_manage", "network", "files_read", "files_write", "user_files_read", "ui", "ssh_agent_use"],
    packages: ["linux x86_64", "linux aarch64", "windows x86_64", "windows aarch64"],
  },
];

let marketplacePlugins = [];
let marketplaceError = false;
let marketplaceSnapshot = false;
let marketplaceCategory = "all";

const MARKET_COPY = {
  zh: {
    all: "全部插件", development: "开发工具", remote: "远程连接", downloads: "下载", security: "安全", tools: "工具",
    filterLabel: "插件分类", trustKicker: "YOUR TERMINAL. YOUR RULES.", trustTitle: "能力透明，边界清晰。",
    securityDocs: "了解权限与隔离", snapshot: "当前显示网站附带的目录快照，安装时会查询市场索引。",
    downloader: "并发下载与断点续传，支持文件、媒体、HLS、Magnet 和 BitTorrent。",
    git: "在终端里查看提交历史、审阅改动、管理分支与执行远程操作。",
    "password-manager": "加密保存凭证，按插件授予访问权限，让敏感信息始终在你的掌控之中。",
    ssh: "管理 SSH 连接，通过密码或密钥登录，在安全的 SFTP 界面中浏览文件。",
  },
  en: {
    all: "All plugins", development: "Development", remote: "Remote", downloads: "Downloads", security: "Security", tools: "Tools",
    filterLabel: "Plugin categories", trustKicker: "YOUR TERMINAL. YOUR RULES.", trustTitle: "Clear capabilities. Clear boundaries.",
    securityDocs: "Explore permissions & isolation", snapshot: "Showing the catalog snapshot included with this site. Installation checks the marketplace index.",
  },
};
const MARKET_CATEGORIES = {
  "com.noxcaw.term.downloader": "downloads",
  "com.noxcaw.term.git": "development",
  "com.noxcaw.term.password-manager": "security",
  "com.noxcaw.term.ssh": "remote",
};
const MARKET_ICONS = {
  development: '<circle cx="7" cy="5" r="2"/><circle cx="17" cy="7" r="2"/><circle cx="7" cy="19" r="2"/><path d="M7 7v10m10-8v2c0 4-10 2-10 6"/>',
  downloads: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  remote: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 9 3 3-3 3m6 0h4"/>',
  security: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/>',
  tools: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 12h8m-4-4v8"/>',
};

function marketCopy(key) {
  const lang = typeof getLang === "function" ? getLang() : "en";
  return MARKET_COPY[lang]?.[key] || MARKET_COPY.en[key] || key;
}

function pluginCategory(plugin) {
  return MARKET_CATEGORIES[plugin.id] || "tools";
}

function pluginDescription(plugin) {
  if (marketplaceSnapshot && typeof getLang === "function" && getLang() === "zh") {
    return MARKET_COPY.zh[plugin.id.split(".").at(-1)] || plugin.description;
  }
  return plugin.description;
}

function marketIcon(category) {
  const icon = element("span", "market-plugin-icon");
  icon.setAttribute("aria-hidden", "true");
  icon.innerHTML = `<svg viewBox="0 0 24 24">${MARKET_ICONS[category] || MARKET_ICONS.tools}</svg>`;
  return icon;
}


function marketText(key, fallback) {
  const value = typeof dict === "function" ? key.split(".").reduce((item, part) => item?.[part], dict()) : null;
  return value == null ? fallback : value;
}

function latestStable(versions) {
  const stable = (versions || []).filter((version) => !String(version.version || "").includes("-"));
  const candidates = stable.length ? stable : versions || [];
  return [...candidates].sort((left, right) =>
    String(right.version || "").localeCompare(String(left.version || ""), undefined, {
      numeric: true,
      sensitivity: "base",
    })
  )[0];
}

function capabilityLabel(value) {
  const labels = {
    http: "HTTP",
    network: marketText("market.capNetwork", "Remote network"),
    p2p_network: marketText("market.capP2p", "P2P network"),
    context_read: marketText("market.capContextRead", "Read context"),
    terminal_read: marketText("market.capTerminalRead", "Read terminal"),
    terminal_write: marketText("market.capTerminalWrite", "Write terminal"),
    tabs_manage: marketText("market.capTabs", "Manage tabs"),
    panes_manage: marketText("market.capPanes", "Manage panes"),
    clipboard_read: marketText("market.capClipboardRead", "Read clipboard"),
    clipboard_write: marketText("market.capClipboardWrite", "Write clipboard"),
    notifications: marketText("market.capNotifications", "Notifications"),
    events: marketText("market.capEvents", "Events"),
    files_read: marketText("market.capFilesRead", "Read downloads"),
    files_write: marketText("market.capFilesWrite", "Write downloads"),
    user_files_read: marketText("market.capUserFilesRead", "Read user files"),
    workspace_read: marketText("market.capWorkspaceRead", "Read current workspace"),
    workspace_write: marketText("market.capWorkspaceWrite", "Write current workspace"),
    credentials_use: marketText("market.capCredentialsUse", "Use credentials"),
    credentials_manage: marketText("market.capCredentialsManage", "Manage credentials"),
    ssh_agent_use: marketText("market.capSshAgent", "Use SSH agent"),
    ui: marketText("market.capUi", "UI"),
    shell_state: marketText("market.capShell", "Shell state"),
  };
  return labels[value] || value.replaceAll("_", " ");
}

function installCommand(plugin) {
  return `galdr plugin install-from ${plugin.id}`;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function renderMarketplace() {
  const list = document.getElementById("plugin-list");
  const status = document.getElementById("plugin-status");
  const source = document.getElementById("plugin-source");
  const query = (document.getElementById("plugin-search")?.value || "").trim().toLowerCase();
  document.querySelectorAll("[data-market-text]").forEach((node) => {
    node.textContent = marketCopy(node.dataset.marketText);
  });
  document.querySelectorAll("[data-market-label]").forEach((node) => {
    node.setAttribute("aria-label", marketCopy(node.dataset.marketLabel));
  });
  document.querySelectorAll("[data-category]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.category === marketplaceCategory));
  });
  list.replaceChildren();
  const filtered = marketplacePlugins.filter((plugin) =>
    (marketplaceCategory === "all" || pluginCategory(plugin) === marketplaceCategory) &&
    (!query || `${plugin.id} ${plugin.name} ${plugin.description} ${pluginDescription(plugin)}`.toLowerCase().includes(query))
  );
  status.textContent = marketplaceError
    ? marketText("market.error", "The plugin marketplace is temporarily unavailable.")
    : filtered.length
    ? marketText("market.count", (count) => `${count} plugins`)(filtered.length)
    : marketText("market.empty", "No matching plugins");
  if (source) {
    source.hidden = !marketplaceSnapshot;
    source.textContent = marketplaceSnapshot ? marketCopy("snapshot") : "";
  }

  if (!filtered.length) {
    list.append(element("p", "market-empty", status.textContent));
    return;
  }

  for (const plugin of filtered) {
    const version = latestStable(plugin.versions);
    const category = pluginCategory(plugin);
    const card = element("article", "market-card");
    const heading = element("div", "market-card-head");
    const names = element("div", "market-card-names");
    names.append(element("h3", null, plugin.name));
    names.append(element("span", "market-category", marketCopy(category)));
    heading.append(marketIcon(category), names);
    heading.append(element("span", "market-version", version?.version ? `v${version.version}` : "—"));
    card.append(heading);
    card.append(element("p", "market-description", pluginDescription(plugin)));
    card.append(element("p", "market-id", plugin.id));

    const facts = element("dl", "market-facts");
    const addFact = (label, value) => {
      facts.append(element("dt", null, label));
      facts.append(element("dd", null, value));
    };
    const platforms = version?.packages?.length
      ? version.packages
          .map((item) => typeof item === "string" ? item : `${item.os} ${item.arch}`)
          .join(" · ")
      : "—";
    addFact(marketText("market.platforms", "Platforms"), platforms || "—");
    if (plugin.license) addFact(marketText("market.license", "License"), plugin.license);
    card.append(facts);

    const permissions = plugin.capabilities || [];
    if (permissions.length) {
      const permissionDetails = element("details", "market-permissions");
      const permissionSummary = element("summary");
      permissionSummary.append(
        element("span", null, marketText("market.permissions", "Permissions")),
        element("span", "market-permission-count", String(permissions.length))
      );
      permissionDetails.append(permissionSummary);
      const capabilities = element("div", "market-capabilities");
      capabilities.setAttribute("role", "list");
      for (const capability of permissions) {
        const item = element("span", "market-capability", capabilityLabel(capability));
        item.setAttribute("role", "listitem");
        capabilities.append(item);
      }
      permissionDetails.append(capabilities);
      card.append(permissionDetails);
    } else {
      const noPermissions = element("p", "market-no-permissions");
      noPermissions.append(
        element("span", null, marketText("market.permissions", "Permissions")),
        element("span", null, marketText("market.none", "None"))
      );
      card.append(noPermissions);
    }

    const command = installCommand(plugin);
    const commandRow = element("div", "market-command");
    commandRow.append(element("code", null, command));
    const copy = element("button", "market-copy", marketText("market.copy", "Copy command"));
    copy.type = "button";
    copy.setAttribute("aria-label", `${marketText("market.copy", "Copy command")} · ${plugin.name}`);
    copy.setAttribute("aria-live", "polite");
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(command);
        copy.textContent = marketText("market.copied", "Copied");
      } catch {
        copy.textContent = marketText("market.copyFailed", "Copy failed");
      }
    });
    commandRow.append(copy);
    card.append(commandRow);
    list.append(card);
  }
}

async function loadMarketplace() {
  try {
    const [indexResponse, metadataResponse] = await Promise.all([
      fetch(MARKET_INDEX, { cache: "no-cache" }),
      fetch(MARKET_METADATA, { cache: "no-cache" }),
    ]);
    if (!indexResponse.ok || !metadataResponse.ok) throw new Error("marketplace unavailable");
    const [index, metadata] = await Promise.all([indexResponse.json(), metadataResponse.json()]);
    marketplaceSnapshot = false;
    const details = new Map((metadata.plugins || []).map((plugin) => [plugin.id, plugin]));
    marketplacePlugins = (index.plugins || []).map((plugin) => ({
      ...plugin,
      ...(details.get(plugin.id) || {}),
      versions: plugin.versions || [],
    }));
  } catch {
    marketplaceSnapshot = true;
    marketplacePlugins = EMBEDDED_MARKETPLACE.map((plugin) => ({
      ...plugin,
      versions: [{ version: plugin.version, packages: plugin.packages }],
    }));
  }
  marketplaceError = false;
  renderMarketplace();
}

document.addEventListener("DOMContentLoaded", () => {
  const search = document.getElementById("plugin-search");
  const query = new URLSearchParams(location.search).get("q");
  if (search && query != null) search.value = query;
  search?.addEventListener("input", renderMarketplace);
  document.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      marketplaceCategory = button.dataset.category;
      renderMarketplace();
    });
  });
  loadMarketplace().catch(() => {
    marketplaceError = true;
    renderMarketplace();
  });
});

document.addEventListener("galdr-lang", renderMarketplace);
