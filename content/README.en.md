# Galdr user guide

Galdr is a GPU-accelerated terminal. The default login is the builtin **galdr-shell**. The startup file is `~/.config/galdr/galdrc` on Unix and `%APPDATA%\galdr\galdrc` on Windows — it does not read `.bashrc` unless you `include` it.

Prebuilt binaries install into `~/.galdr/bin`. Get them from this site’s homepage or the commands below.

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

**What's new in v0.1.16** — 2026-08-24

- Galdr Shell startup diagnostics are now opt-in with `GALDR_STARTUP=1`, so routine sessions reach the prompt without a synchronous PATH self-check.
- Windows no longer launches `galdr-sh.exe --version` before creating every pane. Release installers already validate the GUI/helper version pair, avoiding redundant process startup on the GUI thread.
- The PowerShell installer now explicitly waits for GUI-subsystem executables and captures their output when checking `--version` and `--help`, preventing valid Windows packages from being rejected.

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

Do not use `irm …/install.ps1`: the site serves `.ps1` as `application/octet-stream`, and Windows PowerShell 5.1 `irm` will not treat it as a script. `.txt` is `text/plain`. If you must fetch `.ps1`:

```powershell
iex ((New-Object Net.WebClient).DownloadString('https://term.noxcaw.com/install.ps1'))
```

The script picks the asset for your OS/ARCH (Linux x64/arm64 or Windows x64/ARM64), checks `SHA256SUMS` from the same Release, and runs its version check before replacing the old copy in `~/.galdr/bin`. Windows ARM64 prefers the native build and falls back to x64 emulation when an older Release lacks ARM64 assets or its native package cannot start without a VC++ runtime. macOS prebuilt packages are temporarily unavailable. Running the installer again atomically replaces the current files.

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

The Windows installer also installs `galdr-sh-*.exe` next to it (console helper so galdr-shell can run under ConPTY).

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

Tab or Enter accepts a completion; **Esc** (or Ctrl+G) closes the popup. Space does not accept. After you type or accept a full command name, the menu lists arguments / subcommands; Enter still runs the current command. Completions use the shell `PATH` (tools added after `include bashrc` are included), plus aliases, variables, and git branches; substring and abbreviation matches work (`cko` → checkout). Home / End jump to the ends of the menu. `complete -F fn` runs a function (`COMP_WORDS` / `COMP_CWORD` / `COMPREPLY`); `complete -C cmd` runs an external completer (`COMP_LINE` / `COMP_POINT`). Those hooks are not invoked on every keystroke.

Interactive Ctrl+Z stops the foreground job and prints `[n]+  Stopped  command`. Use `fg` / `bg` / `jobs` after that.

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
dec1007 = true              # alternate-screen wheel → cursor keys

[shell]
kind = "galdr"            # galdr | system

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

## Troubleshooting

| Symptom | What to do |
| --- | --- |
| `galdr: command not found` | `source ~/.galdr/env`, or add `~/.galdr/bin` to PATH |
| Install HTTP 404 | That version has no published assets yet. See the homepage or [CHANGELOG.md](./CHANGELOG.md) |
| Linux black window / instant exit | Check Vulkan drivers; wgpu needs a working GPU backend |
| Missing glyphs / tofu | Install DejaVu Sans Mono, Noto Sans CJK SC, Noto Color Emoji, or change `[font]` |
| Windows `irm …/install.ps1` does nothing | Use `irm …/install.txt \| iex` |
| Windows still shows an old version | Close every Galdr window and install again; `Get-Command galdr` to confirm PATH |
| Galdr missing from the Linux app menu | Re-run the installer or log out; check `~/.local/share/applications/galdr.desktop` |
| No “Open Galdr here” on folders | GNOME: `sudo apt install python3-nautilus && nautilus -q` (without bindings it only appears under Scripts). Windows 11: look under **Show more options** |
| Want system bash | `[shell] kind = "system"` — the default will not read `.bashrc` |
| `include bashrc` did nothing | Put it in `~/.config/galdr/galdrc`, then **open a new tab**. At the prompt use `include`, not `source ~/.bashrc` |
| `config.toml` change ignored / status bar error | A parse error keeps the last-good config. Fix the file and focus the window to reload |
