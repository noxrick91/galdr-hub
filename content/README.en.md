# Galdr user guide

Galdr is a GPU-accelerated terminal. The default login is the builtin **galdr-shell**. The startup file is `~/.config/galdr/galdrc` on Unix and `%APPDATA%\galdr\galdrc` on Windows — it does not read `.bashrc` unless you `include` it.

Prebuilt binaries install into `~/.galdr/bin`. Get them from this site’s homepage or the commands below.

### What it does

- wgpu instanced cell rendering, HiDPI, IME, CJK / emoji fallback fonts
- Tabs (drag to reorder), splits, search, command palette, themes
- Session restore; detach and reattach the mux (Unix socket / Windows named pipe)
- Builtin bash-shaped shell: functions, arrays, job control (Unix), usual builtins
- Versioned plugin API for commands, shell integration, events, and declarative UI with capability grants

### How to read this guide

Start with [Install](#/install) and [Quick start](#/quick-start). Use **中文 / EN** in the corner to switch the whole manual; the page stays the same.

---

## What's new

This page lists changes in the **current public release**.

**What's new in v0.2.20** — 2026-09-04

- Pasting more than one line asks first, because more than one line runs more than one command and what the clipboard holds is not always what the screen it came from appeared to say. The question is drawn over the bottom of the window; Enter pastes, Escape drops it, and simply carrying on typing drops it too, so input is never held by a question. `[term] confirm_multiline_paste = false` turns it off; a single command, with or without the newline that submits it, is never held back.
- An `[update]` configuration section with `check` and `auto_install`, also honouring `GALDR_NO_UPDATE_CHECK`, so air-gapped and centrally managed installations can turn off the startup release check.
- The built-in `cat` accepts `-n -b -s -E -T -v -e -t -A` and streams its input, so piping a large file no longer reads it into memory and `tail -f | cat` forwards lines as they arrive.
- The alternate screen no longer accumulates host scrollback. A full-screen application keeps the wheel it asked for and no longer has a second scrollbar drawn beside its own; inline transcripts on the primary screen are unaffected.
- Precision touchpads scroll by the distance moved instead of a fixed three notches per event, and Page Up/Down move one window height instead of a fixed 20 lines.
- HTTPS on Linux and Windows x86_64 verifies against the operating system trust store, so a certificate an administrator installed — an inspecting proxy, for instance — now works for the marketplace, tool downloads, and updates.
- Automatic updates require the release index to publish a checksum for the install script and refuse to run a script that does not match it.
- Resizing a window across columns reflows about twice as fast, so dragging a window edge with a large scrollback stays smooth.
- Command completion falls back to native specifications and recent command-specific history when a plugin is unavailable, and PATH discovery no longer holds shared cache locks while scanning.
- Galdr Git 0.1.6 reads remote details in one Git invocation, and Galdr SSH 0.1.8 uses private local named pipes for Windows SFTP password prompts.
- Plugin manager network operations now have bounded DNS, connection, response, body, and overall timeouts.
- The rest of a previous command line is suggested where nothing can be completed word by word: typing `cargo build --rel` shows the rest of the last matching line, and Right accepts it whole. Word-by-word completion still wins wherever it has candidates.
- Command and path suggestions put what you actually use first. Ranking compares usage in doubling bands before name length, so a command run every day outranks a shorter one never used, while similarly-used candidates keep the shorter name first.
- A plugin that misses a completion deadline no longer loses its pages and commands too. Completion is asked for on a keystroke and given 300 ms; missing that now backs off only further completions, while three hard failures still stop everything for the minute they were counted in.
- Extracted plugin files are never left writable by other accounts, whatever mode the package declares.
- Updating all plugins no longer stops at the first failure. A plugin the Hub cannot serve, or whose package fails verification, is reported by name and the rest still update.
- Superseded plugin packages are pruned by any plugin-manager command that changes state, instead of only after an update whose host reload succeeded. Installs that accumulated old versions release that disk space at the next enable, install, or update.
- Shell history is written as each command is entered instead of only when the shell exits cleanly. Closing a window kills the shell outright, so until now a whole session's history — and on a long-running window every command ever typed — was lost, and the last command before any exit was missing.
- A backslash at the very end of a command is kept, as bash keeps it: there is nothing after it to escape and no next line to join to. `galdr-sh -c 'echo a\'` printed a parse error instead of `a\`.
- A highlight is dropped once the text under it is replaced. Copying re-reads the grid at the moment the copy happens, so a highlight left over a full-screen application that had since redrawn those rows quietly put different text on the clipboard. Redrawing the same characters, which most applications do constantly, leaves the selection alone.
- A highlight left over a full-screen application can be dismissed again. Clicking in a pane whose application asked for the mouse never reached the host's selection handling, so a selection made there stayed on screen with no gesture that would clear it; the click now clears it and still reaches the application.
- Copying a selection no longer carries the blank padding a drag sweeps past the end of each line, and a line that only looks wrapped because it was padded out to the width — how a block of text with a background is drawn — copies as the separate line it appears to be. Pasting such a block used to turn a trailing `\` into an escaped space, silently changing what the command meant. Text that genuinely runs past the edge is still copied as one line.
- Scrolling back no longer drifts: new output keeps the viewport on the text being read instead of sliding it forward, and dragging the scrollbar stays accurate while output arrives.
- Array and positional-parameter slices such as `${a[@]:1}` and `${@:2}` select elements instead of silently expanding to nothing, and `${s:0:-1}` and `${s: -99}` now match bash.
- Arithmetic supports `**`, the ternary operator, and hexadecimal, octal and `base#digits` literals, and `&&`, `||` and `?:` no longer apply assignments from the branch they skipped.
- `echo` honours `-e` and `-E` with the full escape set, and `printf` accepts `0x`, octal and `'c` numeric operands.
- The multiplexer socket is created private to the user and refuses connections from other accounts, which previously could start processes in the running session.
- A plugin whose identifier is made only of dots is rejected instead of installing outside the plugin directory.
- Plugin packages are downloaded into a private directory and verified and extracted through one file handle, and extraction stops on the bytes actually written rather than on the sizes the archive declares.
- Process plugins run under address space, process count, file descriptor and core dump limits.
- Ctrl+click asks for confirmation before handing a local path or `file://` link to the desktop opener.
- Everything Galdr says is on the screen again. Messages were written to a status strip that is no longer laid out, so the search query and match count, copy mode, quick select, settings feedback, plugin errors, and the confirmations that wait on Enter or Escape were all written to nowhere — a question could hold the keyboard while showing nothing at all. They are drawn in a bar over the bottom of the window now: a message reporting something that happened fades after a few seconds, a line describing a mode leaves when the mode does, and a question stands until it is answered.
- A question can be answered by carrying on. Enter accepts and Escape refuses, and any other key refuses it and still reaches the terminal, so a confirmation is never the reason a keystroke disappears; a modifier held on the way to a shortcut answers nothing.
- Tab completion no longer runs executables discovered in world-writable `PATH` directories.
- Galdr Downloader no longer builds against a withdrawn release of its stream cipher dependency.
- Git, SSH, and other plugins that preserve tools from Windows or Program Files can open their command-palette pages without attempting an unauthorized ACL rewrite of system-managed directories.
- Windows plugin-host and AskPass named pipes reserve their first instance, reject remote clients, and use bounded connection and I/O waits so startup races or stalled peers cannot freeze the UI.
- Plugin-host shutdown, reload, update, and removal now stop active process runtimes before replacing files, avoiding executable locks on Windows and restoring installed state when a live host cannot unload a plugin.
- Galdr Password Manager 0.1.1 no longer emits invalid table selections after filtering entries or when pending authorization data becomes stale.
- Galdr Downloader 0.3.11 saves task state through crash-safe atomic replacement on Windows and Unix.
- Galdr SSH 0.1.9 keeps one SSH connection open across SFTP operations for a minute, so browsing, uploading and deleting no longer pay a fresh handshake and password prompt each time; checks host keys against the user's own `known_hosts` as well as its private one instead of trusting a first connection blindly; shows a transfer's percentage, rate and estimate while it runs; and can cancel an operation instead of waiting for it.
- Galdr Downloader 0.3.12 verifies HTTPS against the operating system trust store and honours a SOCKS proxy, matching the rest of Galdr; finishes a single-connection download by moving the file into place instead of copying it, which no longer needs room for two copies of the download at the moment it completes; no longer saves a file under a name Windows opens as a device; only resumes a partial download when a validator or the file length confirms the remote file is the one the parts came from; and dials BitTorrent through a `socks5h://` proxy setting instead of ignoring it.
- Plugin state, command caches, session restore data, completion frequencies, and downloader tasks are replaced atomically on Windows as well as Unix.
- Concurrent plugin installs and other state-changing manager commands are serialized, so each command reloads and preserves changes committed by earlier processes.
- Plugin-host startup participates in the state lock until its IPC endpoint is ready, no-op manager commands no longer restart runtimes, and reload shutdown is broadcast before a shared deadline without creating duplicate workers after a timeout.
- Plugin updates discard grants no longer requested by the new manifest, reject mutable contents for an existing version, roll back uncommitted packages, remove obsolete versions after a verified reload, and retry pending Windows directory cleanup.
- External help discovery drains large output concurrently and remains bounded when child processes inherit its output stream.

Full history: [CHANGELOG.md](./CHANGELOG.md).

## Install

### One-line install

Linux / Git Bash:

```bash
curl -fsS https://term.noxcaw.com/install | bash
```

Pin a version (replace `vX.Y.Z` with the target release):

```bash
curl -fsS https://term.noxcaw.com/install | bash -s -- vX.Y.Z
# or
GALDR_TAG=vX.Y.Z curl -fsS https://term.noxcaw.com/install | bash
```

Windows PowerShell:

```powershell
irm https://term.noxcaw.com/install.txt | iex
```

Do not use `irm …/install.ps1`: the site serves `.ps1` as `application/octet-stream`, and Windows PowerShell 5.1 `irm` will not treat it as a script. `.txt` is `text/plain`. If you must fetch `.ps1`:

```powershell
iex ((New-Object Net.WebClient).DownloadString('https://term.noxcaw.com/install.ps1'))
```

The script picks the asset for your OS/ARCH (Linux x64/arm64 or Windows x64/ARM64), checks `SHA256SUMS` from the same Release, and runs its version check before replacing the old copy in `~/.galdr/bin`. Windows ARM64 prefers the native build and falls back to x64 emulation when an older Release lacks ARM64 assets or its native package cannot start without a VC++ runtime. macOS prebuilt packages are temporarily unavailable. Running the installer again stages and verifies the complete runtime, then performs rollback-safe file replacement without terminating the Galdr session that launched it; open windows and shells keep running the old image until restarted. Configuration, plugin data, and managed tools are preserved.

The installer **does not** edit `.bashrc` / `.zshrc`. It writes `~/.galdr/env`. `curl | bash` cannot update the shell you already have open:

```bash
source ~/.galdr/env
# or add ~/.galdr/bin to PATH and open a new terminal
```

The installer also hooks Galdr into the desktop:

- Linux: writes `~/.local/share/applications/galdr.desktop` so **Galdr** appears in the app menu. Right-click a folder and choose **Open Galdr here** to start in that directory. GNOME Files needs `python3-nautilus` for a top-level item; the installer installs it when it can elevate, otherwise run `sudo apt install python3-nautilus && nautilus -q`. Without the bindings it only appears under Scripts, and only when a folder is selected.
- Windows: adds **Galdr** to the Start menu, and **Open Galdr here** to Explorer (folder, background, drive). On Windows 11 it may sit under **Show more options**.

Skip the menus with `GALDR_NO_CONTEXT_MENU=1` or `GALDR_NO_START_MENU=1`.

### Manual download

Open the homepage, download the latest asset for your platform, put it in `~/.galdr/bin` (Windows: `%USERPROFILE%\.galdr\bin\galdr.exe`), and check `SHA256SUMS`.

| Platform | Asset |
|------|------|
| Linux x86_64 | `galdr-x86_64-unknown-linux-gnu` |
| Linux aarch64 | `galdr-aarch64-unknown-linux-gnu` |
| Windows x64 | `galdr-x86_64-pc-windows-gnu.exe` |
| Windows ARM64 | `galdr-aarch64-pc-windows-msvc.exe` |

The installer also places the matching native `galdr-sh-*` helper beside Galdr. The Windows helper uses the console subsystem so galdr-shell can run under ConPTY.

Linux prebuilt packages require glibc 2.35 or newer, a working Vulkan stack (or another wgpu backend), and fonts. Zero-config looks for DejaVu Sans Mono, Noto Sans CJK SC, and Noto Color Emoji, and enables system font fallback.

### Upgrade

Run the installer again. There is no `galdr upgrade` command.

### Uninstall

Use the helper the installer wrote so app-menu, context-menu, and Start menu entries are removed too:

```bash
~/.galdr/uninstall
```

```powershell
& "$HOME\.galdr\uninstall.ps1"
```

Deleting `~/.galdr` by itself leaves those menu entries behind. The uninstaller removes only Galdr-owned files and preserves unrelated files in a custom `PREFIX`. `~/.config/galdr/` is left alone.

---

## Quick start

```bash
source ~/.galdr/env
galdr
```

Default login is **galdr-shell** (`galdr --shell`). To use the system shell:

```toml
# ~/.config/galdr/config.toml
[shell]
kind = "system"
```

The builtin shell also has a selectable launcher:

```toml
[shell]
kind = "galdr"
launcher = "auto" # auto | helper | integrated
```

`auto` prefers an adjacent, exactly matching native `galdr-sh` and falls back to `galdr --shell`; `helper` requires the helper; `integrated` always uses the full Galdr executable. Windows always uses `galdr-sh.exe` because ConPTY cannot attach the GUI-subsystem executable. Plugin commands start from a versioned local cache. The host atomically refreshes it after install, update, enable/disable, or removal, and an open shell adopts the new list at its next prompt.

Optional config lives at `~/.config/galdr/config.toml`. Galdr starts with zero-config defaults if that file is missing.

---

## Shell and galdrc

The startup file is `~/.config/galdr/galdrc` on Unix and `%APPDATA%\galdr\galdrc` on Windows. It does not read `.bashrc` automatically. Opt in from `galdrc`:

```sh
# Unix
include bashrc
include zshrc
include ~/.profile
```

```sh
# Windows
include env
include powershell
include bashrc
```

`include bashrc`, `profile`, `bash_profile`, and paths execute as bash (`export`, `alias`, functions, `shopt`, nested `source`). A failed strict parse falls back to a warned lenient read. `include zshrc` / `fish` stay lenient and skip zsh/fish-only commands (`setopt`, `bindkey`, …). On Windows, `include env` merges the user/machine registry `PATH`; `include powershell` dumps the PowerShell profile environment. Prompt variables from a bash rc apply; set `PS1` after `include` to keep the galdr prompt. `source` is a strict galdr-shell read.

A change in `galdrc` applies to **new tabs or windows**. Sessions already open do not reread it. For distro bash or a full PowerShell session set `[shell] kind = "system"`.

`case` supports `;;` / `;&` / `;;&`. Background `&&`/`||` lists set `$!`. Windows has no POSIX process groups; `fg`/`wait`/`kill` use stored handles or in-process jobs.

---

## Keyboard shortcuts

Bindings live in `[[keys]]` inside `config.toml`. Settings → Keys lists them; edit the file to change a chord. Join modifiers with `|`, for example `ctrl|shift`. Use `action = "none"` on the same key/mods to unbind a builtin shortcut (later bindings win).

```toml
[[keys]]
key = "c"
mods = "ctrl|shift"
action = "none"
```

| Shortcut | Action |
| --- | --- |
| Ctrl+Shift+C / V | Copy / paste |
| Ctrl+Insert / Shift+Insert | Copy / paste |
| Ctrl+Shift+A | Select all |
| Ctrl+Shift+T / W | New / close tab |
| Ctrl+Tab / Ctrl+Shift+Tab | Next / previous tab |
| Ctrl+PageDown / Ctrl+PageUp | Next / previous tab |
| Ctrl+Shift+PageUp / PageDown | Move tab left / right |
| Ctrl+Shift+D / E | Split down / right |
| Ctrl+Shift+K | Close pane |
| Alt+Arrows | Focus pane |
| Ctrl+Shift+Arrows | Resize pane |
| Ctrl+Shift+Z | Zoom / unzoom pane |
| Ctrl+Alt+E | Equalize panes |
| Ctrl+Shift+F | Search |
| Ctrl+Shift+P | Command palette |
| Ctrl+Shift+M | Plugin marketplace |
| Ctrl+Shift+Space | Quick select |
| Ctrl+Shift+X | Copy / vi mode |
| Shift+Up / Down | Scroll line |
| PageUp / PageDown | Scroll page (primary screen; alt-screen apps keep the keys) |
| Ctrl+= / - / 0 / wheel | Font size + / − / reset (saved to config) |
| Ctrl+, | Settings |
| F11 | Fullscreen |
| Ctrl+Shift+L | Detach |
| Ctrl+Shift+O | Cycle theme |

Drag a tab to reorder it, or a split divider to resize; see [Interface](#/ui).

Tab or Enter accepts a completion; **Esc** (or Ctrl+G) closes the popup. Space does not accept. After you type or accept a full command name, the menu lists arguments / subcommands; Enter still runs the current command. Completions use the shell `PATH` (tools added after `include bashrc` are included), plus aliases, variables, and git branches; substring and abbreviation matches work (`cko` → checkout). Home / End jump to the ends of the menu. `complete -F fn` runs a function (`COMP_WORDS` / `COMP_CWORD` / `COMPREPLY`); `complete -C cmd` runs an external completer (`COMP_LINE` / `COMP_POINT`). Those hooks are not invoked on every keystroke. Passive hints and paste only use static or cached command help; probing an external CLI for fresh help requires an explicit Tab completion request. When the Automatic suggestion popup is off, Tab uses classic shell completion: one Tab accepts a unique match or extends multiple matches to their longest common prefix; a second Tab prints all candidates below the prompt and restores the input line without opening a popup.

Interactive Ctrl+Z stops the foreground job and prints `[n]+  Stopped  command`. Use `fg` / `bg` / `jobs` after that.

---

## Config

Optional `~/.config/galdr/config.toml`. Galdr starts without it; the first run writes an example. Zero-config theme is `galdr-dark`. Windows defaults to Cascadia Mono + Microsoft YaHei / Segoe UI Emoji; Linux / macOS to DejaVu Sans Mono + Noto Sans CJK SC / Noto Color Emoji. `system_fallback = true` also appends a built-in CJK / emoji / mono stack.

After you save the file, focus the window or wait under half a second and it reloads. `Ctrl+,` opens Settings (Appearance / Terminal / Mux / Network / Keys / About). Font, theme, cursor, `TERM`, and startup size write back to the same file. About shows the complete config path, author and email, and offers a manual update check; Galdr also checks in the background after startup and prompts when a newer release exists. Key bindings are edited only in `[[keys]]`.

```toml
[font]
family = "DejaVu Sans Mono"          # Windows default: Cascadia Mono
size = 15.0
line_height = 1.0
fallback = ["Noto Sans CJK SC", "Noto Color Emoji"]
system_fallback = true

[window]
padding = 8
opacity = 1.0
tab_line_height = 1.5
startup_cols = 120
startup_rows = 32

[cursor]
style = "bar"             # bar | block | underline
width = 3.0               # bar / underline thickness in logical pixels
blink = "always"          # off | app | always
blink_ms = 530

[theme]
name = "galdr-dark"

[term]
name = "xterm-256color"
dec1007 = true              # alternate-screen wheel → cursor keys

[shell]
kind = "galdr"            # galdr | system
launcher = "auto"         # auto | helper | integrated

[completion]
auto_popup = true          # false: common-prefix completion, then double Tab prints candidates

[mux]
unix_socket = false
# socket_path = "/run/user/1000/galdr/mux.sock"
close_behavior = "exit"   # or "detach"

[session]
restore = false
restore_mode = "ask"      # ask | wezterm (restore without the confirm list)
restore_commands = false

scrollback = 10000
osc52 = "confirm"         # copy | confirm | off
```

Font size is logical points. Galdr multiplies it by the window scale factor and rasters glyphs in physical pixels. `startup_cols` / `startup_rows` are the cell size of a new window.

---

## Interface

The window attaches to a session. Close it and the tabs and splits stay. `galdr --attach` puts the window back.

### Tabs

- Click a tab to switch; `+` opens a tab; `×` or middle-click closes it
- Drag a tab to a new place. The chip follows the pointer, other tabs slide aside to open a gap, and the order **commits on release**
- Keys: Ctrl+Shift+T / W new / close; Ctrl+Tab switch; Ctrl+Shift+PageUp / PageDown move left / right

### Splits

- Drag a divider to resize; double-click it to equalize that split
- Ctrl+Shift+D / E split down / right; Alt+arrows focus; Ctrl+Shift+Z zoom a pane; Ctrl+Alt+E equalize all

### Other

- `Ctrl+,` opens Settings: Appearance (theme, fonts, cursor), Terminal (scrollback, OSC 52, `TERM`, session restore), Mux, and a key list
- Themes: galdr-dark (default), Catppuccin, Tokyo Night, Gruvbox, One Dark, Solarized
- OSC 0/2 title, OSC 7 cwd, OSC 8 hyperlinks (Ctrl+click), OSC 52 (confirm by default)
- Selection, clipboard, scrollbar, context menu
- Quick select and vi / copy mode

---

## Mux and splits

The mux owns panes; the window is only an attachment.

```bash
galdr --server                 # headless mux on $XDG_RUNTIME_DIR/galdr/mux.sock
galdr --attach                 # GUI client
galdr --socket /tmp/galdr.sock --server
```

Set `mux.unix_socket = true` to listen from a normal GUI process so another `galdr --attach` can join, and closing the window can detach instead of killing shells. The default socket is `$XDG_RUNTIME_DIR/galdr/mux.sock`; override it with `mux.socket_path` or `--socket`. Windows uses a named pipe.

---

## Session restore

With `[session] restore = true`, the next launch reopens the last window / tabs / splits / cwd. `restore_mode = "ask"` lists last foreground commands first; `wezterm` restores them without that confirm list.

---

## Plugin overview

A Galdr plugin is a versioned `.zip` package that communicates through `galdr-plugin-host`. The GUI and shell exchange size-limited protocol frames; they **do not load ordinary third-party plugins into the Galdr process**. The current plugin API major is `1`.

The plugin host is shared by concurrent Galdr processes. It tracks their process lifetimes and, after the final client exits, waits for a short grace period, shuts plugin runtimes down, and exits automatically. Persisted plugin work can recover when Galdr starts again.

Plugins can contribute:

- Commands available to the GUI, shell, or both
- Command-palette entries, key bindings, and `plugin:<plugin-id>/<command-id>` actions
- Tab, pane, command-lifecycle, and other declared events
- Declarative UI rendered by Galdr rather than arbitrary window or GPU code
- Directory, variable, export, and alias changes that are validated before reaching the parent shell

Choose a runtime for the work and trust boundary:

| Runtime | Best for | Isolation boundary |
| --- | --- | --- |
| `process` | Typical plugins, external libraries, background workers | Separate process; Bubblewrap on Linux and AppContainer on Windows |
| `wasm` | Portable, deterministic logic | Wasmtime component with a 64 MiB memory ceiling and epoch deadline |
| `native` | Host-level performance or system integration that is truly required | Runs inside the plugin host; each binary change requires explicit trust |

Visit the [plugin marketplace](./plugins.html) for the official catalog, or continue with [Install and manage plugins](#/plugin-management).

---

## Install and manage plugins

Press `Ctrl+Shift+M`, choose **Plugin marketplace** from the command palette, or open **Plugins** from the terminal context menu. The built-in view supports search, install, update, enable / disable, permission changes, and removal. Its local cache keeps installed plugins manageable offline.

### Install from the official marketplace

Search and install first, then grant only the capabilities you need:

```bash
galdr plugin search downloader
galdr plugin install-from com.noxcaw.term.downloader
galdr plugin inspect com.noxcaw.term.downloader
galdr plugin grant com.noxcaw.term.downloader http files_write ui
```

Requested capabilities are **not granted automatically**. `inspect` reports requested and granted access separately. Grant `p2p_network` only when you need P2P or magnet downloads:

```bash
galdr plugin grant com.noxcaw.term.downloader p2p_network
```

The default official index is `https://term.noxcaw.com/plugins/index.json`. Use `--marketplace INDEX` for a development or community index.

### Daily management

```text
galdr plugin list [--json]
galdr plugin inspect ID
galdr plugin enable|disable ID
galdr plugin grant|revoke ID CAPABILITY...
galdr plugin update [ID] [--marketplace INDEX] [--trust-native]
galdr plugin uninstall ID [--keep-data]
```

Updates preserve enablement, grants, and plugin order. Pinned entries are skipped. A changed native binary requires a fresh `--trust-native`. Uninstalling removes private plugin data by default; `--keep-data` preserves it.

### Install a local or HTTPS package

```bash
galdr plugin install ./hello.zip --grant ui
galdr plugin install https://example.com/hello.zip \
  --sha256 <64-hex-digest> --grant ui
```

A direct HTTPS install requires `--sha256`. Every platform package in a marketplace index also needs a SHA-256 digest. Marketplace and package URLs must use HTTPS; paths and `file://` are accepted for local development.

---

## Permissions and isolation

The manifest's `capabilities` are what a plugin **requests**. Grants in local install state are what the user **allows**. The host removes context fields a plugin cannot read, then rejects shell patches and actions it is not allowed to return.

| Capability | Access |
| --- | --- |
| `context_read` | Read invocation context |
| `terminal_read` / `terminal_write` | Read terminal content / write to the terminal |
| `tabs_manage` / `panes_manage` | Manage tabs / panes |
| `clipboard_read` / `clipboard_write` | Read / write the clipboard |
| `notifications` | Send system notifications |
| `shell_state` | Read or return validated shell-state changes |
| `events` | Subscribe to declared terminal events |
| `ui` | Provide declarative UI and receive typed UI events |
| `files_read` / `files_write` | Read / read-write access to the user's Downloads directory |
| `user_files_read` | Read-only access to files in the user's home directory |
| `workspace_read` / `workspace_write` | Read / read-write access to the repository containing the active directory |
| `network` | Direct remote network connections and DNS |
| `http` | HTTP(S), DNS, and configured proxies |
| `p2p_network` | Peer-to-peer network connections |
| `credentials_use` / `credentials_manage` | Use / manage credentials through the host broker |
| `ssh_agent_use` | Connect to the user's SSH agent without reading private key files |

On Linux, a `process` package is mounted read-only, its private data directory is separately writable, and the environment is cleared before approved values are restored. `files_read` / `files_write` expose only Downloads at `GALDR_PLUGIN_DOWNLOADS`; `user_files_read` exposes the user's home directory read-only at `GALDR_PLUGIN_USER_FILES`; `workspace_read` / `workspace_write` expose only the active repository at `GALDR_PLUGIN_WORKSPACE`. Network sharing and DNS files appear only when `network`, `http`, or `p2p_network` is granted. A process plugin is refused when a strict platform sandbox is unavailable.

On Windows, a `process` plugin runs in a capability-scoped AppContainer and a kill-on-close Job Object. The host grants only read / execute access to the package, read / write access to private data, and the explicitly approved Downloads, current workspace, and network access. It is likewise refused when the strict sandbox cannot be created.

Frames and UI trees have size limits. The host restarts a plugin after a crash or timeout; three failures in 60 seconds disable it for the current session. Packages cannot use absolute paths or parent traversal, and Linux packages cannot contain symlinks.

> A `native` plugin does not have process or Wasm code isolation. Use `--trust-native` only for a source you trust.

---

## Package and manifest

A plugin is a ZIP package with `plugin.toml` at its root. Package paths must be relative and cannot contain `..` or absolute paths; Linux packages cannot contain symlinks. A package with Windows and Linux process entrypoints can use this layout:

```text
hello.zip
├── plugin.toml
└── bin/
    ├── hello
    └── hello.exe
```

The manifest uses schema 1 and rejects unknown fields. Use a reverse-domain ID and keep it stable after publishing:

```toml
schema = 1
id = "com.example.hello"
name = "Hello"
version = "0.1.0"
api = "^1.0"
galdr = ">=0.2.0"
description = "A minimal example plugin"
license = "MIT"
requires_restart = false
entrypoints = [
  { os = "linux", arch = "x86_64", runtime = "process", path = "bin/hello" },
  { os = "windows", arch = "x86_64", runtime = "process", path = "bin/hello.exe" },
]
capabilities = ["ui", "shell_state"]
```

| Field | Purpose |
| --- | --- |
| `schema` | Manifest format version; currently `1` |
| `id` / `version` | Stable plugin ID and semantic version |
| `api` / `galdr` | Compatible plugin API and Galdr version ranges |
| `entrypoints` | Runtime and package path selected by `os` and `arch` |
| `capabilities` | Access the plugin requests but has not yet been granted |
| `tools` | External tools resolved, verified, and managed by the host |
| `contributions` | Commands, events, and UI entrypoints |
| `requires_restart` | Set to `true` only when normal live reload cannot activate the plugin |

A command's `scope` is `gui`, `shell`, or `both`. Every command has a stable `plugin:<plugin-id>/<command-id>` action name; palettes and code should reuse it:

```toml
[[contributions.commands]]
id = "hello"
title = "Hello from plugin"
scope = "both"
shell_name = "galdr-hello"
```

Key bindings are user configuration, not plugin manifest fields. Bind the action in `config.toml`:

```toml
[[keys]]
key = "h"
mods = "ctrl|shift"
action = "plugin:com.example.hello/hello"
```

---

## Managed tools

Every executable tool a plugin uses must be declared in `plugin.toml`. The host first looks for an allowed system tool and copies a resolved dependency into the plugin-specific directory. When it must download a tool, the host accepts only HTTPS plus a checksum. The final location is always under the user's home directory:

| Platform | Managed directory |
| --- | --- |
| Windows | `%USERPROFILE%\.galdr\tools\<plugin-id>\` |
| Linux | `~/.galdr/tools/<plugin-id>/` |

Windows and Linux use the same layout model. Tools are not executed from the project or an arbitrary system location. The sandbox exposes only the current plugin's tool directory as read-only, so a plugin cannot see another plugin's dependencies.

```toml
[[tools]]
id = "site-extractor"
required = false

[[tools.platforms]]
os = "linux"
arch = "x86_64"
executable = "extractor"
system_names = ["extractor"]
source = "https://downloads.example.com/extractor"
sha256 = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
```

- With `required = true`, the plugin does not start when the tool cannot be found or verified.
- With `required = false`, the plugin may start but should show a clear unavailable reason beside the affected feature.
- `source` must use HTTPS and have a fixed `sha256`, or an HTTPS `checksum_source` with an optional `checksum_name`.
- Tool downloads require a granted network capability. The host never guesses undeclared tools from a plugin ID, filename, or PATH.
- Rust process plugins obtain the resolved path with `galdr_plugin_sdk::plugin_tool_path("tool-id")`.

Galdr Downloader manages its site extractor through the same mechanism. Optional tools such as FFmpeg, Deno, and Node are exposed only after their manifest declarations resolve successfully.

---

## Declarative UI

A plugin returns a size- and depth-limited UI tree. Galdr owns typography, focus, IME, keyboard navigation, and window lifecycle. Plugins cannot inject arbitrary window code or access the GPU directly.

Declare the entry and placement in the manifest first:

```toml
[[contributions.ui]]
id = "downloads"
slot = "page"
title = "Downloads"
```

Common slots include the full-content `page`, `modal_window` / `modal_pane`, side panels, settings, status, and terminal overlays. A full page should use a `surface` root with `presentation = "page"`, allowing the host to own its title, back action, and close behavior:

```json
{
  "root": {
    "type": "surface",
    "id": "surface",
    "title": "Downloads",
    "presentation": "page",
    "child": { "type": "text", "id": "body", "text": "Ready" }
  }
}
```

UI nodes include text, icons, badges, buttons, inputs, toggles, selects, images, progress, lists, and layout containers. Node IDs must be unique across the tree. The host returns activate, input, toggle, and select operations as typed `UiEvent` values carrying the node ID. Only a real modal should close when its backdrop is clicked; pages and ordinary panels use host navigation rather than simulated modal lifecycle.

Long-running work belongs on plugin-owned background workers. UI requests should read current state or submit a short operation, then refresh with `refresh_interval_ms` or later events instead of occupying the supervisor deadline.

---

## Build a plugin

Every package has `plugin.toml` at its root, and its ID uses reverse-domain form. This is a minimal process plugin:

```toml
schema = 1
id = "com.example.hello"
name = "Hello"
version = "0.1.0"
api = "^1.0"
galdr = ">=0.2.0"
entrypoints = [
  { os = "linux", arch = "x86_64", runtime = "process", path = "bin/hello" },
]
capabilities = ["ui", "shell_state"]

[[contributions.commands]]
id = "hello"
title = "Hello from plugin"
scope = "both"
shell_name = "galdr-hello"

[[contributions.ui]]
id = "hello-view"
slot = "modal_pane"
title = "Hello"
```

`scope` is `gui`, `shell`, or `both`. A command is always addressable as `plugin:com.example.hello/hello`; bind that same action in the user's `config.toml`:

```toml
[[keys]]
key = "h"
mods = "ctrl|shift"
action = "plugin:com.example.hello/hello"
```

The repository's `galdr-plugin-api` crate defines the stable protocol. `galdr-plugin-sdk` provides process JSON framing, the Wasm WIT, and the native v1 vtable. Build and package the example like this:

```bash
cargo build --release --manifest-path examples/plugins/hello-process/Cargo.toml
mkdir -p /tmp/galdr-hello/bin
cp examples/plugins/hello-process/target/release/galdr-hello-plugin /tmp/galdr-hello/bin/hello
cp examples/plugins/hello-process/plugin.toml /tmp/galdr-hello/plugin.toml
(cd /tmp/galdr-hello && zip -r ../galdr-hello.zip .)
galdr plugin install /tmp/galdr-hello.zip --grant ui --grant shell_state
```

A shell invocation can change the parent shell only after a successful, non-timeout, non-subshell result; Galdr validates the complete patch first. Put long work on plugin-owned background workers instead of occupying the supervisor request deadline, and report progress through later requests or declarative UI.

---

## Plugin troubleshooting

Start with `galdr plugin inspect ID`. Confirm the platform entrypoint, enabled state, and requested / granted capabilities, then narrow the failure down with this table:

| Symptom | Check and fix |
| --- | --- |
| Command missing after install | Confirm the plugin is enabled and has an entrypoint for this platform; reopen the palette or start a new shell session |
| Missing-capability error | Compare requested and granted access, then grant only the minimum needed with `galdr plugin grant ID CAPABILITY` |
| Linux process plugin is refused | Verify that `bwrap` is executable; Galdr does not fall back to running a process plugin without its strict sandbox |
| Tool unavailable | Check that `tools` declares the current `os` / `arch`, network access is granted, and the source checksum matches |
| Downloader cannot parse a media site | Confirm that `site-extractor` resolved; merging separate audio and video also needs `media-converter`, then use the plugin's specific error message |
| UI opens but does not refresh | Do not perform a long download inside invoke / UI-event handling; move it to a worker and return pollable state |
| Plugin stops after repeated crashes | Three failures in 60 seconds disable it for the session; inspect its logs, package version, and tools, then restart Galdr |
| A plugin update asks for restart | Restart when `requires_restart = true`, the host does not match the new core, or the loaded versions cannot be verified after live reload; afterwards the marketplace Installed version should match the latest compatible version |

Uninstalling and reinstalling removes private plugin data. Use `galdr plugin uninstall ID --keep-data` first when tasks or settings must survive. Do not repair an installation by manually moving `~/.galdr/tools` or plugin state files; let the manager resolve and verify them again.

---

## Publish plugins

Each first-party plugin directory contains a validated `plugin.toml` and a `publish.toml` describing reproducible platform packages. The protected publishing workflow:

1. builds and tests changed plugins;
2. creates an immutable `plugin-<id>-v<version>` Release;
3. downloads every uploaded package again and verifies its SHA-256;
4. merges `plugins/index.json` plus the website's `plugins/metadata.json`.

A package cannot be replaced under the same version. Bump both `plugin.toml` and the plugin crate version before publishing a new binary. Community indexes should follow the same schema-1, HTTPS, and per-package SHA-256 constraints; users then opt in explicitly with `--marketplace`.

---

## Troubleshooting

| Symptom | What to do |
| --- | --- |
| `galdr: command not found` | `source ~/.galdr/env`, or add `~/.galdr/bin` to PATH |
| Install HTTP 404 | That version has no published assets yet. See the homepage or [CHANGELOG.md](./CHANGELOG.md) |
| Linux black window / instant exit | Check Vulkan drivers; wgpu needs a working GPU backend |
| Missing glyphs / tofu | Install DejaVu Sans Mono, Noto Sans CJK SC, Noto Color Emoji, or change `[font]` |
| Windows `irm …/install.ps1` does nothing | Use `irm …/install.txt \| iex` |
| The UI still shows the old version after an update | Restart open Galdr windows and shells; use `command -v galdr` on Linux or `Get-Command galdr` on Windows to rule out another installation on PATH |
| Galdr missing from the Linux app menu | Re-run the installer or log out; check `~/.local/share/applications/galdr.desktop` |
| No “Open Galdr here” on folders | GNOME: `sudo apt install python3-nautilus && nautilus -q` (without bindings it only appears under Scripts). Windows 11: look under **Show more options** |
| Want system bash | `[shell] kind = "system"` — the default will not read `.bashrc` |
| `include bashrc` did nothing | Put it in `~/.config/galdr/galdrc`, then **open a new tab**. At the prompt use `include`, not `source ~/.bashrc` |
| `config.toml` change ignored / status bar error | A parse error keeps the last-good config. Fix the file and focus the window to reload |
| An installed plugin reports a missing capability | Compare requested and granted access with `galdr plugin inspect ID`, then grant only what is needed with `galdr plugin grant ID CAPABILITY` |
| A Linux process plugin will not start | Install and verify `bwrap` (Bubblewrap). Galdr does not fall back to running a plugin unsandboxed |
| A plugin stops responding after repeated crashes | Three failures in 60 seconds disabled it for this session. Check its log or version, then restart Galdr |
