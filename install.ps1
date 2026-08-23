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
if ($Repo -notmatch '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$') {
    throw "invalid GALDR_GITHUB '$Repo' (want owner/repository)"
}
if ($Tag -ne "latest" -and $Tag -notmatch '^v[0-9]+\.[0-9]+\.[0-9]+(?:[-+][0-9A-Za-z.-]+)?$') {
    throw "invalid GALDR_TAG '$Tag' (want latest|now|vX.Y.Z)"
}

function Resolve-GaldrInstallPaths([string]$Prefix, [string]$BinDir) {
    if (-not $env:USERPROFILE) { throw "USERPROFILE is not set" }
    if ($Prefix -match '[\r\n]' -or $BinDir -match '[\r\n]') {
        throw "PREFIX and BIN_DIR must not contain newlines"
    }
    $separators = [char[]]@('\', '/')
    $prefixFull = [IO.Path]::GetFullPath($Prefix).TrimEnd($separators)
    $binFull = [IO.Path]::GetFullPath($BinDir).TrimEnd($separators)
    $homeFull = [IO.Path]::GetFullPath($env:USERPROFILE).TrimEnd($separators)
    $root = [IO.Path]::GetPathRoot($prefixFull).TrimEnd($separators)
    if ([string]::Equals($prefixFull, $root, [StringComparison]::OrdinalIgnoreCase) -or
        [string]::Equals($prefixFull, $homeFull, [StringComparison]::OrdinalIgnoreCase)) {
        throw "unsafe PREFIX '$prefixFull'; use a dedicated install directory"
    }
    $prefixWithSeparator = $prefixFull + [IO.Path]::DirectorySeparatorChar
    if (-not [string]::Equals($binFull, $prefixFull, [StringComparison]::OrdinalIgnoreCase) -and
        -not $binFull.StartsWith($prefixWithSeparator, [StringComparison]::OrdinalIgnoreCase)) {
        throw "BIN_DIR must be inside PREFIX so uninstall remains safe"
    }
    return @($prefixFull, $binFull)
}

$InstallPaths = Resolve-GaldrInstallPaths $Prefix $BinDir
$Prefix = $InstallPaths[0]
$BinDir = $InstallPaths[1]

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
    if (Test-Path -LiteralPath $Dest -PathType Container) {
        throw "Install target is a directory: $Dest"
    }
    if (Test-Path -LiteralPath $bak -PathType Container) {
        throw "Backup target is a directory: $bak"
    }
    if (Test-Path -LiteralPath $bak) {
        Remove-Item -LiteralPath $bak -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path -LiteralPath $Dest) {
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

function Invoke-GaldrBinary([string]$Path, [string]$Arguments) {
    $info = New-Object System.Diagnostics.ProcessStartInfo
    $info.FileName = $Path
    $info.Arguments = $Arguments
    $info.UseShellExecute = $false
    $info.RedirectStandardOutput = $true
    $info.RedirectStandardError = $true
    $info.CreateNoWindow = $true
    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $info
    try {
        if (-not $process.Start()) {
            throw "process did not start"
        }
        $stdout = $process.StandardOutput.ReadToEnd()
        $stderr = $process.StandardError.ReadToEnd()
        $process.WaitForExit()
        $exitCode = $process.ExitCode
    } catch {
        throw "$Path $Arguments failed: $($_.Exception.Message)"
    } finally {
        $process.Dispose()
    }
    return [pscustomobject]@{
        ExitCode = $exitCode
        Stdout = $stdout
        Stderr = $stderr
    }
}

function Get-GaldrBinaryVersion([string]$Path, [string]$Program) {
    $result = Invoke-GaldrBinary $Path "--version"
    $line = ($result.Stdout -split '\r?\n' | Select-Object -First 1)
    if ($result.ExitCode -ne 0 -or -not $line) {
        $detail = ([string]$result.Stderr).Trim()
        if ($detail) {
            throw "$Path --version failed (exit $($result.ExitCode)): $detail"
        }
        throw "$Path --version failed (exit $($result.ExitCode))"
    }
    $pattern = '^' + [regex]::Escape($Program) + '\s+v?([^\s]+)\s*$'
    $match = [regex]::Match([string]$line, $pattern)
    if (-not $match.Success) {
        throw "$Path returned an invalid version: $line"
    }
    return $match.Groups[1].Value
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
    $prefixB64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($Prefix))
    $binDirB64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($BinDir))
    $startLnkB64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($startLnk))
    $script = @"
