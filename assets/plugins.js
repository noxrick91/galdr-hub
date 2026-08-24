const MARKET_INDEX = "./plugins/index.json";
const MARKET_METADATA = "./plugins/metadata.json";

let marketplacePlugins = [];
let marketplaceError = false;

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
  const query = (document.getElementById("plugin-search")?.value || "").trim().toLowerCase();
  list.replaceChildren();
  const filtered = marketplacePlugins.filter((plugin) =>
    !query || `${plugin.id} ${plugin.name} ${plugin.description}`.toLowerCase().includes(query)
  );
  status.textContent = marketplaceError
    ? marketText("market.error", "The plugin marketplace is temporarily unavailable.")
    : filtered.length
    ? marketText("market.count", (count) => `${count} plugins`)(filtered.length)
    : marketText("market.empty", "No matching plugins");

  if (!filtered.length) {
    const empty = element("p", "market-empty", status.textContent);
    list.append(empty);
    return;
  }

  for (const plugin of filtered) {
    const version = latestStable(plugin.versions);
    const card = element("article", "market-card");
    const heading = element("div", "market-card-head");
    const names = element("div");
    names.append(element("h2", null, plugin.name));
    names.append(element("p", "market-id", plugin.id));
    heading.append(names);
    heading.append(element("span", "market-version", version?.version || "—"));
    card.append(heading);
    card.append(element("p", "market-description", plugin.description));

    const facts = element("dl", "market-facts");
    const addFact = (label, value) => {
      facts.append(element("dt", null, label));
      facts.append(element("dd", null, value));
    };
    const platforms = (version?.packages || [])
      .map((item) => `${item.os} ${item.arch}`)
      .join(", ");
    addFact(marketText("market.platforms", "Platforms"), platforms || "—");
    addFact(
      marketText("market.permissions", "Permissions"),
      (plugin.capabilities || []).map(capabilityLabel).join(", ") || marketText("market.none", "None")
    );
    if (plugin.license) addFact(marketText("market.license", "License"), plugin.license);
    card.append(facts);

    if ((plugin.capabilities || []).length) {
      const capabilities = element("div", "market-capabilities");
      for (const capability of plugin.capabilities) {
        capabilities.append(element("span", "market-capability", capabilityLabel(capability)));
      }
      card.append(capabilities);
    }

    const command = installCommand(plugin);
    const commandRow = element("div", "market-command");
    commandRow.append(element("code", null, command));
    const copy = element("button", "copy", marketText("market.copy", "Copy install command"));
    copy.type = "button";
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
  const [indexResponse, metadataResponse] = await Promise.all([
    fetch(MARKET_INDEX, { cache: "no-cache" }),
    fetch(MARKET_METADATA, { cache: "no-cache" }),
  ]);
  if (!indexResponse.ok || !metadataResponse.ok) throw new Error("marketplace unavailable");
  const [index, metadata] = await Promise.all([indexResponse.json(), metadataResponse.json()]);
  const details = new Map((metadata.plugins || []).map((plugin) => [plugin.id, plugin]));
  marketplacePlugins = (index.plugins || []).map((plugin) => ({
    ...plugin,
    ...(details.get(plugin.id) || {}),
    versions: plugin.versions || [],
  }));
  marketplaceError = false;
  renderMarketplace();
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("plugin-search")?.addEventListener("input", renderMarketplace);
  loadMarketplace().catch(() => {
    marketplaceError = true;
    renderMarketplace();
  });
});

document.addEventListener("galdr-lang", renderMarketplace);
