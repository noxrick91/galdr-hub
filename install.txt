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
    $b64 = "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"
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
    (Join-Path `$BinDir "galdr-plugin-host.exe"),
    (Join-Path `$BinDir "galdr-plugin-host.exe.bak"),
    (Join-Path `$BinDir "galdr-plugin.exe"),
    (Join-Path `$BinDir "galdr-plugin.exe.bak"),
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
$HostDest = Join-Path $BinDir "galdr-plugin-host.exe"
$PluginDest = Join-Path $BinDir "galdr-plugin.exe"
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
    $HostBin = $null
    $PluginBin = $null
    foreach ($c in $Candidates) {
        $Expect = Get-GaldrChecksum $SumLines $c
        if (-not $Expect) { continue }
        $candidateBin = Join-Path $Tmp $c
        $candidateShAsset = $c -replace '^galdr-','galdr-sh-'
        $candidateHostAsset = $c -replace '^galdr-','galdr-plugin-host-'
        $candidatePluginAsset = $c -replace '^galdr-','galdr-plugin-'
        $candidateShExpect = Get-GaldrChecksum $SumLines $candidateShAsset
        $candidateHostExpect = Get-GaldrChecksum $SumLines $candidateHostAsset
        $candidatePluginExpect = Get-GaldrChecksum $SumLines $candidatePluginAsset
        if (-not $candidateShExpect) {
            throw "SHA256SUMS has no entry for required Windows shell helper $candidateShAsset"
        }
        if (-not $candidateHostExpect) {
            throw "SHA256SUMS has no entry for required plugin binary $candidateHostAsset"
        }
        if (-not $candidatePluginExpect) {
            throw "SHA256SUMS has no entry for required plugin binary $candidatePluginAsset"
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
        $candidateHostBin = Join-Path $Tmp $candidateHostAsset
        Get-GaldrRemoteFile "$Base/$candidateHostAsset" $candidateHostBin
        $candidateHostGot = (Get-FileHash -Algorithm SHA256 -Path $candidateHostBin).Hash.ToLowerInvariant()
        if ($candidateHostGot -ne $candidateHostExpect.ToLowerInvariant()) {
            throw "SHA256 mismatch for ${candidateHostAsset}: got $candidateHostGot expected $candidateHostExpect"
        }
        $candidatePluginBin = Join-Path $Tmp $candidatePluginAsset
        Get-GaldrRemoteFile "$Base/$candidatePluginAsset" $candidatePluginBin
        $candidatePluginGot = (Get-FileHash -Algorithm SHA256 -Path $candidatePluginBin).Hash.ToLowerInvariant()
        if ($candidatePluginGot -ne $candidatePluginExpect.ToLowerInvariant()) {
            throw "SHA256 mismatch for ${candidatePluginAsset}: got $candidatePluginGot expected $candidatePluginExpect"
        }
        try { Unblock-File -LiteralPath $candidateBin -ErrorAction SilentlyContinue } catch { }
        try { Unblock-File -LiteralPath $candidateShBin -ErrorAction SilentlyContinue } catch { }
        try { Unblock-File -LiteralPath $candidateHostBin -ErrorAction SilentlyContinue } catch { }
        try { Unblock-File -LiteralPath $candidatePluginBin -ErrorAction SilentlyContinue } catch { }
        try {
            $candidateVersion = Get-GaldrBinaryVersion $candidateBin "galdr"
            $candidateShVersion = Get-GaldrBinaryVersion $candidateShBin "galdr-sh"
            $candidateHostVersion = Get-GaldrBinaryVersion $candidateHostBin "galdr-plugin-host"
            $candidatePluginVersion = Get-GaldrBinaryVersion $candidatePluginBin "galdr-plugin"
            if ($candidateShVersion -ne $candidateVersion) {
                throw "$candidateShAsset version $candidateShVersion does not match $c version $candidateVersion"
            }
            if ($candidateHostVersion -ne $candidateVersion -or $candidatePluginVersion -ne $candidateVersion) {
                throw "plugin binary versions do not match $c version $candidateVersion"
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
        $HostBin = $candidateHostBin
        $PluginBin = $candidatePluginBin
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

    $InstalledDests = @()
    try {
        Install-GaldrBinary $Bin $Dest
        $InstalledDests += $Dest
        Install-GaldrShellHelper $ShBin $BinDir
        $InstalledDests += $ShDest
        Install-GaldrBinary $HostBin $HostDest
        $InstalledDests += $HostDest
        Install-GaldrBinary $PluginBin $PluginDest
        $InstalledDests += $PluginDest
    } catch {
        for ($i = $InstalledDests.Count - 1; $i -ge 0; $i--) {
            Restore-GaldrBinary $InstalledDests[$i]
        }
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
    Restore-GaldrBinary $PluginDest
    Restore-GaldrBinary $HostDest
    Restore-GaldrBinary $ShDest
    Restore-GaldrBinary $Dest
    throw "Downloaded binary did not run: $Dest --help"
}
$Ver = $null
$ShVer = $null
$HostVer = $null
$PluginVer = $null
try {
    $Ver = Get-GaldrBinaryVersion $Dest "galdr"
    $ShVer = Get-GaldrBinaryVersion $ShDest "galdr-sh"
    $HostVer = Get-GaldrBinaryVersion $HostDest "galdr-plugin-host"
    $PluginVer = Get-GaldrBinaryVersion $PluginDest "galdr-plugin"
} catch {
    Restore-GaldrBinary $PluginDest
    Restore-GaldrBinary $HostDest
    Restore-GaldrBinary $ShDest
    Restore-GaldrBinary $Dest
    throw
}
if ($ShVer -ne $Ver -or $HostVer -ne $Ver -or $PluginVer -ne $Ver) {
    Restore-GaldrBinary $PluginDest
    Restore-GaldrBinary $HostDest
    Restore-GaldrBinary $ShDest
    Restore-GaldrBinary $Dest
    throw "installed helper and plugin binary versions do not match $Dest version $Ver"
}
if ($Tag -ne "latest") {
    $ExpectedVersion = $Tag.TrimStart('v')
    if ($Ver -ne $ExpectedVersion) {
        Restore-GaldrBinary $PluginDest
        Restore-GaldrBinary $HostDest
        Restore-GaldrBinary $ShDest
        Restore-GaldrBinary $Dest
        throw "$Dest --version is '$Ver', expected $ExpectedVersion"
    }
}
Remove-Item -LiteralPath "$Dest.bak" -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath "$ShDest.bak" -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath "$HostDest.bak" -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath "$PluginDest.bak" -Force -ErrorAction SilentlyContinue

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
Write-Host "  host     $HostDest"
Write-Host "  plugins  $PluginDest"
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
