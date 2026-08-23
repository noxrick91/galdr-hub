# Galdr 使用手册

Galdr 是 GPU 加速终端。打开就是内置的 **galdr-shell**。启动文件在 Unix 是 `~/.config/galdr/galdrc`，在 Windows 是 `%APPDATA%\galdr\galdrc`，不会自动读 `.bashrc`。

预编译包装到 `~/.galdr/bin`。从本站首页或下面的安装命令获取。

### 它做什么

- wgpu 实例化单元格渲染，HiDPI、IME、CJK / emoji 回退字体
- 标签（可拖动重排）、分屏、搜索、命令面板、主题
- 会话恢复；mux 可分离再附着（Unix socket / Windows named pipe）
- 内置 bash 形 shell：函数、数组、作业控制（Unix）、常用 builtin

### 怎么读这份手册

从 [安装](#/install) 和 [快速开始](#/quick-start) 上手。右上角 **中文 / EN** 切换整本手册；换语言会停在同一页。

---

## What's new

This page lists changes in the **current public release**.

**What's new in v0.1.16** — 2026-08-24

- Galdr Shell startup diagnostics are now opt-in with `GALDR_STARTUP=1`, so routine sessions reach the prompt without a synchronous PATH self-check.
- Windows no longer launches `galdr-sh.exe --version` before creating every pane. Release installers already validate the GUI/helper version pair, avoiding redundant process startup on the GUI thread.
- The PowerShell installer now explicitly waits for GUI-subsystem executables and captures their output when checking `--version` and `--help`, preventing valid Windows packages from being rejected.

Full history: [CHANGELOG.md](./CHANGELOG.md).

## 安装

### 一键安装

Linux / Git Bash：

```bash
curl -fsS https://term.noxcaw.com/install | bash
```

指定版本：

```bash
curl -fsS https://term.noxcaw.com/install | bash -s -- v0.1.2
# 或
GALDR_TAG=v0.1.2 curl -fsS https://term.noxcaw.com/install | bash
```

Windows PowerShell：

```powershell
irm https://term.noxcaw.com/install.txt | iex
```

不要用 `irm …/install.ps1`：网站把 `.ps1` 标成 `application/octet-stream`，Windows PowerShell 5.1 的 `irm` 读不成脚本。`.txt` 是 `text/plain`。若必须拉 `.ps1`：

```powershell
iex ((New-Object Net.WebClient).DownloadString('https://term.noxcaw.com/install.ps1'))
```

脚本按本机 OS/ARCH 选择资产（Linux x64/arm64、Windows x64/ARM64），下载后核对同 Release 的 `SHA256SUMS`，并在替换旧版本前实际运行版本检查，再装到 `~/.galdr/bin`。Windows ARM64 优先安装原生版本；旧版 Release 缺少 ARM64 资产或原生包因 VC++ 运行库不能启动时，会回退到 x64 系统模拟。macOS 预编译包暂不提供。再跑一次安装器会原子替换当前文件。

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

Windows 安装器还会装同目录的 `galdr-sh-*.exe`（ConPTY 里跑 galdr-shell 的 console 助手）。

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

Tab 或 Enter 接受补全；**Esc**（或 Ctrl+G）关掉补全弹出框。空格不接受。打完或确认完整命令名后，菜单会列出参数 / 子命令；回车仍执行当前命令。补全使用 shell 的 `PATH`（`include bashrc` 之后加进来的工具也能对上），并跟别名、变量和 git 分支；子串 / 缩写也能对上（例如 `cko` → checkout）。Home / End 跳到菜单首尾。`complete -F fn` 会跑函数（`COMP_WORDS` / `COMP_CWORD` / `COMPREPLY`）；`complete -C cmd` 会跑外部补全器（`COMP_LINE` / `COMP_POINT`）。按键时不会每次都阻塞去跑它们。

交互里 Ctrl+Z 会停住前台作业并打印 `[n]+  Stopped  命令`，再用 `fg` / `bg` / `jobs` 管理。

---

## 配置

可选 `~/.config/galdr/config.toml`。没有这份文件也能启动；首次运行会写入一份示例。零配置主题是 `galdr-dark`。Windows 默认 Cascadia Mono + 微软雅黑 / Segoe UI Emoji；Linux / macOS 默认 DejaVu Sans Mono + Noto Sans CJK SC / Noto Color Emoji。`system_fallback = true` 还会追加内置 CJK / emoji / mono 列表。

改完文件后切回窗口，或等不到半秒会自动重载。`Ctrl+,` 打开设置（外观 / 终端 / Mux / 快捷键）；字体、主题、光标、`TERM`、启动行列等会写回同一份文件。快捷键只能在 `[[keys]]` 里改。

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

## 故障排除

| 现象 | 处理 |
| --- | --- |
| `galdr: command not found` | `source ~/.galdr/env`，或把 `~/.galdr/bin` 加进 PATH |
| 安装 HTTP 404 | 该版本还没有发布资产。看本站首页或 [更新记录](./CHANGELOG.md) |
| Linux 黑屏 / 立刻退出 | 检查 Vulkan 驱动；`wgpu` 需要可用的 GPU 后端 |
| 缺字 / 方框 | 安装 DejaVu Sans Mono、Noto Sans CJK SC、Noto Color Emoji，或改 `[font]` |
| Windows `irm …/install.ps1` 无效 | 改用 `irm …/install.txt \| iex` |
| Windows 仍是旧版本 | 关掉所有 Galdr 窗口再装一次；`Get-Command galdr` 确认 PATH 不是另一份 exe |
| Linux 应用菜单没有 Galdr | 再跑一次安装器，或注销后重开；确认 `~/.local/share/applications/galdr.desktop` 存在 |
| 文件夹右键没有「打开 Galdr」 | GNOME：`sudo apt install python3-nautilus && nautilus -q`（没装绑定只有「脚本」子菜单）。Windows 11：在「显示更多选项」里 |
| 想用系统 bash | `[shell] kind = "system"`，不要指望默认会读 `.bashrc` |
| `include bashrc` 没生效 | 写在 `~/.config/galdr/galdrc`，然后**新开标签**。交互里也要用 `include`，不要 `source ~/.bashrc` |
| 改了 `config.toml` 没反应 / 状态栏报错 | 语法错了会继续用上一份好配置。修好后切回窗口就会重载 |
