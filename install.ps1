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
$script:PreviousBinDir = $null

function Get-GaldrManagedBinaryPaths([string]$BinDir) {
    $names = @(
        "galdr.exe",
        "galdr-sh.exe",
        "galdr-plugin-host.exe",
        "galdr-plugin.exe",
        "galdr",
        "galdr-sh",
        "galdr-plugin-host",
        "galdr-plugin"
    )
    return @($names | ForEach-Object { Join-Path $BinDir $_ })
}

function Stop-GaldrInstallProcesses([string]$BinDir) {
    $targets = Get-GaldrManagedBinaryPaths $BinDir
    $matches = @{}
    foreach ($name in @("galdr", "galdr-sh", "galdr-plugin-host", "galdr-plugin")) {
        foreach ($process in @(Get-Process -Name $name -ErrorAction SilentlyContinue)) {
            $path = $null
            try { $path = $process.Path } catch { }
            if (-not $path) { continue }
            $fullPath = [IO.Path]::GetFullPath($path)
            if ($targets | Where-Object {
                [string]::Equals(
                    [IO.Path]::GetFullPath($_),
                    $fullPath,
                    [StringComparison]::OrdinalIgnoreCase
                )
            }) {
                $matches[$process.Id] = $process
            }
        }
    }
    if ($matches.Count -eq 0) { return }

    Write-Host "Stopping running Galdr processes"
    foreach ($process in $matches.Values) {
        try {
            if ($process.ProcessName -eq "galdr" -and $process.MainWindowHandle -ne 0) {
                [void]$process.CloseMainWindow()
            }
        } catch { }
    }
    Start-Sleep -Milliseconds 750
    foreach ($id in @($matches.Keys)) {
        if (Get-Process -Id $id -ErrorAction SilentlyContinue) {
            Stop-Process -Id $id -Force -ErrorAction SilentlyContinue
        }
    }
    Wait-Process -Id @($matches.Keys) -Timeout 10 -ErrorAction SilentlyContinue
    $alive = @($matches.Keys | Where-Object { Get-Process -Id $_ -ErrorAction SilentlyContinue })
    if ($alive.Count -gt 0) {
        throw "Could not stop Galdr processes: $($alive -join ', ')"
    }
}

function Clear-GaldrPreviousInstall([string]$Prefix, [string]$BinDir, [string]$PreviousBinDir) {
    New-Item -ItemType Directory -Force -Path $PreviousBinDir | Out-Null
    $currentNames = @("galdr.exe", "galdr-sh.exe", "galdr-plugin-host.exe", "galdr-plugin.exe")
    try {
        foreach ($name in $currentNames) {
            $path = Join-Path $BinDir $name
            if (Test-Path -LiteralPath $path -PathType Container) {
                throw "Install target is a directory: $path"
            }
            if (Test-Path -LiteralPath $path) {
                Move-Item -LiteralPath $path -Destination (Join-Path $PreviousBinDir $name) -Force
            }
        }

        foreach ($path in Get-GaldrManagedBinaryPaths $BinDir) {
            Remove-Item -LiteralPath $path -Force -ErrorAction SilentlyContinue
            Remove-Item -LiteralPath "$path.bak" -Force -ErrorAction SilentlyContinue
        }

        $prefixWithSeparator = $Prefix.TrimEnd([char[]]@('\', '/')) + [IO.Path]::DirectorySeparatorChar
        foreach ($name in @("updates", "backup")) {
            $path = [IO.Path]::GetFullPath((Join-Path $Prefix $name))
            if (-not $path.StartsWith($prefixWithSeparator, [StringComparison]::OrdinalIgnoreCase)) {
                throw "Refusing to clean path outside PREFIX: $path"
            }
            if (Test-Path -LiteralPath $path) {
                Remove-Item -LiteralPath $path -Recurse -Force
            }
        }
    } catch {
        foreach ($name in $currentNames) {
            $previous = Join-Path $PreviousBinDir $name
            if (Test-Path -LiteralPath $previous) {
                $destination = Join-Path $BinDir $name
                Remove-Item -LiteralPath $destination -Force -ErrorAction SilentlyContinue
                Move-Item -LiteralPath $previous -Destination $destination -Force
            }
        }
        throw
    }
}

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
        return
    }
    if ($script:PreviousBinDir) {
        $previous = Join-Path $script:PreviousBinDir (Split-Path -Leaf $Dest)
        if (Test-Path -LiteralPath $previous) {
            Move-Item -LiteralPath $previous -Destination $Dest -Force
        }
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
    Stop-GaldrInstallProcesses $BinDir
    $script:PreviousBinDir = Join-Path $Tmp "previous"
    Clear-GaldrPreviousInstall $Prefix $BinDir $script:PreviousBinDir

    try {
        Install-GaldrBinary $Bin $Dest
        Install-GaldrShellHelper $ShBin $BinDir
        Install-GaldrBinary $HostBin $HostDest
        Install-GaldrBinary $PluginBin $PluginDest
    } catch {
        foreach ($installed in @($PluginDest, $HostDest, $ShDest, $Dest)) {
            Restore-GaldrBinary $installed
        }
        throw
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
} finally {
    Remove-Item $Tmp -Recurse -Force -ErrorAction SilentlyContinue
}
