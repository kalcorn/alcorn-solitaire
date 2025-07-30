# generate-secure-password.ps1
# Generate cryptographically secure passwords locally

param(
    [int]$Length = 24,
    [switch]$IncludeSymbols = $true,
    [switch]$ExcludeAmbiguous = $true
)

function New-SecurePassword {
    param(
        [int]$Length = 24,
        [bool]$IncludeSymbols = $true,
        [bool]$ExcludeAmbiguous = $true
    )
    
    # Character sets
    $lowercase = "abcdefghijklmnopqrstuvwxyz"
    $uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" 
    $numbers = "0123456789"
    $symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?"
    
    # Remove ambiguous characters if requested
    if ($ExcludeAmbiguous) {
        $lowercase = $lowercase.Replace("l", "").Replace("o", "")
        $uppercase = $uppercase.Replace("I", "").Replace("O", "")
        $numbers = $numbers.Replace("0", "").Replace("1", "")
        $symbols = $symbols.Replace("|", "").Replace("l", "")
    }
    
    # Build character set
    $charset = $lowercase + $uppercase + $numbers
    if ($IncludeSymbols) {
        $charset += $symbols
    }
    
    # Generate password using cryptographically secure random
    $password = ""
    $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
    
    for ($i = 0; $i -lt $Length; $i++) {
        $bytes = New-Object byte[] 1
        $rng.GetBytes($bytes)
        $index = $bytes[0] % $charset.Length
        $password += $charset[$index]
    }
    
    $rng.Dispose()
    
    # Ensure password complexity (at least one of each type)
    $hasLower = $password -cmatch "[a-z]"
    $hasUpper = $password -cmatch "[A-Z]"
    $hasNumber = $password -cmatch "[0-9]"
    $hasSymbol = if ($IncludeSymbols) { $password -match "[\W]" } else { $true }
    
    if (-not ($hasLower -and $hasUpper -and $hasNumber -and $hasSymbol)) {
        # Regenerate if complexity requirements not met
        return New-SecurePassword -Length $Length -IncludeSymbols $IncludeSymbols -ExcludeAmbiguous $ExcludeAmbiguous
    }
    
    return $password
}

# Generate the password
$redisPassword = New-SecurePassword -Length 24 -IncludeSymbols $true -ExcludeAmbiguous $true

Write-Output "Generated secure Redis password:"
Write-Output $redisPassword
Write-Output ""
Write-Output "Password strength: 24 characters with uppercase, lowercase, numbers, and symbols"
Write-Output "Next steps:"
Write-Output "1. Copy this password securely"
Write-Output "2. Set Redis password: wsl redis-cli CONFIG SET requirepass `"$redisPassword`""
Write-Output "3. Store in Credential Manager: cmdkey /generic:`"redis-claude`" /user:`"claude`" /pass:`"$redisPassword`""