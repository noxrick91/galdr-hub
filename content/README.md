# Galdr 使用手册

Galdr 是 GPU 加速终端。打开就是内置的 **galdr-shell**。启动文件只有 `~/.config/galdr/galdrc`，不会自动读 `.bashrc`。

预编译包从本站 [GitHub Releases](https://github.com/noxrick91/galdr-hub/releases) 装到 `~/.galdr/bin`。源码仓私有，不对外。

### 它做什么

- wgpu 实例化单元格渲染，HiDPI、IME、CJK / emoji 回退字体
- 标签、分屏、搜索、命令面板、主题
- 会话恢复；mux 可分离再附着（Unix socket / Windows named pipe）
- 内置 bash 形 shell：函数、数组、作业控制（Unix）、常用 builtin

### 怎么读这份手册

从 [安装](#/install) 和 [快速开始](#/quick-start) 上手。右上角 **中文 / EN** 切换整本手册；换语言会停在同一页。

---

## What's new

This page lists changes in the **current public release**.

**What's new in v0.1.4** — 2026-08-21

- `galdr --cwd` so a window can start in a chosen folder.
- Installer adds Galdr to the Windows Start menu and Explorer context menu.
- Linux installer adds Galdr to the app menu and folder context menus.

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

不要用 `irm …/install.ps1`：GitHub Pages 把 `.ps1` 标成 `application/octet-stream`，Windows PowerShell 5.1 的 `irm` 读不成脚本。`.txt` 是 `text/plain`。若必须拉 `.ps1`：

```powershell
iex ((New-Object Net.WebClient).DownloadString('https://term.noxcaw.com/install.ps1'))
```

脚本按本机 OS/ARCH 选择资产（Linux x64/arm64、Windows x64/ARM64），下载后核对同 Release 的 `SHA256SUMS`，装到 `~/.galdr/bin`。Windows ARM64 优先安装原生版本；旧版 Release 没有 ARM64 资产时回退到 x64 系统模拟。macOS 预编译包暂不提供。再跑一次安装器会覆盖当前文件（Windows 先把正在用的 exe 改名为 `.bak`）。

安装器**不会**改 `.bashrc` / `.zshrc`。它写入 `~/.galdr/env`。`curl | bash` 也改不了你当前已经打开的 shell，请：

```bash
source ~/.galdr/env
# 或把 ~/.galdr/bin 加进 PATH 后新开终端
```

Pages 尚未生效时可用：

```bash
curl -fsS https://raw.githubusercontent.com/noxrick91/galdr-hub/main/install | bash
```

```powershell
irm https://raw.githubusercontent.com/noxrick91/galdr-hub/main/install.ps1 | iex
```

### 官网 / 手动下载

打开本站首页，按平台下载最新资产，放到 `~/.galdr/bin`（Windows 为 `%USERPROFILE%\.galdr\bin\galdr.exe`），并对照 `SHA256SUMS`。

| 平台 | 资产 |
|------|------|
| Linux x86_64 | `galdr-x86_64-unknown-linux-gnu` |
| Linux aarch64 | `galdr-aarch64-unknown-linux-gnu` |
| Windows x64 | `galdr-x86_64-pc-windows-gnu.exe` |
| Windows ARM64 | `galdr-aarch64-pc-windows-msvc.exe` |

Linux 运行需要可用的 Vulkan（或 wgpu 支持的 GPU 后端），以及字体。默认配置找 DejaVu Sans Mono、Noto Sans CJK SC、Noto Color Emoji。

### 已安装后升级

再跑一次安装器即可，没有单独的 `galdr upgrade` 命令。

### 卸载

```bash
rm -rf ~/.galdr
```

```powershell
Remove-Item -Recurse -Force $HOME\.galdr
```

Windows 再从用户 PATH 去掉 `%USERPROFILE%\.galdr\bin`。配置目录 `~/.config/galdr/` 不会被安装器删除。

### 从源码安装

源码仓不公开。有权限的开发者：

```bash
cargo build --release
./target/release/galdr
```

需要 GPU 栈（`wgpu`：Vulkan / Metal / D3D12）。

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

启动文件只有 `~/.config/galdr/galdrc`。不会自动读 `.bashrc`。要沿用旧习惯，在 `galdrc` 里显式引入：

```sh
include bashrc
include zshrc
include ~/.profile
```

`include bashrc`、`zshrc`、`profile`、`bash_profile`、`zprofile`、`fish` 会找常见家目录路径；文件不存在就跳过。带 `/` 或 `~` 的路径必须存在。导入器会跑 `export`、`alias`、赋值和其它 galdr-shell 命令；bash/zsh 专用行（`setopt`、`bindkey` 等）会被跳过。

诚实限制：Tab 补全不执行 `complete -F`；`case` 没有 `;&` / `;;&`；后台 `&&` / `||` 列表没有真正的 `$!`；Windows 没有 `setpgid` 作业控制。

---

## 快捷键

绑定写在 `config.toml` 的 `[[keys]]`。设置 → Keys 可查看。

| 快捷键 | 动作 |
| --- | --- |
| Ctrl+Shift+C / V | 复制 / 粘贴 |
| Ctrl+Shift+T / W | 新标签 / 关标签 |
| Ctrl+Tab / Ctrl+Shift+Tab | 下一 / 上一标签 |
| Ctrl+Shift+PageUp / PageDown | 移动标签 |
| Ctrl+Shift+D / E | 向下 / 向右分屏 |
| Alt+方向键 | 切换 pane |
| Ctrl+Shift+方向键 | 调整 pane |
| Ctrl+Shift+Z | 放大 / 还原 pane |
| Ctrl+Shift+F | 搜索 |
| Ctrl+Shift+P | 命令面板 |
| F11 | 全屏 |
| Ctrl+= / - / 0 | 字体放大 / 缩小 / 重置 |

Tab 或 Enter 接受补全；Esc / Ctrl+G 关掉补全菜单。空格不接受。

---

## 配置

可选 `~/.config/galdr/config.toml`。零配置默认用 DejaVu Sans Mono、Noto Sans CJK SC、Noto Color Emoji、Catppuccin Mocha。

```toml
[font]
family = "DejaVu Sans Mono"
size = 15.0
line_height = 1.0
fallback = ["Noto Sans CJK SC", "Noto Color Emoji"]

[window]
padding = 8
opacity = 1.0
tab_line_height = 1.5

[theme]
name = "catppuccin-mocha"

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

字体大小是逻辑 pt。Galdr 再乘窗口缩放，在物理像素里栅格化字形。

---

## 界面

- 主题：Catppuccin、Tokyo Night、Gruvbox、One Dark、Solarized
- OSC 0/2 标题，OSC 7 cwd，OSC 8 超链接（Ctrl+点击），OSC 52（默认先确认）
- 选区、剪贴板、滚动条、右键菜单
- WezTerm 风格 quick select 与 vi / copy mode

---

## Mux 与分屏

mux 拥有 pane；窗口只是附着。

```bash
galdr --server                 # 无头 mux，$XDG_RUNTIME_DIR/galdr/mux.sock
galdr --attach                 # GUI 客户端
galdr --socket /tmp/galdr.sock --server
```

`mux.unix_socket = true` 时，普通 GUI 进程也会监听，另一个 `galdr --attach` 可以加入；关窗可以 detach 而不是杀掉 shell。Windows 用 named pipe。

---

## 会话恢复

`[session] restore = true` 时，下次启动会重开上次的窗口 / 标签 / 分屏 / cwd。`restore_mode = "ask"` 会先列出上次前台命令再确认；`wezterm` 则按 WezTerm 的方式恢复。

---

## 故障排除

| 现象 | 处理 |
| --- | --- |
| `galdr: command not found` | `source ~/.galdr/env`，或把 `~/.galdr/bin` 加进 PATH |
| 安装 HTTP 404 | 该 tag 还没有 Release。看 [Releases](https://github.com/noxrick91/galdr-hub/releases) |
| Linux 黑屏 / 立刻退出 | 检查 Vulkan 驱动；`wgpu` 需要可用的 GPU 后端 |
| 缺字 / 方框 | 安装 DejaVu Sans Mono、Noto Sans CJK SC、Noto Color Emoji，或改 `[font]` |
| Windows `irm …/install.ps1` 无效 | 改用 `irm …/install.txt \| iex` |
| Windows 仍是旧版本 | 关掉所有 Galdr 窗口再装一次；`Get-Command galdr` 确认 PATH 不是另一份 exe |
| 想用系统 bash | `[shell] kind = "system"`，不要指望默认会读 `.bashrc` |
