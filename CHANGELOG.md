# Changelog

Notable user-facing changes to Galdr are recorded here. Implementation details remain in the source history.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions match Git tags.

## [Unreleased]

## [0.1.7] - 2026-08-22

### Added

- `complete -F` runs the named function (`COMP_WORDS` / `COMP_CWORD` / `COMPREPLY`).
- `galdr --shell SCRIPT [ARGS...]` and `galdr-sh SCRIPT [ARGS...]` set `$0` / `$1+`.
- Key bindings can use `action = "none"` to unbind a builtin shortcut.
- `[term] name` sets `TERM` for new panes. `[font] system_fallback = false` skips the built-in CJK / emoji stack.
- Combining marks rasterize as a cluster, not just the base letter.
- Mux attach receives prompt / cwd / busy status so restore and the tab spinner follow the host.

### Changed

- Folder context menu label is always **Open Galdr here**.
- Vi copy mode tracks the live cursor and `w` / `e` / `b`; Ctrl+Tab notifies attach clients.
- Windows Quick Select opens `C:\` and UNC paths.
- Aliases can expand to pipelines / `&&`; Windows `>(cmd)` process substitution works.
- Pane snapshots are shared so a quiet frame no longer clones the whole grid.
- galdr-shell accepts redirections on fds 3–15.

### Fixed

- A broken `config.toml` no longer freezes the last-good mtime, so a later valid save reloads.

## [0.1.6] - 2026-08-22

### Fixed

- GNOME Files on Ubuntu 26.04 / Nautilus 4.1 no longer silently drops the folder context item: the installer pins the Nautilus GI version and installs `python3-nautilus` when it can.
- Windows Explorer context menu title is written as Unicode code points so “在此处打开 Galdr” is not mojibaked by PowerShell 5.1 / `irm`.
- Windows galdr-shell login no longer stays on the tab spinner or flash-exits from Explorer: ConPTY now starts the console helper `galdr-sh.exe` instead of GUI-subsystem `galdr.exe --shell`.

### Changed

- Linux installer writes a proper Apps entry (`galdr.desktop`) and folder “open here” actions; GNOME can show a top-level item when `python3-nautilus` is installed.
- Windows installer adds Galdr to the Start menu and Explorer context menu (folder, background, drive). Chinese UI uses “在此处打开 Galdr”.
- `~/.galdr/uninstall` (Windows: `uninstall.ps1`) removes those menu entries. `rm -rf ~/.galdr` alone leaves them behind.

## [0.1.5] - 2026-08-21

### Fixed

- Windows Explorer and Start menu launches no longer open a second system console next to Galdr.

## [0.1.4] - 2026-08-21

### Added

- `galdr --cwd` so a window can start in a chosen folder.
- Installer adds Galdr to the Windows Start menu and Explorer context menu.
- Linux installer adds Galdr to the app menu and folder context menus.

## [0.1.3] - 2026-08-21

### Added

- `galdr --version`

### Changed

- Windows completion, smart hints, and Enter-to-accept.
- Settings wheel scrolls the list; Left/Right still change the value.
- Faster, more reliable Windows console and mux attach.
- Unix-only builtins report that they are unavailable on Windows.

## [0.1.2] - 2026-08-20

### Added

- GPU terminal with wgpu instanced cells, HiDPI, IME, tabs, splits, search, and session restore.
- Builtin galdr-shell as the default login, with `~/.config/galdr/galdrc` as the only startup file.
- Optional `include` in `galdrc` for bashrc, zshrc, profile, and other well-known rc files.
- Frequency-sorted Tab completion and a host-drawn completion menu that opens above the prompt.
- Mux attach on a Unix socket or Windows named pipe (`galdr --server` / `galdr --attach`).

### Changed

- Default font size is 15pt with line height 1 and tab-line height 1.5.
- Tab or Enter accepts a completion; Space does not.
