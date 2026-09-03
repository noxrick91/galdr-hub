# Changelog

User-facing changes to Galdr. Versions match Git tags.

## [0.2.19] - 2026-09-04

### Added

- An `[update]` configuration section with `check` and `auto_install`, also honouring `GALDR_NO_UPDATE_CHECK`, so air-gapped and centrally managed installations can turn off the startup release check.
- The built-in `cat` accepts `-n -b -s -E -T -v -e -t -A` and streams its input, so piping a large file no longer reads it into memory and `tail -f | cat` forwards lines as they arrive.

### Changed

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

### Fixed

- A plugin that misses a completion deadline no longer loses its pages and commands too. Completion is asked for on a keystroke and given 300 ms; missing that now backs off only further completions, while three hard failures still stop everything for the minute they were counted in.
- Extracted plugin files are never left writable by other accounts, whatever mode the package declares.
- Updating all plugins no longer stops at the first failure. A plugin the Hub cannot serve, or whose package fails verification, is reported by name and the rest still update.
- Superseded plugin packages are pruned by any plugin-manager command that changes state, instead of only after an update whose host reload succeeded. Installs that accumulated old versions release that disk space at the next enable, install, or update.
- Shell history is written as each command is entered instead of only when the shell exits cleanly. Closing a window kills the shell outright, so until now a whole session's history — and on a long-running window every command ever typed — was lost, and the last command before any exit was missing.
- A highlight is dropped once the text under it is replaced. Copying re-reads the grid at the moment the copy happens, so a highlight left over a full-screen application that had since redrawn those rows quietly put different text on the clipboard. Redrawing the same characters, which most applications do constantly, leaves the selection alone.
- A highlight left over a full-screen application can be dismissed again. Clicking in a pane whose application asked for the mouse never reached the host's selection handling, so a selection made there stayed on screen with no gesture that would clear it; the click now clears it and still reaches the application.
- Copying a selection no longer carries the blank padding a drag sweeps past the end of each line. Lines that were wrapped keep their full width, and interior spacing is untouched.
- Scrolling back no longer drifts: new output keeps the viewport on the text being read instead of sliding it forward, and dragging the scrollbar stays accurate while output arrives.
- Array and positional-parameter slices such as `${a[@]:1}` and `${@:2}` select elements instead of silently expanding to nothing, and `${s:0:-1}` and `${s: -99}` now match bash.
- Arithmetic supports `**`, the ternary operator, and hexadecimal, octal and `base#digits` literals, and `&&`, `||` and `?:` no longer apply assignments from the branch they skipped.
- `echo` honours `-e` and `-E` with the full escape set, and `printf` accepts `0x`, octal and `'c` numeric operands.
- The multiplexer socket is created private to the user and refuses connections from other accounts, which previously could start processes in the running session.
- A plugin whose identifier is made only of dots is rejected instead of installing outside the plugin directory.
- Plugin packages are downloaded into a private directory and verified and extracted through one file handle, and extraction stops on the bytes actually written rather than on the sizes the archive declares.
- Process plugins run under address space, process count, file descriptor and core dump limits.
- Ctrl+click asks for confirmation before handing a local path or `file://` link to the desktop opener.
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

## [0.2.18] - 2026-08-30

### Added

- Galdr Password Manager provides an encrypted local credential vault with scoped session or persistent grants, automatic locking, master-password rotation, and short-lived secret clipboard writes.
- Galdr Git provides a full-page repository workspace with commit history and graph context, working-tree and index changes, staging, commits, branch management, diff inspection, and remote synchronization.
- Galdr SSH manages reusable profiles with explicit password or key authentication. SSH terminals and SFTP browsing connect independently through private AskPass channels, and the SFTP browser supports direct paths plus file and directory transfers.
- Declarative plugin UI now supports panels, tabs, selectable weighted tables, diff-aware code blocks, dividers, spacers, multiline text editors, keyboard-native file-table actions, and nested page dialogs.
- Process plugins can request scoped credential use, SSH-agent access, direct networking, repository access, or explicit read-only access to the user's home directory. The host validates each capability and re-sandboxes plugins when their active repository changes.
- Managed Linux and Windows installations can apply available Galdr updates directly from the update prompt.

