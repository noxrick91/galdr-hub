# Galdr Windows installer.
#   irm https://term.noxcaw.com/install.txt | iex
#   iex ((New-Object Net.WebClient).DownloadString('https://term.noxcaw.com/install.ps1'))
# Env: GALDR_TAG  GALDR_GITHUB  PREFIX  BIN_DIR  GH_TOKEN  GALDR_GITHUB_TOKEN
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
Show-GaldrPathConflict $Dest
Write-Host "  galdr"
Write-Host "  galdr --version"
Write-Host ""
