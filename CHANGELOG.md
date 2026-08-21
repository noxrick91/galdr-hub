# Changelog

Notable user-facing changes to Galdr are recorded here. Implementation details remain in the source history.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions match Git tags.

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