### Changed

- The plugin manager uses each installed plugin manifest's display name, including for local plugins that are absent from the current marketplace catalog.
- The official website presents plugins in compact responsive cards with a clear install action and a lightweight permission disclosure, so larger catalogs remain easy to scan.
- Galdr SSH 0.1.7 uses compact switchable Remote files and Local files views. It reuses the selected connection credential without rendering the password, supports arbitrary local paths under the granted home directory, and exposes keyboard shortcuts for navigation and transfers.
- Galdr Downloader 0.3.10 adopts the extended declarative UI event and input schema used by Galdr 0.2.18.

### Fixed

- SSH and SFTP terminal tabs start with a stable connection title, so clients that do not emit a terminal title no longer remain in the loading state.
- Galdr SSH reliably switches in both directions between its Remote files and Local files panels.
- Password and key credential edits now report save failures or success, and saved passwords can be reused by SSH and SFTP without appearing in process arguments or plugin documents.
- Closing a window while a plugin page or child dialog is open no longer leaves the confirmation UI layered into the page.
- Holding Delete no longer repeats through both stages of remote-file deletion confirmation.
- Plugin publication reconciles current manifests with the public marketplace index, so a later run automatically resumes plugin versions omitted by an earlier partial failure.

## [0.2.14] - 2026-08-27

### Changed

- Installers now stage and verify the complete Galdr runtime before replacing files in place, without terminating the Galdr session that launched the update; open windows and shells continue on the old image until restarted.

### Fixed

- Linux and Windows upgrades now verify matching `galdr`, `galdr-sh`, `galdr-plugin-host`, and `galdr-plugin` versions on disk and warn when `PATH` resolves a different installation.
- Plugin marketplace installs now require package identity and version to match the selected index entry, verify the versions loaded by the running host, and request a restart when activation cannot be confirmed.
- Downloader 0.3.9 preserves freshly discovered media when the URL input commits an unchanged value, so the first Download click queues the selected item; asynchronous network failures now show their error on the task.

## [0.2.13] - 2026-08-27

### Changed

- Dragging a session tab now opens a dashed insertion slot between neighboring tabs, including a reliable target before the first tab, without rendering a duplicate of the dragged tab.
- Downloader 0.3.8 shows completed downloads as compact filename-only rows.
- Release publication is now resumable and keeps immutable tags and assets consistent when a workflow is retried.

### Fixed

- Terminal contents now reflow losslessly when a window is narrowed and widened again, preserving column gaps, CJK text, background fills, scrollback extent, and the bottom viewport position.
- ConPTY cursor positioning now stays aligned with Galdr's recovered rows after reflow, preventing completion popups and subsequent input from jumping upward or leaving stale text behind.

## [0.2.12] - 2026-08-26

### Changed

- First-party plugin publishing now covers every public Galdr target and rejects incomplete platform matrices before packaging.
- Downloader 0.3.7 adds native Linux and Windows ARM64 packages, including the matching managed `yt-dlp` executable.

### Fixed

- Enter after accepting a programmable completion now executes the completed command instead of inserting the first candidate for the next argument.
- Empty-prefix completion now keeps a stable initial candidate, so moving down once and pressing Tab selects the next candidate instead of wrapping back to the first.
- Plugin releases now use the same verified Windows ARM64 cross-compiler setup as Galdr releases.

## [0.2.11] - 2026-08-26

### Changed

- Passive hints and pasted text now use only static or cached completion data; external help probes, programmable completers, and plugin generators run only after an explicit Tab request.
- The shared plugin host now tracks live Galdr clients and exits after the last client closes, following a short grace period and bounded plugin-runtime cleanup.

### Fixed

- Help discovery no longer opens external documentation while pasting command lines and only probes confirmed subcommand paths with terminal-local help.
- Plugin runtime workers no longer leave `galdr-plugin-host` running indefinitely after Galdr closes.