# Generated by the Galdr installer.
`$ErrorActionPreference = "Stop"
`$Prefix = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("$prefixB64"))
`$BinDir = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("$binDirB64"))
`$startLnk = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("$startLnkB64"))
`$separators = [char[]]@('\', '/')
`$actualPrefix = [IO.Path]::GetFullPath((Split-Path -Parent `$MyInvocation.MyCommand.Path)).TrimEnd(`$separators)
if (-not [string]::Equals(`$actualPrefix, `$Prefix, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to uninstall from unexpected path: `$actualPrefix"
}
`$marker = Join-Path `$Prefix ".galdr-install-root"
if (-not (Test-Path -LiteralPath `$marker) -or
    (Get-Content -LiteralPath `$marker -Raw).Trim() -ne "galdr-install-v1") {
    throw "Refusing to remove an unmarked install root: `$Prefix"
}
`$keys = @(
    "HKCU:\Software\Classes\Directory\shell\Galdr",
    "HKCU:\Software\Classes\Directory\Background\shell\Galdr",
    "HKCU:\Software\Classes\Drive\shell\Galdr",
    "HKCU:\Software\Classes\DesktopBackground\Shell\Galdr",
    "HKCU:\Software\Classes\LibraryFolder\shell\Galdr",
    "HKCU:\Software\Classes\LibraryFolder\Background\shell\Galdr"
)
foreach (`$key in `$keys) {
    if (Test-Path -LiteralPath `$key) {
        Remove-Item -LiteralPath `$key -Recurse -Force -ErrorAction SilentlyContinue
    }
}
Remove-Item -LiteralPath `$startLnk -Force -ErrorAction SilentlyContinue
`$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if (`$userPath) {
    `$parts = `$userPath -split ';' | Where-Object { `$_ -and (`$_ -ine `$BinDir) }
    [Environment]::SetEnvironmentVariable("Path", (`$parts -join ';'), "User")
}
`$files = @(
    (Join-Path `$BinDir "galdr.exe"),
    (Join-Path `$BinDir "galdr.exe.bak"),
    (Join-Path `$BinDir "galdr-sh.exe"),
    (Join-Path `$BinDir "galdr-sh.exe.bak"),
    (Join-Path `$Prefix "galdr.ico"),
    `$marker,
    (Join-Path `$Prefix "uninstall.ps1")
)
foreach (`$file in `$files) {
    Remove-Item -LiteralPath `$file -Force -ErrorAction SilentlyContinue
}
if (-not [string]::Equals(`$BinDir, `$Prefix, [StringComparison]::OrdinalIgnoreCase)) {
    Remove-Item -LiteralPath `$BinDir -Force -ErrorAction SilentlyContinue
}
Remove-Item -LiteralPath `$Prefix -Force -ErrorAction SilentlyContinue
if (Test-Path -LiteralPath `$Prefix) {
    Write-Host "Removed Galdr files; kept non-Galdr files in `$Prefix"
} else {
    Write-Host "Removed `$Prefix"
}
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
$ShDest = Join-Path $BinDir "galdr-sh.exe"
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
    $DownloadedVersion = $null
    $Bin = $null
    $ShBin = $null
    foreach ($c in $Candidates) {
        $Expect = Get-GaldrChecksum $SumLines $c
        if (-not $Expect) { continue }
        $candidateBin = Join-Path $Tmp $c
        $candidateShAsset = $c -replace '^galdr-','galdr-sh-'
        $candidateShExpect = Get-GaldrChecksum $SumLines $candidateShAsset
        if (-not $candidateShExpect) {
            throw "SHA256SUMS has no entry for required Windows shell helper $candidateShAsset"
        }
        Write-Host "  checking $c"
        Get-GaldrRemoteFile "$Base/$c" $candidateBin
        $candidateGot = (Get-FileHash -Algorithm SHA256 -Path $candidateBin).Hash.ToLowerInvariant()
        if ($candidateGot -ne $Expect.ToLowerInvariant()) {
            throw "SHA256 mismatch for ${c}: got $candidateGot expected $Expect"
        }
        $candidateShBin = Join-Path $Tmp $candidateShAsset
        Get-GaldrRemoteFile "$Base/$candidateShAsset" $candidateShBin
        $candidateShGot = (Get-FileHash -Algorithm SHA256 -Path $candidateShBin).Hash.ToLowerInvariant()
        if ($candidateShGot -ne $candidateShExpect.ToLowerInvariant()) {
            throw "SHA256 mismatch for ${candidateShAsset}: got $candidateShGot expected $candidateShExpect"
        }
        try { Unblock-File -LiteralPath $candidateBin -ErrorAction SilentlyContinue } catch { }
        try { Unblock-File -LiteralPath $candidateShBin -ErrorAction SilentlyContinue } catch { }
        try {
            $candidateVersion = Get-GaldrBinaryVersion $candidateBin "galdr"
            $candidateShVersion = Get-GaldrBinaryVersion $candidateShBin "galdr-sh"
            if ($candidateShVersion -ne $candidateVersion) {
                throw "$candidateShAsset version $candidateShVersion does not match $c version $candidateVersion"
            }
        } catch {
            if ($Kind -eq "arm64" -and $c -eq $Arm64) {
                Write-Host "Native ARM64 package cannot run ($($_.Exception.Message)); trying x64 emulation"
                continue
            }
            throw
        }
        $Asset = $c
        $ShAsset = $candidateShAsset
        $Bin = $candidateBin
        $ShBin = $candidateShBin
        $Got = $candidateGot
        $DownloadedVersion = $candidateVersion
        break
    }
    if (-not $Asset) {
        throw "Release has no runnable Windows build for $Kind — https://github.com/$Repo/releases"
    }
    if ($Kind -eq "arm64" -and $Asset -eq $Fallback) {
        Write-Host "Using the x64 build through Windows emulation"
    }
    Write-Host "  $Asset -> $Dest"
    if ($Tag -ne "latest" -and $DownloadedVersion -ne $Tag.TrimStart('v')) {
        throw "$Asset version $DownloadedVersion does not match requested $Tag"
    }
    if (Test-Path -LiteralPath $ShDest) {
        $OldShVersion = $null
        try { $OldShVersion = Get-GaldrBinaryVersion $ShDest "galdr-sh" } catch { }
        if (-not $OldShVersion -or $OldShVersion -ne $DownloadedVersion) {
            $shown = if ($OldShVersion) { $OldShVersion } else { "unknown" }
            Write-Host "Replacing old galdr-sh $shown at $ShDest"
        }
    }

    Install-GaldrBinary $Bin $Dest
    try {
        Install-GaldrShellHelper $ShBin $BinDir
    } catch {
        Restore-GaldrBinary $Dest
        throw
    }
} finally {
    Remove-Item $Tmp -Recurse -Force -ErrorAction SilentlyContinue
}

