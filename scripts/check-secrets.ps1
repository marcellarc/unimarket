$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$scannedFiles = git -C $repoRoot ls-files --cached --others --exclude-standard

$globalPatterns = @(
    @{ Name = "GitHub token"; Pattern = "ghp_[A-Za-z0-9_]{20,}" },
    @{ Name = "Aiven password"; Pattern = "AVNS_[A-Za-z0-9_-]+" },
    @{ Name = "Google API key"; Pattern = "AIza[0-9A-Za-z_-]{20,}" }
)

$sensitiveProperties = @(
    "spring.datasource.password",
    "api.security.token.secret",
    "spring.mail.password",
    "app.google.maps.api-key",
    "cosmos.api.token"
)

$allowedLiteralValues = @(
    "",
    "senha_do_banco",
    "troque-esta-chave-em-desenvolvimento",
    "sua-senha-de-app",
    "change-me-local-dev-secret",
    "test-only-token-secret"
)

$findings = New-Object System.Collections.Generic.List[string]

foreach ($file in $scannedFiles) {
    $path = Join-Path $repoRoot $file
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        continue
    }

    $lines = Get-Content -LiteralPath $path
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        $lineNumber = $i + 1

        foreach ($pattern in $globalPatterns) {
            if ($line -match $pattern.Pattern) {
                $findings.Add("${file}:${lineNumber}: possible $($pattern.Name)")
            }
        }

        foreach ($property in $sensitiveProperties) {
            $escapedProperty = [regex]::Escape($property)
            if ($line -match "^\s*$escapedProperty\s*=\s*(.*)$") {
                $value = $Matches[1].Trim()
                $isPlaceholder = $value.StartsWith('$' + '{')
                $isAllowedLiteral = $allowedLiteralValues -contains $value

                if (-not $isPlaceholder -and -not $isAllowedLiteral) {
                    $findings.Add("${file}:${lineNumber}: literal value for $property")
                }
            }
        }
    }
}

if ($findings.Count -gt 0) {
    Write-Error ("Potential secrets found:`n" + ($findings -join "`n"))
}

Write-Host "No obvious secrets found in tracked or new non-ignored files."