## [0.2.10] - 2026-08-26

### Changed

- The downloader plugin release metadata now targets version 0.3.6.

### Fixed

- Linux updates now finish process cleanup successfully after all managed Galdr processes have stopped.
- Windows Tab, completion-menu clicks, and ghost hints now use the shell's selected completion, preserving its exact replacement, quoting, path-separator, and spacing rules.
- With the automatic suggestion popup disabled, Tab now completes the longest common prefix and a second Tab prints all candidates below the prompt instead of opening a popup.

## [0.2.9] - 2026-08-26

### Changed

- Reinstalling or updating now stops processes from the managed Galdr installation, removes old core binaries and release staging, then installs the verified release while preserving configuration, plugin data, and managed tools.
- The website improves homepage typography and responsive readability, removes stale preview versions, and expands the bilingual plugin documentation with manifest, managed-tool, declarative-UI, sandbox, and troubleshooting references.

## [0.2.8] - 2026-08-26

### Fixed

- Linux and macOS builds no longer reference the Windows-only native clipboard command, and the Rust 1.98 CI lint remains warning-free.

## [0.2.7] - 2026-08-26

### Fixed

- Clipboard text is sent to terminal applications as text instead of being reinterpreted as a `Ctrl+V` shortcut, preventing text pastes from triggering image-paste actions.
- Plugin marketplace and other page-style plugin interfaces close with one `Esc` even while an input is active, and their footer now describes that behavior accurately.

## [0.2.6] - 2026-08-26

### Added

- Plugin manifests can declare platform-specific tools that Galdr resolves, verifies, and stores under the current user's `~/.galdr/tools` directory on Windows and Linux.
- Page-style plugin interfaces support fixed-width columns and a native header back action without taking ownership of the application window controls.
- Downloader 0.3.5 provides richer quality, codec, container, frame-rate, and audio information, plus one-click clearing of completed tasks.

### Changed

- The plugin marketplace now separates the plugin list and detail views. Management and permissions use a compact left column, while identity and About content adapt to the remaining width.
- Downloader uses a cleaner two-column workspace with deliberate spacing, concise media rows, and no repeated output-file description.
- Enabled plugins use a green status dot without tinting the complete control.

### Fixed

- Plugin and Downloader inputs accept keyboard input immediately after focus, support Unicode-aware cursor movement and editing, and position the IME candidate window at the visible caret.
- Opening a page-style plugin interface no longer prevents resizing, minimizing, or closing the Galdr window; page titles and blank areas no longer dismiss the interface, while modal backdrops retain their expected behavior.
- Managed `yt-dlp`, FFmpeg, and JavaScript runtimes work inside the Windows plugin sandbox, restoring discovery and download for YouTube and similar extractor-supported sites.
- Extractor downloads preserve useful failure diagnostics, and direct downloads recover when a server advertises byte ranges but later responds with a complete file.

## [0.2.5] - 2026-08-25

### Added

- The plugin marketplace has a default Ctrl+Shift+M shortcut, startup update detection, update prompts, and restart-required notices for plugins that cannot reload live.
- Settings → Shortcuts can capture, rebind, replace conflicting, and remove key bindings without editing `config.toml` manually.

### Changed

- The plugin marketplace now uses a responsive master-detail layout with compact twelve-item pages, keyboard navigation, enabled-status dots, an Official badge, bounded About text, and clearly separated management and permission sections.
- Plugin panels preserve control focus across refreshes, support keyboard and context-menu input operations, expose styled badges/status buttons and determinate or indeterminate progress, and keep long or scrollable content readable.
- Downloader 0.3.3 automatically analyzes pasted URLs, presents direct per-item download actions, separates active and completed tasks into scrollable tabs, and uses a proprietary plugin manifest.

### Fixed