$Ran = $false
try {
    $helpResult = Invoke-GaldrBinary $Dest "--help"
    if ($helpResult.ExitCode -eq 0) { $Ran = $true }
} catch { }
if (-not $Ran) {
    Restore-GaldrBinary $ShDest
    Restore-GaldrBinary $Dest
    throw "Downloaded binary did not run: $Dest --help"
}
$Ver = $null
$ShVer = $null
try {
    $Ver = Get-GaldrBinaryVersion $Dest "galdr"
    $ShVer = Get-GaldrBinaryVersion $ShDest "galdr-sh"
} catch {
    Restore-GaldrBinary $ShDest
    Restore-GaldrBinary $Dest
    throw
}
if ($ShVer -ne $Ver) {
    Restore-GaldrBinary $ShDest
    Restore-GaldrBinary $Dest
    throw "$ShDest version $ShVer does not match $Dest version $Ver"
}
if ($Tag -ne "latest") {
    $ExpectedVersion = $Tag.TrimStart('v')
    if ($Ver -ne $ExpectedVersion) {
        Restore-GaldrBinary $ShDest
        Restore-GaldrBinary $Dest
        throw "$Dest --version is '$Ver', expected $ExpectedVersion"
    }
}
Remove-Item -LiteralPath "$Dest.bak" -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath "$ShDest.bak" -Force -ErrorAction SilentlyContinue

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if (-not $userPath) { $userPath = "" }
$onPath = $userPath -split ';' | Where-Object { $_ -and ($_ -ieq $BinDir) }
if (-not $onPath) {
    [Environment]::SetEnvironmentVariable("Path", "$BinDir;$userPath", "User")
    $env:Path = "$BinDir;$env:Path"
    Write-Host "Added to user PATH: $BinDir"
}

Write-Host "Installation complete."
Write-Host "  version  $Ver"
Write-Host "  binary   $Dest"
Write-Host "  shell    $ShDest"
if ($Got) { Write-Host "  sha256   $Got" }
Write-Host ""
$Icon = $null
if (-not $env:GALDR_NO_CONTEXT_MENU -or -not $env:GALDR_NO_START_MENU) {
    try { $Icon = Install-GaldrIcon $Prefix } catch {
        Write-Host "Warning: could not write integration icon: $($_.Exception.Message)"
    }
}
try { Install-GaldrContextMenu $Dest $Icon } catch {
    Write-Host "Warning: could not add Explorer context menu: $($_.Exception.Message)"
}
try { Install-GaldrStartMenu $Dest $Icon } catch {
    Write-Host "Warning: could not add Start menu shortcut: $($_.Exception.Message)"
}
Set-Content -LiteralPath (Join-Path $Prefix ".galdr-install-root") -Value "galdr-install-v1" -Encoding ASCII -NoNewline
try { Install-GaldrUninstallScript $Prefix $BinDir } catch {
    Write-Host "Warning: could not write uninstall helper: $($_.Exception.Message)"
}
Show-GaldrPathConflict $Dest
Write-Host "  galdr"
Write-Host "  galdr --version"
if (-not $env:GALDR_NO_START_MENU) { Write-Host "  Start menu: Galdr" }
if (-not $env:GALDR_NO_CONTEXT_MENU) { Write-Host "  Right-click a folder: Open Galdr here" }
Write-Host "  uninstall $Prefix\uninstall.ps1"
Write-Host ""
