# Changelog

User-facing changes to Galdr. Versions match Git tags.

## [Unreleased]

## [0.1.13] - 2026-08-23

### Fixed

- Windows: typing `cd` no longer parks the caret between `c` and `d`. The host-menu dummy hint is a space (not U+200B), and the grid gives ZWSP a cell so a ConPTY CUB cannot walk back onto the last character.

## [0.1.12] - 2026-08-23

### Fixed

- Windows: the login self-check is part of the first rustyline prompt, so ConPTY no longer erases it before the caret appears.
- Windows: tab (and split/scroll) drag no longer flashes the whole window. The HWND uses `WS_EX_NOREDIRECTIONBITMAP`, DXGI keeps a queued frame, and chrome drags present without `WM_PAINT`.
- Windows: an exact completion match (`cursor` among `cursor-agent` …) still keeps the host menu navigable; Up/Down/Tab update the highlight immediately.
- Windows: startup PATH self-check splits on `;` and drive-safe `:`; PATHEXT lookup keeps the on-disk spelling (`git.exe`, not `git.EXE`).
- Windows: `wait` on a stopped job without process handles stays stopped; process-substitution writers use `PIPE_ACCESS_OUTBOUND`.

## [0.1.11] - 2026-08-23

### Added

- Interactive galdr-shell prints a short startup self-check (tty, galdrc, history, jobs, PATH, completion, platform). Set `GALDR_STARTUP=0` to silence it.
- Programmable completion: `complete -D`/`-E`/`-I`/`-o`, `compopt`, and `compgen` actions with path-aware `-f`/`-d`. After `include bashrc`, Tab runs bash-completion functions (including `_comp_load` returning 124).
- galdr-shell sets `BASH`, `BASH_VERSION`, and `BASH_VERSINFO` so rc files that branch on bash identity work.
- `set -o posix` and `shopt -o` / `-oq` (combined short options such as `-oq`) match bash. Common `shopt` names such as `histappend` and `checkwinsize` are accepted.
- `include env` (Windows) merges user and machine registry environment, especially `PATH`. `include powershell` dumps the PowerShell profile environment into the current shell.

### Changed

- `include` of bash-family files (`bashrc`, `profile`, paths) executes them instead of filtering `shopt`, prompt variables, or hook files such as `nvm.sh`. zsh/fish names stay a lenient importer.

### Fixed