- Downloader URL input remains visible while discovery runs and accepts configured paste shortcuts, right-click paste, keyboard text, and IME text.
- Extractor downloads discard impossible size estimates instead of showing a running task as 100% complete when downloaded bytes exceed the reported total.
- Plugin install, update, enable, disable, permission, and removal operations stay hidden on Windows instead of flashing console windows; marketplace refreshes also preserve the active control.
- The command palette closes when its backdrop is clicked, and live plugin commands such as Open download manager appear without restarting the shell.

## [0.2.4] - 2026-08-25

### Fixed

- Windows Explorer “Open Galdr here” launches no longer flash a PowerShell or host-console window before Galdr appears.

## [0.2.3] - 2026-08-25

### Changed

- The website wordmark and favicon now use the application waveform icon alongside the pixel-style GALDR title.

### Fixed

- DEC 2026 synchronized output is now honored end to end, so animated AI agent updates are presented atomically instead of moving the cursor or flashing intermediate frames.
- Shell version fixtures now derive their expected value from the package version, preventing stale release-specific strings from blocking future releases.

## [0.2.2] - 2026-08-25

### Changed

- The website wordmark and favicon now use the application waveform icon alongside the pixel-style GALDR title.

### Fixed

- DEC 2026 synchronized output is now honored end to end, so animated AI agent updates are presented atomically instead of moving the cursor or flashing intermediate frames.

## [0.2.1] - 2026-08-25

### Added

- Settings now includes an About page with author/contact information, the complete config path, manual update checks, and a background startup update notification.
- Galdr Shell startup can select `auto`, native `galdr-sh`, or integrated `galdr --shell`; the automatic mode verifies and prefers the matching helper.
- The automatic completion dialog can be disabled independently without changing Tab completion or inline ghost hints.

### Changed

- Linux releases now ship native x86_64 and ARM64 `galdr-sh` binaries instead of installing a wrapper around the full GUI executable.
- Plugin command discovery uses an atomic, schema-versioned cache and hot-refreshes at the next prompt, removing supervisor IPC from new-shell and command-palette startup.
- The Downloader plugin is now v0.3.1: it automatically uses system `yt-dlp`, recognizes JSON-LD/player URLs, escaped stream URLs, and embedded player pages, and documents its expanded site compatibility path.
- The title bar, website wordmark/favicon, desktop icon, and application icon now share a pixel-style Galdr mark; the title animation wakes only for its occasional short glitch cycle. Website body, terminal demo, marketplace, and download typography is larger.

### Fixed

- Settings no longer truncates the config path; long paths are wrapped in About.
- `galdr-sh -c` without a command now fails with a clear usage error instead of silently entering another mode.

## [0.2.0] - 2026-08-25

### Added

- A versioned plugin platform with process, WebAssembly component, and explicitly trusted native runtimes; capability grants, isolated storage, lifecycle supervision, shell integration, events, and declarative UI are built in.
- The `galdr plugin` management CLI, in-app marketplace, and official Downloader plugin with concurrent and resumable transfers, media discovery, HLS capture, Magnet/BitTorrent support, and a native Galdr interface.
- Plugin API, SDK, host crates, a complete example plugin, marketplace publishing automation, and bilingual documentation for using, securing, developing, and publishing plugins.

### Changed

- The website, documentation shell, logo, favicon, and application icon now share a new Galdr visual system. The homepage terminal demo has larger type, live session/runtime details, and responsive mobile layout.
- Install, update, and uninstall commands now expose platform-specific one-click copy actions with accessible success and failure feedback.
- Release packages now ship the plugin supervisor and management CLI beside Galdr, and the Linux and Windows installers install, validate, update, and remove the complete runtime together.
- Hub and marketplace publishing now creates atomic commits through GitHub's Git Data API, avoiding unreliable long-lived Git clone and push connections from the release runner.
- Plugin publishing now verifies GitHub's server-side asset digest when available and uses an unambiguous binary media type for fallback downloads.
- Plugin releases no longer replace Galdr as the repository's latest release, and Hub metadata selects only versioned Galdr releases.
- Windows ARM64 and macOS marketplace downloads use the operating system TLS provider, avoiding upstream `ring` cross-compilation limitations while retaining rustls on other targets.

