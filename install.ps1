# Galdr Windows installer.
#   irm https://term.noxcaw.com/install.txt | iex
#   iex ((New-Object Net.WebClient).DownloadString('https://term.noxcaw.com/install.ps1'))
# Env: GALDR_TAG  GALDR_GITHUB  PREFIX  BIN_DIR  GH_TOKEN  GALDR_GITHUB_TOKEN
#      GALDR_NO_CONTEXT_MENU  GALDR_NO_START_MENU
# Do not `exit` — this file is meant to run via iex in an interactive shell.
$ErrorActionPreference = "Stop"
try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
} catch { }

$Repo = if ($env:GALDR_GITHUB) { $env:GALDR_GITHUB } else { "noxrick91/galdr-hub" }
$Prefix = if ($env:PREFIX) { $env:PREFIX } else { Join-Path $env:USERPROFILE ".galdr" }
$BinDir = if ($env:BIN_DIR) { $env:BIN_DIR } else { Join-Path $Prefix "bin" }
$Tag = if ($env:GALDR_TAG) { $env:GALDR_TAG } else { "latest" }
if ($Tag -eq "now") { $Tag = "latest" }
if ($Tag -match '^[0-9]') { $Tag = "v$Tag" }

function Get-GaldrWindowsKind {
    $names = @()
    try {
        $names += [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture.ToString()
    } catch { }
    $names += $env:PROCESSOR_ARCHITECTURE
    $names += $env:PROCESSOR_ARCHITEW6432
    foreach ($raw in $names) {
        if (-not $raw) { continue }
        switch -Regex ($raw) {
            '^(X64|AMD64|x64)$' { return "x64" }
            '^(Arm64|ARM64|aarch64)$' { return "arm64" }
        }
    }
    return ($names | Where-Object { $_ } | Select-Object -First 1)
}

function Get-GaldrRemoteFile([string]$Url, [string]$OutFile) {
    $wc = New-Object Net.WebClient
    try {
        try {
            $wc.Proxy = [Net.WebRequest]::DefaultWebProxy
            if ($wc.Proxy) {
                $wc.Proxy.Credentials = [Net.CredentialCache]::DefaultCredentials
            }
        } catch { }
        $wc.Headers.Add("User-Agent", "galdr-installer")
        $token = $env:GALDR_GITHUB_TOKEN
        if (-not $token) { $token = $env:GH_TOKEN }
        if ($token) { $wc.Headers.Add("Authorization", "Bearer $token") }
        $wc.DownloadFile($Url, $OutFile)
    } catch [System.Net.WebException] {
        $resp = $_.Exception.Response
        $code = 0
        if ($resp) { $code = [int]$resp.StatusCode }
        if ($code -eq 404) {
            throw "not found: $Url`n  no public Release yet — https://github.com/$Repo/releases"
        }
        if ($code -eq 403 -or $code -eq 429) {
            throw "GitHub HTTP $code. Set GH_TOKEN or GALDR_GITHUB_TOKEN and retry."
        }
        if ($code -gt 0) {
            throw "HTTP $code for $Url"
        }
        throw
    } finally {
        $wc.Dispose()
    }
}

function Install-GaldrBinary([string]$Src, [string]$Dest) {
    $bak = "$Dest.bak"
    if (Test-Path -LiteralPath $Dest) {
        if (Test-Path -LiteralPath $bak) {
            Remove-Item -LiteralPath $bak -Force -ErrorAction SilentlyContinue
        }
        try {
            Move-Item -LiteralPath $Dest -Destination $bak -Force
        } catch {
            throw "Cannot replace $Dest. Close every Galdr window and retry."
        }
    }
    try {
        Copy-Item -LiteralPath $Src -Destination $Dest -Force
    } catch {
        if (Test-Path -LiteralPath $bak) {
            Move-Item -LiteralPath $bak -Destination $Dest -Force -ErrorAction SilentlyContinue
        }
        throw
    }
    try { Unblock-File -LiteralPath $Dest -ErrorAction SilentlyContinue } catch { }
}

function Install-GaldrShellHelper([string]$Src, [string]$BinDir) {
    if (-not $Src -or -not (Test-Path -LiteralPath $Src)) { return }
    $dest = Join-Path $BinDir "galdr-sh.exe"
    Install-GaldrBinary $Src $dest
    Write-Host "  shell    $dest"
}

function Restore-GaldrBinary([string]$Dest) {
    $bak = "$Dest.bak"
    Remove-Item -LiteralPath $Dest -Force -ErrorAction SilentlyContinue
    if (Test-Path -LiteralPath $bak) {
        Move-Item -LiteralPath $bak -Destination $Dest -Force
    }
}

function Get-GaldrChecksum($Lines, [string]$Asset) {
    $pattern = '^\s*([0-9a-fA-F]{64})\s+\*?' + [regex]::Escape($Asset) + '\s*$'
    foreach ($line in $Lines) {
        $match = [regex]::Match($line, $pattern)
        if ($match.Success) { return $match.Groups[1].Value.ToLowerInvariant() }
    }
    return $null
}

function Get-GaldrHereTitle {
    return "Open Galdr here"
}

function Install-GaldrIcon([string]$Prefix) {
    $ico = Join-Path $Prefix "galdr.ico"
    $b64 = "AAABAAMAEBAAAAEAIACJAAAANgAAACAgAAABACAAmAAAAL8AAAAwMAAAAQAgALoAAABXAQAAiVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAUElEQVR42mNgGGjAiMz5P8PiP0ENGSdQ9DCRohmbOiZKvUCxASzE+JMqLvh/bc7//9fm/KePF7B6SyuFEW86IDYa0cNo4KORidSoIyWK6QMAhy0Yva2RH/oAAAAASUVORK5CYIKJUE5HDQoaCgAAAA1JSERSAAAAIAAAACAIBgAAAHN6evQAAABfSURBVHjaY2AYBQMMGPFJ/p9h8Z8iwzNOMBJSwzTQIcA06KKA0mAnNTpGo2DUASzUzNPDOwSIAf+vzcHIwoxaKYyjiXDUAXRLhIQS3GgUjFbHow4YGolwtFk+CkYcAABQQRX5EgOhkQAAAABJRU5ErkJggolQTkcNChoKAAAADUlIRFIAAAAwAAAAMAgGAAAAVwL5hwAAAIFJREFUeNrt2cENgCAQBVExVmMFFuTBkjxYkBXYDnZgJCgB8uYMCRP+sgSGAUDThLcD477E3xeznSF1ztj6DhCougZK5D63JkSIAAECBLKYSt9d7IAIfUC8jscrSpjXIEIECBAg0G8fSDnnRah2vEqIEAECBAj028hKNzVfTABQnBuEYxYRde+bnQAAAABJRU5ErkJggg=="
    New-Item -ItemType Directory -Force -Path $Prefix | Out-Null
    [IO.File]::WriteAllBytes($ico, [Convert]::FromBase64String($b64))
    return $ico
}

function Install-GaldrContextMenu([string]$Exe, [string]$Icon) {
    if ($env:GALDR_NO_CONTEXT_MENU) { return }
    if (-not (Test-Path -LiteralPath $Exe)) { return }
    $title = Get-GaldrHereTitle
    # "%V." keeps drive roots like C:\ from breaking the quoted argument.
    $launch = "`"$Exe`" --cwd `"%V.`""
    $iconValue = $Exe
    if ($Icon -and (Test-Path -LiteralPath $Icon)) { $iconValue = $Icon }
    $keys = @(
        "HKCU:\Software\Classes\Directory\shell\Galdr",
        "HKCU:\Software\Classes\Directory\Background\shell\Galdr",
        "HKCU:\Software\Classes\Drive\shell\Galdr",
        "HKCU:\Software\Classes\DesktopBackground\Shell\Galdr",
        "HKCU:\Software\Classes\LibraryFolder\shell\Galdr",
        "HKCU:\Software\Classes\LibraryFolder\Background\shell\Galdr"
    )
    foreach ($key in $keys) {
        $rel = $key -replace '^HKCU:\\', ''
        $rk = [Microsoft.Win32.Registry]::CurrentUser.CreateSubKey($rel)
        $rk.SetValue("", $title, [Microsoft.Win32.RegistryValueKind]::String)
        $rk.SetValue("MUIVerb", $title, [Microsoft.Win32.RegistryValueKind]::String)
        $rk.SetValue("Icon", $iconValue, [Microsoft.Win32.RegistryValueKind]::String)
        $rk.SetValue("Position", "Top", [Microsoft.Win32.RegistryValueKind]::String)
        $cmd = $rk.CreateSubKey("command")
        $cmd.SetValue("", $launch, [Microsoft.Win32.RegistryValueKind]::String)
        $cmd.Close()
        $rk.Close()
    }
    Write-Host "Explorer context menu: $title"
}

function Install-GaldrStartMenu([string]$Exe, [string]$Icon) {
    if ($env:GALDR_NO_START_MENU) { return }
    if (-not (Test-Path -LiteralPath $Exe)) { return }
    $dir = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs"
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    $lnkPath = Join-Path $dir "Galdr.lnk"
    $wsh = New-Object -ComObject WScript.Shell
    $lnk = $wsh.CreateShortcut($lnkPath)
    $lnk.TargetPath = $Exe
    $lnk.WorkingDirectory = $env:USERPROFILE
    $lnk.WindowStyle = 1
    $lnk.Description = "Galdr terminal"
    if ($Icon -and (Test-Path -LiteralPath $Icon)) {
        $lnk.IconLocation = $Icon
    } else {
        $lnk.IconLocation = "$Exe,0"
    }
    $lnk.Save()
    Write-Host "Start menu: $lnkPath"
}

function Install-GaldrUninstallScript([string]$Prefix, [string]$BinDir) {
    $path = Join-Path $Prefix "uninstall.ps1"
    $startLnk = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\Galdr.lnk"
    $ico = Join-Path $Prefix "galdr.ico"
    $script = @"
# Generated by the Galdr installer.
`$ErrorActionPreference = "SilentlyContinue"
`$keys = @(
    "HKCU:\Software\Classes\Directory\shell\Galdr",
    "HKCU:\Software\Classes\Directory\Background\shell\Galdr",
    "HKCU:\Software\Classes\Drive\shell\Galdr",
    "HKCU:\Software\Classes\DesktopBackground\Shell\Galdr",
    "HKCU:\Software\Classes\LibraryFolder\shell\Galdr",
    "HKCU:\Software\Classes\LibraryFolder\Background\shell\Galdr"
)
foreach (`$key in `$keys) {
    if (Test-Path -LiteralPath `$key) { Remove-Item -LiteralPath `$key -Recurse -Force }
}
if (Test-Path -LiteralPath "$startLnk") { Remove-Item -LiteralPath "$startLnk" -Force }
`$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if (`$userPath) {
    `$parts = `$userPath -split ';' | Where-Object { `$_ -and (`$_ -ine "$BinDir") }
    [Environment]::SetEnvironmentVariable("Path", (`$parts -join ';'), "User")
}
Remove-Item -LiteralPath "$ico" -Force
Remove-Item -Recurse -Force "$Prefix"
Write-Host "Removed $Prefix"
Write-Host "Config in ~/.config/galdr/ was left in place."
"@
    Set-Content -LiteralPath $path -Value $script -Encoding UTF8
}

function Show-GaldrPathConflict([string]$Dest) {
    $cmd = Get-Command galdr -ErrorAction SilentlyContinue
    if (-not $cmd) { $cmd = Get-Command galdr.exe -ErrorAction SilentlyContinue }
    if (-not $cmd -or -not $cmd.Source) { return }
    if ([string]::Equals($cmd.Source, $Dest, [StringComparison]::OrdinalIgnoreCase)) { return }
    Write-Host "Warning: PATH 'galdr' is $($cmd.Source)"
    Write-Host "         installer wrote $Dest"
    Write-Host "         Open a new terminal, or run: & '$Dest' --version"
}

$Kind = Get-GaldrWindowsKind
$Fallback = "galdr-x86_64-pc-windows-gnu.exe"
$Arm64 = "galdr-aarch64-pc-windows-msvc.exe"
switch ($Kind) {
    "x64" { $Candidates = @($Fallback) }
    "arm64" {
        $Candidates = @($Arm64, $Fallback)
    }
    default {
        throw "unsupported Windows architecture $Kind (need x64 or arm64)"
    }
}

$Dest = Join-Path $BinDir "galdr.exe"
if ($Tag -eq "latest") {
    $Base = "https://github.com/$Repo/releases/latest/download"
} else {
    $Base = "https://github.com/$Repo/releases/download/$Tag"
}

Write-Host ""
Write-Host "Galdr installer"
Write-Host "  Windows $Kind"

New-Item -ItemType Directory -Force -Path $BinDir | Out-Null

$Tmp = Join-Path $env:TEMP ("galdr-install-" + [guid]::NewGuid())
New-Item -ItemType Directory -Force -Path $Tmp | Out-Null
$Got = ""
try {
    $Sums = Join-Path $Tmp "SHA256SUMS"
    Get-GaldrRemoteFile "$Base/SHA256SUMS" $Sums
    $SumLines = Get-Content -LiteralPath $Sums | ForEach-Object { $_.TrimEnd("`r") }
    $Asset = $null
    foreach ($c in $Candidates) {
        if (Get-GaldrChecksum $SumLines $c) {
            $Asset = $c
            break
        }
    }
    if (-not $Asset) {
        throw "SHA256SUMS has no Windows build for $Kind — https://github.com/$Repo/releases"
    }
    if ($Kind -eq "arm64" -and $Asset -eq $Fallback) {
        Write-Host "Using the x64 build through Windows emulation"
    }
    Write-Host "  $Asset -> $Dest"
    $Bin = Join-Path $Tmp $Asset
    Get-GaldrRemoteFile "$Base/$Asset" $Bin
    $Expect = Get-GaldrChecksum $SumLines $Asset
    if (-not $Expect) { throw "SHA256SUMS has no entry for $Asset" }
    $Got = (Get-FileHash -Algorithm SHA256 -Path $Bin).Hash.ToLowerInvariant()
    if ($Got -ne $Expect.ToLowerInvariant()) {
        throw "SHA256 mismatch: got $Got expected $Expect"
    }
    Install-GaldrBinary $Bin $Dest
    $ShAsset = $Asset -replace '^galdr-','galdr-sh-'
    $ShExpect = Get-GaldrChecksum $SumLines $ShAsset
    if ($ShExpect) {
        $ShBin = Join-Path $Tmp $ShAsset
        Get-GaldrRemoteFile "$Base/$ShAsset" $ShBin
        $ShGot = (Get-FileHash -Algorithm SHA256 -Path $ShBin).Hash.ToLowerInvariant()
        if ($ShGot -ne $ShExpect.ToLowerInvariant()) {
            throw "SHA256 mismatch: got $ShGot expected $ShExpect"
        }
        Install-GaldrShellHelper $ShBin $BinDir
    } else {
        Write-Host "Warning: $ShAsset is not in this Release; galdr-shell may fail on Windows"
    }
} finally {
    Remove-Item $Tmp -Recurse -Force -ErrorAction SilentlyContinue
}

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if (-not $userPath) { $userPath = "" }
$onPath = $userPath -split ';' | Where-Object { $_ -and ($_ -ieq $BinDir) }
if (-not $onPath) {
    [Environment]::SetEnvironmentVariable("Path", "$BinDir;$userPath", "User")
    $env:Path = "$BinDir;$env:Path"
    Write-Host "Added to user PATH: $BinDir"
}

$Ran = $false
try {
    $null = & $Dest --help 2>$null
    if ($LASTEXITCODE -eq 0) { $Ran = $true }
} catch { }
if (-not $Ran) {
    Restore-GaldrBinary $Dest
    throw "Downloaded binary did not run: $Dest --help"
}
$Ver = ""
try { $Ver = (& $Dest --version 2>$null) } catch { }
if ($Tag -ne "latest" -and $Ver) {
    $ExpectedVersion = $Tag.TrimStart('v')
    $ActualVersion = (($Ver | Select-Object -First 1) -split '\s+' | Select-Object -Last 1).TrimStart('v')
    if ($ActualVersion -ne $ExpectedVersion) {
        Restore-GaldrBinary $Dest
        throw "$Dest --version is '$Ver', expected $ExpectedVersion"
    }
}
Write-Host "Installation complete."
if ($Ver) { Write-Host "  version  $Ver" }
Write-Host "  binary   $Dest"
if ($Got) { Write-Host "  sha256   $Got" }
Write-Host ""
$Icon = $null
try { $Icon = Install-GaldrIcon $Prefix } catch {
    Write-Host "Warning: could not write Start menu icon: $($_.Exception.Message)"
}
try { Install-GaldrContextMenu $Dest $Icon } catch {
    Write-Host "Warning: could not add Explorer context menu: $($_.Exception.Message)"
}
try { Install-GaldrStartMenu $Dest $Icon } catch {
    Write-Host "Warning: could not add Start menu shortcut: $($_.Exception.Message)"
}
try { Install-GaldrUninstallScript $Prefix $BinDir } catch {
    Write-Host "Warning: could not write uninstall helper: $($_.Exception.Message)"
}
Show-GaldrPathConflict $Dest
Write-Host "  galdr"
Write-Host "  galdr --version"
Write-Host "  Start menu: Galdr"
Write-Host "  Right-click a folder: Open Galdr here"
Write-Host "  uninstall $Prefix\uninstall.ps1"
Write-Host ""
