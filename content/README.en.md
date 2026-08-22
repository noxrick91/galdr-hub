# Galdr user guide

Galdr is a GPU-accelerated terminal. The default login is the builtin **galdr-shell**. The only startup file is `~/.config/galdr/galdrc` — it does not read `.bashrc` unless you `include` it.

Prebuilt binaries install from this site’s [GitHub Releases](https://github.com/noxrick91/galdr-hub/releases) into `~/.galdr/bin`. The source repo is private.

### What it does

- wgpu instanced cell rendering, HiDPI, IME, CJK / emoji fallback fonts
- Tabs (drag to reorder), splits, search, command palette, themes
- Session restore; detach and reattach the mux (Unix socket / Windows named pipe)
- Builtin bash-shaped shell: functions, arrays, job control (Unix), usual builtins

### How to read this guide

Start with [Install](#/install) and [Quick start](#/quick-start). Use **中文 / EN** in the corner to switch the whole manual; the page stays the same.

---

## What's new

This page lists changes in the **current public release**.

**What's new in v0.1.10** — 2026-08-22

- Dragging a tab follows the pointer with a ghost chip. Other tabs slide to close the old slot and open a gap at the drop point; the order commits on release.

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

`include bashrc`, `zshrc`, `profile`, `bash_profile`, `zprofile`, `zlogin`, `zshenv`, `kshrc`, and `fish` look up the usual home paths (a leading `.` is optional) and do nothing if the file is missing. A path must exist. The importer runs `export`, `alias`, assignments, and other galdr-shell commands; bash/zsh-only lines (`setopt`, `bindkey`, `shopt`, …) are skipped.

A change in `galdrc` applies to **new tabs or windows**. Sessions already open do not reread it. You can `source ~/.bashrc` at the prompt; for startup use `include`. For full bash behavior set `[shell] kind = "system"`.

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

Tab or Enter accepts a completion; Esc / Ctrl+G dismisses the menu. Space does not accept. Completions follow aliases, variables, and git branches; substring and abbreviation matches work (`cko` → checkout). Home / End jump to the ends of the menu. `complete -F fn` runs a function (`COMP_WORDS` / `COMP_CWORD` / `COMPREPLY`); `complete -C cmd` runs an external completer (`COMP_LINE` / `COMP_POINT`). Those hooks are not invoked on every keystroke.

---

## Config

Optional `~/.config/galdr/config.toml`. Galdr starts without it; the first run writes an example. Zero-config theme is `galdr-dark`. Windows defaults to Cascadia Mono + Microsoft YaHei / Segoe UI Emoji; Linux / macOS to DejaVu Sans Mono + Noto Sans CJK SC / Noto Color Emoji. `system_fallback = true` also appends a built-in CJK / emoji / mono stack.

After you save the file, focus the window or wait under half a second and it reloads. `Ctrl+,` opens Settings (Appearance / Terminal / Mux / Keys). Font, theme, cursor, `TERM`, and startup size write back to the same file. Key bindings are edited only in `[[keys]]`.

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

[shell]
kind = "galdr"            # galdr | system

[mux]
unix_socket = false
# socket_path = "/run/user/1000/galdr/mux.sock"
close_behavior = "exit"   # or "detach"

[session]
restore = false
restore_mode = "ask"      # ask | wezterm
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
- WezTerm-style quick select and vi / copy mode

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
| `include bashrc` did nothing | Put it in `~/.config/galdr/galdrc`, then **open a new tab**. `source ~/.bashrc` at the prompt only affects that editor session |
| `config.toml` change ignored / status bar error | A parse error keeps the last-good config. Fix the file and focus the window to reload |