## [0.1.16] - 2026-08-24

### Changed

- Galdr Shell startup diagnostics are now opt-in with `GALDR_STARTUP=1`, so routine sessions reach the prompt without a synchronous PATH self-check.

### Fixed

- Windows no longer launches `galdr-sh.exe --version` before creating every pane. Release installers already validate the GUI/helper version pair, avoiding redundant process startup on the GUI thread.
- The PowerShell installer now explicitly waits for GUI-subsystem executables and captures their output when checking `--version` and `--help`, preventing valid Windows packages from being rejected.

## [0.1.15] - 2026-08-24

### Added

- Settings → Terminal can enable or disable DEC 1007 alternate-screen wheel translation. It is enabled by default so full-screen applications such as Codex can receive wheel movement even when they do not request mode 1007 themselves.
- Opt-in real-window performance reports (`GALDR_PERF_OUTPUT`) capture startup-to-first-present, frame percentiles, input-to-present samples, GPU identity, synchronization mode, and visible pane load. The release benchmark also covers dirty-row snapshots, eight-pane output, and scrollback reflow.
- Bash-compatibility differential tests compare the supported quoting, expansion, array, control-flow, pipeline, command-substitution, and here-document subset with the system Bash.
- Continuous verification now runs for branches and pull requests, enforces formatting and strict Clippy, tests every workspace target, cross-builds Linux and Windows, and checks both macOS Rust targets.

### Changed

- Galdr Shell carries file descriptors 0 through 63 across both Unix and Windows child processes, up from 0 through 15.
- Release builds use the pinned Rust 1.98.0 toolchain, keep pull-request verification away from the persistent release cache, enforce the Rust 1.85 MSRV, validate exact Forgejo asset metadata, and download/hash every staged GitHub asset before publishing.
- Hub pages and installers publish as one commit using non-persistent Git credentials and retry transient GitHub transport failures. Installers verify the GUI/helper version pair before replacing an existing installation.

### Fixed

- Command-help completion performs a final cache read after an in-flight probe finishes, eliminating a race that could briefly hide freshly parsed options and subcommands.
- Primary and alternate screens now preserve rows displaced by top-anchored scroll regions, so TUIs such as Codex expose real, wheel-, PageUp-, and drag-scrollable message history. DECSTBM treats a zero bound as the window edge, and the mouse wheel prefers that host history even if the application also enabled mouse reporting.
- Interactive galdr-shell writes its idle title and self-check before sourcing galdrc on Unix, so a slow `include bashrc` no longer leaves the new-tab spinner up for a second.
- Startup no longer wakes a discrete GPU on hybrid systems. Linux limits Vulkan discovery to the display GPU when possible, font styles share loaded face data, render pipelines reuse an adapter-keyed cache, and redundant Wayland/DPI startup frames are skipped.
- Git Bash now installs the required `galdr-sh.exe`. Windows ARM64 falls back to the x64 package when an older native package cannot run, and uninstallers remove only Galdr-owned files instead of recursively deleting a custom installation prefix.

## [0.1.14] - 2026-08-23

### Added

- Galdr Shell now has an explicit native language identity: `GALDR_SHELL`, `GALDR_SHELL_VERSION`, and `GALDR_COMPAT=native`.
- `galdr-sh --compat bash` and `galdr --shell --compat bash` enable the Bash identity compatibility layer deliberately.
- `docs/galdr-shell-language.md` defines the native 0.1 language contract and the boundary of configuration imports.
- DEC private mode 1007 alternate scrolling, so the mouse wheel drives full-screen applications such as Codex that own their scroll history.

### Changed

- Native sessions no longer initialize `BASH`, `BASH_VERSION`, or `BASH_VERSINFO`. Bash-family `include` imports receive those identities only while the import runs; imported functions that require them later can use global Bash compatibility mode.

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
- Windows: missing or mismatched `galdr-sh.exe` no longer falls back to another copy on PATH. The helper is built only by the `galdr` package and installed next to the same-version GUI.
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
