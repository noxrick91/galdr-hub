# Galdr 使用手册

Galdr 是 GPU 加速终端。打开就是内置的 **galdr-shell**。启动文件在 Unix 是 `~/.config/galdr/galdrc`，在 Windows 是 `%APPDATA%\galdr\galdrc`，不会自动读 `.bashrc`。

预编译包装到 `~/.galdr/bin`。从本站首页或下面的安装命令获取。

### 它做什么

- wgpu 实例化单元格渲染，HiDPI、IME、CJK / emoji 回退字体
- 标签（可拖动重排）、分屏、搜索、命令面板、主题
- 会话恢复；mux 可分离再附着（Unix socket / Windows named pipe）
- 内置 bash 形 shell：函数、数组、作业控制（Unix）、常用 builtin
- 版本化插件 API：命令、Shell 集成、事件与声明式 UI；权限按能力单独授予

### 怎么读这份手册

从 [安装](#/install) 和 [快速开始](#/quick-start) 上手。右上角 **中文 / EN** 切换整本手册；换语言会停在同一页。

---

## What's new

This page lists changes in the **current public release**.

**What's new in v0.2.20** — 2026-09-04

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

## 安装

### 一键安装

Linux / Git Bash：

```bash
curl -fsS https://term.noxcaw.com/install | bash
```

指定版本（把 `vX.Y.Z` 替换为目标发布版本）：

```bash
curl -fsS https://term.noxcaw.com/install | bash -s -- vX.Y.Z
# 或
GALDR_TAG=vX.Y.Z curl -fsS https://term.noxcaw.com/install | bash
```

Windows PowerShell：

```powershell
irm https://term.noxcaw.com/install.txt | iex
```

不要用 `irm …/install.ps1`：网站把 `.ps1` 标成 `application/octet-stream`，Windows PowerShell 5.1 的 `irm` 读不成脚本。`.txt` 是 `text/plain`。若必须拉 `.ps1`：

```powershell
iex ((New-Object Net.WebClient).DownloadString('https://term.noxcaw.com/install.ps1'))
```

脚本按本机 OS/ARCH 选择资产（Linux x64/arm64、Windows x64/ARM64），下载后核对同 Release 的 `SHA256SUMS`，并在替换旧版本前实际运行版本检查，再装到 `~/.galdr/bin`。Windows ARM64 优先安装原生版本；旧版 Release 缺少 ARM64 资产或原生包因 VC++ 运行库不能启动时，会回退到 x64 系统模拟。macOS 预编译包暂不提供。再次运行安装器会先暂存并校验整套运行时，再以可回滚的文件替换完成升级，不会中途终止发起升级的 Galdr 会话；已打开的窗口和 shell 在重启前继续运行旧映像。用户配置、插件数据和受管工具会保留。

安装器**不会**改 `.bashrc` / `.zshrc`。它写入 `~/.galdr/env`。`curl | bash` 也改不了你当前已经打开的 shell，请：

```bash
source ~/.galdr/env
# 或把 ~/.galdr/bin 加进 PATH 后新开终端
```

安装时还会把 Galdr 接到系统菜单：

- Linux：写入 `~/.local/share/applications/galdr.desktop`，应用菜单（Apps）里会出现 **Galdr**。在文件夹上右键 **Open Galdr here** 会新开终端并 `cd` 到该目录。GNOME Files 的顶层菜单需要 `python3-nautilus`；安装器在能提权时会装上，否则请 `sudo apt install python3-nautilus && nautilus -q`。没装绑定时只在「脚本」里，且要点选文件夹。
- Windows：开始菜单加入 **Galdr**；资源管理器里右键文件夹 / 空白处 **Open Galdr here**。Windows 11 可能在「显示更多选项」里。

不想加菜单时设 `GALDR_NO_CONTEXT_MENU=1` 或 `GALDR_NO_START_MENU=1`。

### 官网 / 手动下载

打开本站首页，按平台下载最新资产，放到 `~/.galdr/bin`（Windows 为 `%USERPROFILE%\.galdr\bin\galdr.exe`），并对照 `SHA256SUMS`。

| 平台 | 资产 |
|------|------|
| Linux x86_64 | `galdr-x86_64-unknown-linux-gnu` |
| Linux aarch64 | `galdr-aarch64-unknown-linux-gnu` |
| Windows x64 | `galdr-x86_64-pc-windows-gnu.exe` |
| Windows ARM64 | `galdr-aarch64-pc-windows-msvc.exe` |

安装器还会装同架构、同版本的 `galdr-sh-*`；它是启动内置 Shell 的轻量原生助手。Windows 版本使用 console subsystem 以适配 ConPTY。

Linux 预编译包要求 glibc 2.35 或更新版本，还需要可用的 Vulkan（或 wgpu 支持的 GPU 后端）和字体。零配置找 DejaVu Sans Mono、Noto Sans CJK SC、Noto Color Emoji，并打开系统字体回退。

### 已安装后升级

再跑一次安装器即可，没有单独的 `galdr upgrade` 命令。

### 卸载

用安装器写好的脚本，才会一并去掉应用菜单、右键菜单和开始菜单项：

```bash
~/.galdr/uninstall
```

```powershell
& "$HOME\.galdr\uninstall.ps1"
```

只删 `~/.galdr` 会留下桌面项和资源管理器右键。卸载脚本只移除 Galdr 创建的文件；自定义 `PREFIX` 内的其他文件会保留。配置目录 `~/.config/galdr/` 不会被删除。

---

## 快速开始

```bash
source ~/.galdr/env
galdr
```

默认登录 **galdr-shell**（`galdr --shell`）。要用系统 shell：

```toml
# ~/.config/galdr/config.toml
[shell]
kind = "system"
```

内置 Shell 也可选择启动方式：

```toml
[shell]
kind = "galdr"
launcher = "auto" # auto | helper | integrated
```

`auto` 优先使用同目录、同版本的原生 `galdr-sh`，缺失或版本不符时回退到 `galdr --shell`；`helper` 强制使用助手；`integrated` 强制使用完整 Galdr 可执行文件。Windows 因 ConPTY 无法附加 GUI subsystem 程序，始终使用 `galdr-sh.exe`。插件命令从带版本的本地缓存启动，安装、更新、启用/禁用或卸载后由宿主原子刷新，已打开的 Shell 会在下一个提示符同步新列表。

可选配置在 `~/.config/galdr/config.toml`。没有这份文件也能启动。

---

## Shell 与 galdrc

启动文件在 Unix 是 `~/.config/galdr/galdrc`，在 Windows 是 `%APPDATA%\galdr\galdrc`。不会自动读 `.bashrc`。要沿用旧习惯，在 `galdrc` 里显式引入：

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

`include bashrc`、`profile`、`bash_profile` 和带路径的文件按 bash 执行（`export`、`alias`、函数、`shopt`、嵌套 `source`）。解析失败会警告并改走宽松读取。`include zshrc` / `fish` 仍宽松，并跳过 zsh/fish 专用命令（`setopt`、`bindkey` 等）。Windows 上 `include env` 合并注册表用户/系统 `PATH`；`include powershell` 导出 PowerShell profile 的环境。bash rc 里的 `PS1` 会生效；要保留 galdr 提示符，在 `include` 之后写回。`source` 是严格 galdr-shell 读取。

写进 `galdrc` 后要**新开标签或窗口**才生效，已经打开的会话不会重读。要发行版 bash 或完整 PowerShell 会话时设 `[shell] kind = "system"`。

`case` 支持 `;;` / `;&` / `;;&`。后台 `&&` / `||` 列表会设置 `$!`。Windows 没有 POSIX 进程组；`fg` / `wait` / `kill` 走进程句柄或进程内任务。

---

## 快捷键

绑定写在 `config.toml` 的 `[[keys]]`。设置 → Keys 可查看；改和弦请编辑文件。`mods` 用 `|` 连接，例如 `ctrl|shift`。同一组 key/mods 上 `action = "none"` 可解绑内置快捷键（后面的绑定覆盖前面的）。

```toml
[[keys]]
key = "c"
mods = "ctrl|shift"
action = "none"
```

| 快捷键 | 动作 |
| --- | --- |
| Ctrl+Shift+C / V | 复制 / 粘贴 |
| Ctrl+Insert / Shift+Insert | 复制 / 粘贴 |
| Ctrl+Shift+A | 全选 |
| Ctrl+Shift+T / W | 新标签 / 关标签 |
| Ctrl+Tab / Ctrl+Shift+Tab | 下一 / 上一标签 |
| Ctrl+PageDown / Ctrl+PageUp | 下一 / 上一标签 |
| Ctrl+Shift+PageUp / PageDown | 标签左移 / 右移 |
| Ctrl+Shift+D / E | 向下 / 向右分屏 |
| Ctrl+Shift+K | 关闭 pane |
| Alt+方向键 | 切换 pane |
| Ctrl+Shift+方向键 | 调整 pane |
| Ctrl+Shift+Z | 放大 / 还原 pane |
| Ctrl+Alt+E | 均分 pane |
| Ctrl+Shift+F | 搜索 |
| Ctrl+Shift+P | 命令面板 |
| Ctrl+Shift+M | 插件市场 |
| Ctrl+Shift+Space | Quick select |
| Ctrl+Shift+X | 复制 / vi 模式 |
| Shift+Up / Down | 滚一行 |
| PageUp / PageDown | 滚一页（主屏；全屏应用自己处理） |
| Ctrl+= / - / 0 / 滚轮 | 字体放大 / 缩小 / 重置（写入配置） |
| Ctrl+, | 设置 |
| F11 | 全屏 |
| Ctrl+Shift+L | 分离 |
| Ctrl+Shift+O | 切换主题 |

拖标签可重排，拖分隔条可改分屏，见 [界面](#/ui)。

Tab 或 Enter 接受补全；**Esc**（或 Ctrl+G）关掉补全弹出框。空格不接受。打完或确认完整命令名后，菜单会列出参数 / 子命令；回车仍执行当前命令。补全使用 shell 的 `PATH`（`include bashrc` 之后加进来的工具也能对上），并跟别名、变量和 git 分支；子串 / 缩写也能对上（例如 `cko` → checkout）。Home / End 跳到菜单首尾。`complete -F fn` 会跑函数（`COMP_WORDS` / `COMP_CWORD` / `COMPREPLY`）；`complete -C cmd` 会跑外部补全器（`COMP_LINE` / `COMP_POINT`）。按键时不会每次都阻塞去跑它们。被动提示和粘贴只读取静态或缓存的命令帮助；只有明确按 Tab 请求补全时，才会探测外部 CLI 的最新帮助。关闭“自动建议弹窗”后使用经典 shell 补全：唯一候选按一次 Tab 完成；多候选先补到最长公共前缀，再按一次 Tab 会把所有候选打印在提示符下方并恢复当前输入行，不打开弹出框。

交互里 Ctrl+Z 会停住前台作业并打印 `[n]+  Stopped  命令`，再用 `fg` / `bg` / `jobs` 管理。

---

## 配置

可选 `~/.config/galdr/config.toml`。没有这份文件也能启动；首次运行会写入一份示例。零配置主题是 `galdr-dark`。Windows 默认 Cascadia Mono + 微软雅黑 / Segoe UI Emoji；Linux / macOS 默认 DejaVu Sans Mono + Noto Sans CJK SC / Noto Color Emoji。`system_fallback = true` 还会追加内置 CJK / emoji / mono 列表。

改完文件后切回窗口，或等不到半秒会自动重载。`Ctrl+,` 打开设置（外观 / 终端 / Mux / 网络 / 快捷键 / 关于）；字体、主题、光标、`TERM`、启动行列等会写回同一份文件。“关于”会完整显示配置路径、作者与邮箱，并可手动检查更新；Galdr 启动后也会在后台检查并提示新版本。快捷键只能在 `[[keys]]` 里改。

```toml
[font]
family = "DejaVu Sans Mono"          # Windows 默认：Cascadia Mono
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
width = 3.0               # 竖线 / 下划线粗细（逻辑像素）
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
auto_popup = true          # false：先补公共前缀，双 Tab 在下方打印候选

[mux]
unix_socket = false
# socket_path = "/run/user/1000/galdr/mux.sock"
close_behavior = "exit"   # or "detach"

[session]
restore = false
restore_mode = "ask"      # ask | wezterm（直接恢复，不弹确认）
restore_commands = false

scrollback = 10000
osc52 = "confirm"         # copy | confirm | off
```

字体大小是逻辑 pt。Galdr 再乘窗口缩放，在物理像素里栅格化字形。`startup_cols` / `startup_rows` 是新窗口的单元格尺寸。

---

## 界面

窗口贴在会话上。关掉窗口，标签和分屏还在。`galdr --attach` 再贴回去。

### 标签

- 单击切换；点 `+` 开新标签；点 `×` 或中键关闭
- 按住标签拖到新位置。被拖的芯片跟着指针走，其它标签会挤开让出空位，**松手后**顺序才改
- 键盘：Ctrl+Shift+T / W 新开 / 关闭；Ctrl+Tab 切换；Ctrl+Shift+PageUp / PageDown 左移 / 右移

### 分屏

- 拖分隔条改比例；双击分隔条把这一刀两侧均分
- Ctrl+Shift+D / E 向下 / 向右拆；Alt+方向键切焦点；Ctrl+Shift+Z 放大一栏；Ctrl+Alt+E 均分全部

### 其它

- `Ctrl+,` 打开设置：外观（主题、字体、光标）、终端（回滚、OSC 52、`TERM`、会话恢复）、Mux、快捷键一览
- 主题：galdr-dark（默认）、Catppuccin、Tokyo Night、Gruvbox、One Dark、Solarized
- OSC 0/2 标题，OSC 7 cwd，OSC 8 超链接（Ctrl+点击），OSC 52（默认先确认）
- 选区、剪贴板、滚动条、右键菜单
- Quick select 与 vi / copy mode

---

## Mux 与分屏

mux 拥有 pane；窗口只是附着。

```bash
galdr --server                 # 无头 mux，$XDG_RUNTIME_DIR/galdr/mux.sock
galdr --attach                 # GUI 客户端
galdr --socket /tmp/galdr.sock --server
```

`mux.unix_socket = true` 时，普通 GUI 进程也会监听，另一个 `galdr --attach` 可以加入；关窗可以 detach 而不是杀掉 shell。默认 socket 在 `$XDG_RUNTIME_DIR/galdr/mux.sock`，也可用 `mux.socket_path` 或 `--socket` 改掉。Windows 用 named pipe。

---

## 会话恢复

`[session] restore = true` 时，下次启动会重开上次的窗口 / 标签 / 分屏 / cwd。`restore_mode = "ask"` 会先列出上次前台命令再确认；`wezterm` 则直接恢复、不再弹出确认列表。

---

## 插件概览

Galdr 插件是带版本的 `.zip` 包，通过 `galdr-plugin-host` 与终端通信。GUI 和 Shell 只收发有大小限制的协议消息，**不会把普通第三方插件直接加载进 Galdr 进程**。当前插件 API 主版本是 `1`。

插件宿主由同时运行的 Galdr 进程共享。它会跟踪这些客户端的进程生命周期；最后一个客户端退出后，宿主经过短暂宽限期，会有序关闭插件运行时并自动退出。持久化的插件任务可在下次启动 Galdr 时恢复。

插件可以贡献：

- GUI、Shell 或两边都能调用的命令
- 命令面板、快捷键和 `plugin:<插件 ID>/<命令 ID>` 动作
- 标签、pane、命令生命周期等事件
- 由 Galdr 渲染的声明式 UI，而不是任意窗口或 GPU 代码
- 经校验后应用到父 Shell 的目录、变量、导出变量和别名变更

三种运行时对应不同需求：

| 运行时 | 适合 | 隔离边界 |
| --- | --- | --- |
| `process` | 常规插件、外部库与后台任务 | 独立进程；Linux 使用 Bubblewrap，Windows 使用 AppContainer |
| `wasm` | 可移植、确定的逻辑 | Wasmtime component，64 MiB 内存上限与 epoch deadline |
| `native` | 确实需要宿主内性能或系统集成 | 在插件宿主进程内运行；每次二进制变更都要显式信任 |

到[插件市场](./plugins.html)查看官方目录，或继续阅读[安装与管理插件](#/plugin-management)。

---

## 安装与管理插件

按 `Ctrl+Shift+M`、在命令面板选择 **Plugin marketplace**，或从终端右键菜单进入 **Plugins**。内置市场支持搜索、安装、更新、启用 / 禁用、权限调整和卸载；本地缓存让已安装插件在离线时仍可管理。

### 从官方市场安装

先搜索和安装，再按实际需要授予权限：

```bash
galdr plugin search downloader
galdr plugin install-from com.noxcaw.term.downloader
galdr plugin inspect com.noxcaw.term.downloader
galdr plugin grant com.noxcaw.term.downloader http files_write ui
```

请求的权限**不会自动授予**。`inspect` 会分别显示 requested 和 granted。需要 P2P / Magnet 下载时再额外授予 `p2p_network`：

```bash
galdr plugin grant com.noxcaw.term.downloader p2p_network
```

官方索引默认为 `https://term.noxcaw.com/plugins/index.json`。开发和社区索引可用 `--marketplace INDEX` 指定。

### 日常管理

```text
galdr plugin list [--json]
galdr plugin inspect ID
galdr plugin enable|disable ID
galdr plugin grant|revoke ID CAPABILITY...
galdr plugin update [ID] [--marketplace INDEX] [--trust-native]
galdr plugin uninstall ID [--keep-data]
```

更新会保留启用状态、已授予权限和插件顺序；被固定版本的条目不会更新。原生插件二进制发生变化时必须重新传 `--trust-native`。卸载默认同时移除插件私有数据，`--keep-data` 会保留它。

### 安装本地包或 HTTPS 包

```bash
galdr plugin install ./hello.zip --grant ui
galdr plugin install https://example.com/hello.zip \
  --sha256 <64位十六进制摘要> --grant ui
```

直接 HTTPS 安装必须给 `--sha256`。市场索引中的每个平台包也必须有 SHA-256；市场和包 URL 必须是 HTTPS，本地开发可用路径或 `file://`。

---

## 权限与隔离

manifest 的 `capabilities` 是插件**请求**的能力，安装状态里的 grants 才是用户**授予**的能力。宿主会先裁掉插件无权读取的上下文字段，再拒绝无权返回的 Shell 修改或 UI 动作。

| 能力 | 允许的操作 |
| --- | --- |
| `context_read` | 读取调用上下文 |
| `terminal_read` / `terminal_write` | 读取终端内容 / 写入终端 |
| `tabs_manage` / `panes_manage` | 管理标签 / pane |
| `clipboard_read` / `clipboard_write` | 读取 / 写入剪贴板 |
| `notifications` | 发送系统通知 |
| `shell_state` | 读取或返回受校验的 Shell 状态变更 |
| `events` | 订阅声明的终端事件 |
| `ui` | 提供声明式界面与 UI 事件 |
| `files_read` / `files_write` | 只读 / 读写用户下载目录 |
| `user_files_read` | 只读访问用户主目录中的文件 |
| `workspace_read` / `workspace_write` | 只读 / 读写当前终端所在仓库 |
| `network` | 建立普通远程网络连接并使用 DNS |
| `http` | 使用 HTTP(S)、DNS 和已配置的代理 |
| `p2p_network` | 建立 P2P 网络连接 |
| `credentials_use` / `credentials_manage` | 通过宿主凭证代理使用 / 管理凭证 |
| `ssh_agent_use` | 连接用户的 SSH agent，不读取私钥文件 |

Linux 上的 `process` 插件包只读挂载，私有数据目录单独可写，环境变量先清空再按能力恢复。`files_read` / `files_write` 只把下载目录挂到 `GALDR_PLUGIN_DOWNLOADS`；`user_files_read` 把用户主目录只读挂到 `GALDR_PLUGIN_USER_FILES`；`workspace_read` / `workspace_write` 只把当前终端所在仓库挂到 `GALDR_PLUGIN_WORKSPACE`。只有授予 `network`、`http` 或 `p2p_network` 才会共享网络并暴露 DNS 文件。如果平台上没有严格沙箱，进程插件会被拒绝启动。

Windows 上的 `process` 插件运行在按能力配置的 AppContainer 和随宿主关闭的 Job Object 中。宿主只授予包目录的读取 / 执行、私有数据目录的读写，以及用户明确批准的 Downloads、当前工作区与网络访问；无法建立严格沙箱时同样拒绝启动。

插件帧与 UI 树都有大小上限。崩溃或超时后宿主会重启插件；同一插件 60 秒内失败三次，会在本次会话中停用。插件包不接受绝对路径、父目录穿越；Linux 包也不接受符号链接。

> `native` 插件不具备进程或 Wasm 的代码隔离。只对可信来源使用 `--trust-native`。

---

## 插件包与 manifest

插件是根目录包含 `plugin.toml` 的 ZIP 包。包内路径必须是相对路径，不能包含 `..`、绝对路径；Linux 包不能包含符号链接。一个包含 Windows 与 Linux process 入口的包可以按下面组织：

```text
hello.zip
├── plugin.toml
└── bin/
    ├── hello
    └── hello.exe
```

manifest 使用 schema 1，未知字段会直接报错。ID 应使用反向域名并在发布后保持不变：

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

| 字段 | 作用 |
| --- | --- |
| `schema` | manifest 格式版本，当前为 `1` |
| `id` / `version` | 插件的稳定 ID 与语义化版本 |
| `api` / `galdr` | 兼容的插件 API 与 Galdr 版本范围 |
| `entrypoints` | 按 `os`、`arch` 选择的运行时和包内入口 |
| `capabilities` | 插件请求、但尚未获得的能力 |
| `tools` | 由宿主解析、校验并管理的外部工具 |
| `contributions` | 命令、事件和 UI 入口 |
| `requires_restart` | 只有无法热重载的插件才设为 `true` |

命令的 `scope` 可以是 `gui`、`shell` 或 `both`。每个命令始终有稳定动作名 `plugin:<插件 ID>/<命令 ID>`，命令面板和代码应复用这个名字：

```toml
[[contributions.commands]]
id = "hello"
title = "Hello from plugin"
scope = "both"
shell_name = "galdr-hello"
```

快捷键属于用户配置，不属于插件 manifest。要绑定动作，在 `config.toml` 中写：

```toml
[[keys]]
key = "h"
mods = "ctrl|shift"
action = "plugin:com.example.hello/hello"
```

---

## 工具依赖

插件依赖的可执行工具必须在 `plugin.toml` 中声明。宿主先查找允许的系统工具；找到后复制到插件专属目录。需要下载时，宿主只接受 HTTPS 和校验和，并把最终工具放在用户目录下：

| 平台 | 管理目录 |
| --- | --- |
| Windows | `%USERPROFILE%\.galdr\tools\<插件 ID>\` |
| Linux | `~/.galdr/tools/<插件 ID>/` |

Windows 和 Linux 使用相同的目录模型，不从项目目录或任意系统位置直接执行。沙箱只读暴露当前插件自己的工具目录；插件不能看到其他插件的依赖。

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

- `required = true`：找不到或无法校验时，插件不会启动。
- `required = false`：插件仍可启动，但应在对应功能旁显示明确的不可用原因。
- `source` 必须使用 HTTPS，并提供固定 `sha256`；也可以使用 HTTPS `checksum_source` 配合 `checksum_name`。
- 下载工具需要插件已经获得网络能力。宿主不会根据插件 ID、文件名或 PATH 猜测未声明的工具。
- Rust process 插件用 `galdr_plugin_sdk::plugin_tool_path("工具 ID")` 获取解析后的路径。

Galdr Downloader 会按同样方式管理站点解析器。FFmpeg、Deno、Node 等可选工具只有在 manifest 声明并成功解析后才会暴露给插件。

---

## 声明式 UI

插件返回受大小和深度限制的 UI 树，Galdr 负责字体、焦点、输入法、键盘导航和窗口生命周期。插件不能注入任意窗口代码或直接访问 GPU。

manifest 中先声明入口和位置：

```toml
[[contributions.ui]]
id = "downloads"
slot = "page"
title = "Downloads"
```

常用 slot 包括完整内容页 `page`、弹出层 `modal_window` / `modal_pane`、左右面板、设置页、状态栏和终端 overlay。完整页面应以 `surface` 为根，并声明 `presentation = "page"`，这样宿主能统一处理页面标题、返回动作和关闭行为：

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

UI 节点可使用文本、图标、徽章、按钮、输入框、开关、选择框、图片、进度、列表和布局容器。控件 ID 在整棵树中必须唯一；宿主把激活、输入、切换和选择等操作作为带节点 ID 的 `UiEvent` 发回插件。只有真正的 modal 才应点击遮罩关闭；`page` 和普通面板由宿主导航，不应模拟弹窗生命周期。

长任务应在插件自己的后台 worker 中运行。UI 请求只读取当前状态或提交短操作，再通过 `refresh_interval_ms` 或后续事件刷新，避免占用 supervisor 的请求期限。

---

## 插件开发

插件包根目录必须有 `plugin.toml`，ID 使用反向域名。下面是一个最小 process 插件：

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

`scope` 可以是 `gui`、`shell` 或 `both`。命令始终可以写成 `plugin:com.example.hello/hello`；要绑快捷键，请在用户的 `config.toml` 中写：

```toml
[[keys]]
key = "h"
mods = "ctrl|shift"
action = "plugin:com.example.hello/hello"
```

仓库里的 `galdr-plugin-api` 定义稳定协议，`galdr-plugin-sdk` 提供 process JSON framing、Wasm WIT 和 native v1 vtable。示例插件可以这样构建和打包：

```bash
cargo build --release --manifest-path examples/plugins/hello-process/Cargo.toml
mkdir -p /tmp/galdr-hello/bin
cp examples/plugins/hello-process/target/release/galdr-hello-plugin /tmp/galdr-hello/bin/hello
cp examples/plugins/hello-process/plugin.toml /tmp/galdr-hello/plugin.toml
(cd /tmp/galdr-hello && zip -r ../galdr-hello.zip .)
galdr plugin install /tmp/galdr-hello.zip --grant ui --grant shell_state
```

Shell 调用只有在成功、非超时且不是子 Shell 时才可能修改父 Shell；完整 patch 会先整体校验。长任务不要占住 supervisor 请求期限，应放到插件自己的后台 worker，并把进度通过后续请求或声明式 UI 返回。

---

## 插件排错

先运行 `galdr plugin inspect ID`，确认平台入口、启用状态以及 requested / granted 能力，再按下面定位：

| 现象 | 检查与处理 |
| --- | --- |
| 安装后找不到命令 | 确认插件已启用、当前平台有 entrypoint；重新打开命令面板或新开 Shell 会话 |
| 提示缺少能力 | 对照 requested / granted，只用 `galdr plugin grant ID CAPABILITY` 授予当前功能所需的最小集合 |
| Linux process 插件拒绝启动 | 确认 `bwrap` 可执行；Galdr 不会在严格沙箱缺失时降级裸跑 |
| 工具不可用 | 检查 `tools` 是否声明当前 `os` / `arch`、是否有网络权限，以及下载源和校验和是否匹配 |
| Downloader 无法解析视频网站 | 先确认 `site-extractor` 已解析；合并音视频还需要可用的 `media-converter`，再查看插件返回的具体错误 |
| UI 可以打开但不刷新 | 不要让 invoke / UI 事件执行长下载；把任务放入后台 worker，并返回可轮询的状态 |
| 连续崩溃后无响应 | 60 秒内三次失败会停用本次会话；检查插件日志、包版本和工具后重启 Galdr |
| 插件更新后提示重启 | `requires_restart = true`、插件宿主与新核心版本不一致，或热重载后无法确认实际运行版本时需要重启；重启后市场页的 Installed 版本应与最新兼容版本一致 |

卸载并重装会删除插件私有数据；需要保留任务或设置时，先使用 `galdr plugin uninstall ID --keep-data`。不要手工移动 `~/.galdr/tools` 或插件状态文件来修复安装，交给插件管理器重新解析和校验。

---

## 插件发布

每个第一方插件目录包含经过校验的 `plugin.toml` 和描述可复现平台包的 `publish.toml`。受保护的发布工作流会：

1. 构建并测试发生变化的插件；
2. 创建不可变的 `plugin-<id>-v<version>` Release；
3. 上传后重新下载每个包并核对 SHA-256；
4. 合并 `plugins/index.json` 和网站使用的 `plugins/metadata.json`。

同一版本对应的包不可替换。发布新二进制前，同时提升 `plugin.toml` 与插件 crate 的版本。社区索引应使用相同的 schema 1、HTTPS 与每包 SHA-256 约束；用户再通过 `--marketplace` 明确选择。

---

## 故障排除

| 现象 | 处理 |
| --- | --- |
| `galdr: command not found` | `source ~/.galdr/env`，或把 `~/.galdr/bin` 加进 PATH |
| 安装 HTTP 404 | 该版本还没有发布资产。看本站首页或 [更新记录](./CHANGELOG.md) |
| Linux 黑屏 / 立刻退出 | 检查 Vulkan 驱动；`wgpu` 需要可用的 GPU 后端 |
| 缺字 / 方框 | 安装 DejaVu Sans Mono、Noto Sans CJK SC、Noto Color Emoji，或改 `[font]` |
| Windows `irm …/install.ps1` 无效 | 改用 `irm …/install.txt \| iex` |
| 更新后界面仍显示旧版本 | 重启已打开的 Galdr 窗口和 shell；Linux 用 `command -v galdr`、Windows 用 `Get-Command galdr` 确认 PATH 不是另一份安装 |
| Linux 应用菜单没有 Galdr | 再跑一次安装器，或注销后重开；确认 `~/.local/share/applications/galdr.desktop` 存在 |
| 文件夹右键没有「打开 Galdr」 | GNOME：`sudo apt install python3-nautilus && nautilus -q`（没装绑定只有「脚本」子菜单）。Windows 11：在「显示更多选项」里 |
| 想用系统 bash | `[shell] kind = "system"`，不要指望默认会读 `.bashrc` |
| `include bashrc` 没生效 | 写在 `~/.config/galdr/galdrc`，然后**新开标签**。交互里也要用 `include`，不要 `source ~/.bashrc` |
| 改了 `config.toml` 没反应 / 状态栏报错 | 语法错了会继续用上一份好配置。修好后切回窗口就会重载 |
| 插件已安装但命令提示缺少能力 | `galdr plugin inspect ID` 对照 requested / granted，再用 `galdr plugin grant ID CAPABILITY` 授予需要的最小权限 |
| Linux process 插件无法启动 | 安装并确认 `bwrap`（Bubblewrap）可执行；Galdr 不会在缺少严格沙箱时降级裸跑插件 |
| 插件连续崩溃后不再响应 | 该插件在 60 秒内失败三次，已对本次会话停用。检查插件日志或版本后重启 Galdr |
