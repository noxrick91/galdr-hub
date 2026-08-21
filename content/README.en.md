# Galdr user guide

Galdr is a GPU-accelerated terminal. The default login is the builtin **galdr-shell**. The only startup file is `~/.config/galdr/galdrc` — it does not read `.bashrc` unless you `include` it.

Prebuilt binaries install from this site’s [GitHub Releases](https://github.com/noxrick91/galdr-hub/releases) into `~/.galdr/bin`. The source repo is private.

### What it does

- wgpu instanced cell rendering, HiDPI, IME, CJK / emoji fallback fonts
- Tabs, splits, search, command palette, themes
- Session restore; detach and reattach the mux (Unix socket / Windows named pipe)
- Builtin bash-shaped shell: functions, arrays, job control (Unix), usual builtins

### How to read this guide

Start with [Install](#/install) and [Quick start](#/quick-start). Use **中文 / EN** in the corner to switch the whole manual; the page stays the same.

---

## What's new

This page lists changes in the **current public release**.

**What's new in v0.1.8** — 2026-08-22

- Settings can toggle system font fallback and edit `TERM`.
- `exec 3>file` (no command) keeps the redirection on the shell.
- `complete -C` runs an external completer (`COMP_LINE` / `COMP_POINT` / `COMP_CWORD`).
- Windows children inherit fds 3–15 (CRT `lpReserved2`). Nested `galdr-sh` imports them.
- `case` fallthrough: `;&` runs the next arm's body; `;;&` keeps testing later arms.
- Background `&&`/`||` lists set `$!` (same fake-PID range as coproc).
- Windows `fg` waits on stored process handles or in-process jobs; `bg` marks the job running.
- Closing the window no longer treats the login shell `galdr-sh` as a running command.
- Glyph atlas reset clears the GPU texture so stale glyphs do not linger after a font change or overflow.
- Grapheme intern recycles slots instead of returning 0 (empty cell) when full.
- Attach search uses the same line-text / wrap join as the local grid.
- `[[ =~ ]]` caches compiled regular expressions.
- Completion matches substrings and abbreviations (`git cko` → checkout), follows aliases, completes `$VARS` / `export` / `help`, and reads git branches from `.git`.
- `complete -F` / `-C` no longer block the hint on every keystroke.
- Quoted words and `>` redirections complete as paths. Home / End jump in the menu.
- Docs match the real defaults (`galdr-dark`; Cascadia on Windows, DejaVu on Unix).

Full history: [CHANGELOG.md](./CHANGELOG.md).

## Install

### One-line install

Linux / Git Bash:

```bash
curl -fsS https://term.noxcaw.com/install | bash
```

Pin a version:

```bash
curl -fsS https://term.noxcaw.com/install | bash -s -- v0.1.2
# or
GALDR_TAG=v0.1.2 curl -fsS https://term.noxcaw.com/install | bash
```

Windows PowerShell:

```powershell
irm https://term.noxcaw.com/install.txt | iex
```

Do not use `irm …/install.ps1`: GitHub Pages serves `.ps1` as `application/octet-stream`, and Windows PowerShell 5.1 `irm` will not treat it as a script. `.txt` is `text/plain`. If you must fetch `.ps1`:

```powershell
iex ((New-Object Net.WebClient).DownloadString('https://term.noxcaw.com/install.ps1'))
```

The script picks the asset for your OS/ARCH (Linux x64/arm64 or Windows x64/ARM64), checks `SHA256SUMS` from the same Release, and installs into `~/.galdr/bin`. Windows ARM64 prefers the native build and falls back to x64 emulation for older Releases without an ARM64 asset. macOS prebuilt packages are temporarily unavailable. Running the installer again replaces the current file (on Windows it renames a running exe to `.bak` first).

The installer **does not** edit `.bashrc` / `.zshrc`. It writes `~/.galdr/env`. `curl | bash` cannot update the shell you already have open:

```bash
source ~/.galdr/env
# or add ~/.galdr/bin to PATH and open a new terminal
```

The installer also hooks Galdr into the desktop:

- Linux: writes `~/.local/share/applications/galdr.desktop` so **Galdr** appears in the app menu. Right-click a folder and choose **Open Galdr here** to start in that directory. GNOME Files needs `python3-nautilus` for a top-level item; the installer installs it when it can elevate, otherwise run `sudo apt install python3-nautilus && nautilus -q`. Without the bindings it only appears under Scripts, and only when a folder is selected.
- Windows: adds **Galdr** to the Start menu, and **Open Galdr here** to Explorer (folder, background, drive). On Windows 11 it may sit under **Show more options**.

Skip the menus with `GALDR_NO_CONTEXT_MENU=1` or `GALDR_NO_START_MENU=1`.

If Pages is not live yet:

```bash
curl -fsS https://raw.githubusercontent.com/noxrick91/galdr-hub/main/install | bash
```

```powershell
irm https://raw.githubusercontent.com/noxrick91/galdr-hub/main/install.ps1 | iex
```

### Manual download

Open the homepage, download the latest asset for your platform, put it in `~/.galdr/bin` (Windows: `%USERPROFILE%\.galdr\bin\galdr.exe`), and check `SHA256SUMS`.

| Platform | Asset |
|------|------|
| Linux x86_64 | `galdr-x86_64-unknown-linux-gnu` |
| Linux aarch64 | `galdr-aarch64-unknown-linux-gnu` |
| Windows x64 | `galdr-x86_64-pc-windows-gnu.exe` |
| Windows ARM64 | `galdr-aarch64-pc-windows-msvc.exe` |

The Windows installer also installs `galdr-sh-*.exe` next to it (console helper so galdr-shell can run under ConPTY).

Linux needs a working Vulkan stack (or another wgpu backend) and fonts. Zero-config looks for DejaVu Sans Mono, Noto Sans CJK SC, and Noto Color Emoji, and enables system font fallback.

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

Deleting `~/.galdr` by itself leaves those menu entries behind. `~/.config/galdr/` is left alone.

### Build from source

The source repo is not public. Developers with access:

```bash
cargo build --release
./target/release/galdr
```

Requires a GPU stack (`wgpu`: Vulkan / Metal / D3D12).

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

Optional config lives at `~/.config/galdr/config.toml`. Galdr starts with zero-config defaults if that file is missing.

---

## Shell and galdrc

The only startup file is `~/.config/galdr/galdrc`. It does not read `.bashrc` automatically. Opt in from `galdrc`:

```sh
include bashrc
include zshrc
include ~/.profile
```

`include bashrc`, `zshrc`, `profile`, `bash_profile`, `zprofile`, and `fish` look up the usual home paths and do nothing if the file is missing. A path must exist. The importer runs `export`, `alias`, assignments, and other galdr-shell commands; bash/zsh-only lines (`setopt`, `bindkey`, …) are skipped.

`case` supports `;;` / `;&` / `;;&`. Background `&&`/`||` lists set `$!`. Windows has no POSIX process groups; `fg`/`wait`/`kill` use stored handles or in-process jobs.

---

## Keyboard shortcuts

Bindings live in `[[keys]]` inside `config.toml`. Settings → Keys lists them.

| Shortcut | Action |
| --- | --- |
| Ctrl+Shift+C / V | Copy / paste |
| Ctrl+Shift+T / W | New / close tab |
| Ctrl+Tab / Ctrl+Shift+Tab | Next / previous tab |
| Ctrl+Shift+PageUp / PageDown | Move tab |
| Ctrl+Shift+D / E | Split down / right |
| Alt+Arrows | Focus pane |
| Ctrl+Shift+Arrows | Resize pane |
| Ctrl+Shift+Z | Zoom / unzoom pane |
| Ctrl+Shift+F | Search |
| Ctrl+Shift+P | Command palette |
| F11 | Fullscreen |
| Ctrl+= / - / 0 | Font size + / − / reset |

Tab or Enter accepts a completion; Esc / Ctrl+G dismisses the menu. Space does not accept. Completions follow aliases, variables, and git branches; substring and abbreviation matches work (`cko` → checkout). Home / End jump to the ends of the menu.

---

## Config

Optional `~/.config/galdr/config.toml`. Zero-config theme is `galdr-dark`. Windows defaults to Cascadia Mono + Microsoft YaHei / Segoe UI Emoji; Linux / macOS to DejaVu Sans Mono + Noto Sans CJK SC / Noto Color Emoji. `system_fallback = true` also appends a built-in CJK / emoji / mono stack.

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

[theme]
name = "galdr-dark"

[term]
name = "xterm-256color"

[shell]
kind = "galdr"            # galdr | system

[mux]
unix_socket = false
close_behavior = "exit"   # or "detach"

[session]
restore = false
restore_mode = "ask"      # ask | wezterm
restore_commands = false

scrollback = 10000
osc52 = "confirm"         # copy | confirm | off
```

Font size is logical points. Galdr multiplies it by the window scale factor and rasters glyphs in physical pixels.

---

## Interface

- Themes: galdr-dark (default), Catppuccin, Tokyo Night, Gruvbox, One Dark, Solarized
- OSC 0/2 title, OSC 7 cwd, OSC 8 hyperlinks (Ctrl+click), OSC 52 (confirm by default)
- Selection, clipboard, scrollbar, context menu
- WezTerm-style quick select and vi / copy mode

---

## Mux and splits

The mux owns panes; the window is only an attachment.

```bash
galdr --server                 # headless mux on $XDG_RUNTIME_DIR/galdr/mux.sock
galdr --attach                 # GUI client
galdr --socket /tmp/galdr.sock --server
```

Set `mux.unix_socket = true` to listen from a normal GUI process so another `galdr --attach` can join, and closing the window can detach instead of killing shells. Windows uses a named pipe.

---

## Session restore

With `[session] restore = true`, the next launch reopens the last window / tabs / splits / cwd. `restore_mode = "ask"` lists last foreground commands first; `wezterm` restores the WezTerm way.

---

## Troubleshooting

| Symptom | What to do |
| --- | --- |
| `galdr: command not found` | `source ~/.galdr/env`, or add `~/.galdr/bin` to PATH |
| Install HTTP 404 | That tag has no Release yet. See [Releases](https://github.com/noxrick91/galdr-hub/releases) |
| Linux black window / instant exit | Check Vulkan drivers; wgpu needs a working GPU backend |
| Missing glyphs / tofu | Install DejaVu Sans Mono, Noto Sans CJK SC, Noto Color Emoji, or change `[font]` |
| Windows `irm …/install.ps1` does nothing | Use `irm …/install.txt \| iex` |
| Windows still shows an old version | Close every Galdr window and install again; `Get-Command galdr` to confirm PATH |
| Galdr missing from the Linux app menu | Re-run the installer or log out; check `~/.local/share/applications/galdr.desktop` |
| No “Open Galdr here” on folders | GNOME: `sudo apt install python3-nautilus && nautilus -q` (without bindings it only appears under Scripts). Windows 11: look under **Show more options** |
| Want system bash | `[shell] kind = "system"` — the default will not read `.bashrc` |