- Windows: `include powershell` sources `$PROFILE` (errors are ignored) and still dumps env if the process exits non-zero.
- Windows: `<(…)` is a named pipe so the reader can start before the producer finishes. `>(…)` no longer stops pumping after 30s.
- Windows: background jobs from extra-fd / `winspawn` children are waited on; `exec` uses the same Ctrl+C-aware wait as a normal spawn.
- Windows: PATH lookup uses PATHEXT and does not let an extensionless file shadow `foo.exe`.
- Windows: missing `galdr-sh.exe` no longer falls back to GUI `galdr.exe --shell` (ConPTY hang). Search includes `~/.galdr/bin` and PATH. `cargo build -p galdr` / `cargo install -p galdr` also emit `galdr-sh`.
- Programmable completion: a panicked completer clears inflight so Tab can retry; cache keys include `COMP_POINT`; loader redefinitions merge into the REPL.
- Interactive `$-` includes `i`, so `include bashrc` no longer hits the Debian/Ubuntu early `return`.
- Up-arrow history no longer sticks on lines that open a completion menu (for example `source ~/.config/galdr/galdrc`). Up from the first menu item continues through history.
- `include` / `source` set `BASH_SOURCE` while sourcing so ROS `setup.bash` finds its `setup.sh`.
- POSIX `\`-newline continuation, `${var%%[<{]*}` patterns, `${var,,}` / `${var^^}`, `name+=()`, C-style `for (( ))`, `[[ == @(a|b) ]]`, `name[$k]=value`, and `((BASH_VERSINFO[0] >= 5))` now parse so `include bashrc` can load `bash_completion` and `nvm.sh` without leaking function bodies.
- `echo | command tr` no longer deadlocks, so nvm.sh can compute `IFS` and finish `nvm use` on source.
- `(( ${#arr[@]} ))` / `$(( $# ))` expand parameters before arithmetic, so bash_completion no longer reports `bad char '#'`.
- `"${arr[@]}"` and `"$@"` with no elements vanish, so an empty completion-config list is not sourced as `. ""`.
- Builtin `ls -q` / `--hide-control-chars` prints `?` in place of control characters in names.
- `BASH_SOURCE` in `$( )` follows the source stack, so ROS `setup.bash` finds `setup.sh` next to itself.
- Indexed-array subscripts are arithmetic (`${a[i]}`, `a[i]=`, `unset 'a[i]'`), so bash-completion’s `_comp_load` can walk `dirs[i]` and source `/usr/share/bash-completion/completions/*`.
- `"${#arr[@]}"` is the element count (not the elements), so `_comp_split` can populate completion search paths.
- `[[ == ]]` / `[[ != ]]` use bash extglob, and `[[ -v name ]]` tests whether a name is set.
- History expansion does not rewrite `!` inside `${...}`, so `${!arr[*]}` is usable in an interactive shell.
- Command substitution inherits `complete` specs, so `_comp_load` can see `complete -p` after sourcing a completion file.
- `${var%/*}` strips the shortest suffix, so `_comp__base_directory` is the directory of `bash_completion` rather than `/`.
- `local -a` / `local -A` (and `declare -a` in a function) create a function-scoped array, so completion helpers do not clobber global arrays.
- Tab insert honors `compopt -o nospace`: a space is appended unless the option is set or the word already ends with a space, slash, or `=`. Menu labels drop a pad space from COMPREPLY.
- Programmable completion runs on an isolated snapshot and never blocks the prompt. Tab and hint use cached hits or the catalog until the worker finishes, so a slow or hung completer cannot freeze the editor or the shell.
- Widening the window reflows soft-wrapped lines so text fills the new width and uses fewer rows. Extra rows stay below the prompt, so a narrow-then-wide resize no longer leaves a blank band at the top or parks the caret on the wrong line.
- Soft wrap and reflow break before a word that does not fit, so a long line does not split a name in the middle.
- Builtin `ls` prints a column grid (down, then across) sized to the live tty width. One long name only widens its own column. Already-printed listings do not re-columnize on resize; run `ls` again.
- POSIX `basename` and `dirname` are builtins, so micromamba’s shell hook can name the `micromamba` function even when `PATH` has no coreutils. Without that, `include bashrc` printed `Error unknown MAMBA_EXE`.
- Path completion keeps listing the next directory or file after the first component is accepted. A `-F` completer that returns nothing for a path-shaped word falls through to filesystem matches.
- Ctrl+Z prints the stopped job the way `jobs` does (`[1]+  Stopped  command`), including the command that was running.
- `jobs` marks listed stops as already reported, so the next prompt does not print the same `[1]+  Stopped` line again.
- Command-name hints scan the shell `PATH` (after `include bashrc`), not the process environment. Tools added in bashrc such as `claude` in `~/.local/bin` now complete.
- Argument hints from `--help` resolve the executable on the same shell `PATH`, so `claude ` can offer subcommands after the help cache fills.
- Completing or typing a full command name immediately offers its arguments. The first `--help` probe is waited for briefly instead of staying empty until the next key, and accepting the command from the menu no longer hides those hints. Enter still runs the finished command; Tab inserts the selected argument.
- Esc closes the completion popup. The host treats Esc as dismiss while the menu is open, and a dismissed menu stays closed until the current word changes.

## [0.1.10] - 2026-08-22

### Changed

- Dragging a tab follows the pointer with a ghost chip. Other tabs slide to close the old slot and open a gap at the drop point; the order commits on release.

## [0.1.9] - 2026-08-22

### Fixed

- Windows no longer flashes a white window at startup: the HWND stays hidden until the first GPU frame, then opacity, rounded corners, and the drop shadow are reapplied after winit rebuilds the window styles.

## [0.1.8] - 2026-08-22

### Added

- Settings can toggle system font fallback and edit `TERM`.
- `exec 3>file` (no command) keeps the redirection on the shell.
- `complete -C` runs an external completer (`COMP_LINE` / `COMP_POINT` / `COMP_CWORD`).
- Windows children inherit fds 3–15 (CRT `lpReserved2`). Nested `galdr-sh` imports them.
- `case` fallthrough: `;&` runs the next arm's body; `;;&` keeps testing later arms.
- Background `&&`/`||` lists set `$!` (same fake-PID range as coproc).
- Windows `fg` waits on stored process handles or in-process jobs; `bg` marks the job running.

### Fixed

- Closing the window no longer treats the login shell `galdr-sh` as a running command.
- Glyph atlas reset clears the GPU texture so stale glyphs do not linger after a font change or overflow.
- Grapheme intern recycles slots instead of returning 0 (empty cell) when full.
- Attach search uses the same line-text / wrap join as the local grid.
- `[[ =~ ]]` caches compiled regular expressions.

### Changed

- Completion matches substrings and abbreviations (`git cko` → checkout), follows aliases, completes `$VARS` / `export` / `help`, and reads git branches from `.git`.
- `complete -F` / `-C` no longer block the hint on every keystroke.
- Quoted words and `>` redirections complete as paths. Home / End jump in the menu.
- Docs match the real defaults (`galdr-dark`; Cascadia on Windows, DejaVu on Unix).

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
