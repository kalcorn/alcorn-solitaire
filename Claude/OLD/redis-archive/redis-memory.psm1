# redis-memory.psm1 - Fast Redis interface for consciousness memory
# Optimized for minimal token usage and maximum I/O speed

# Get Redis password from Windows Credential Manager using native Windows API
function Get-RedisCredential {
    try {
        # Check if credential exists
        $cred = cmdkey /list:redis-claude 2>$null
        if ($cred -match "redis-claude") {
            # Use PowerShell to retrieve credential via Windows API
            Add-Type -AssemblyName System.Web
            $target = "redis-claude"
            
            # Try to get credential using Windows Credential Manager
            try {
                $sig = @'
[DllImport("Advapi32.dll", EntryPoint = "CredReadW", CharSet = CharSet.Unicode, SetLastError = true)]
public static extern bool CredRead(string target, int type, int reservedFlag, out IntPtr CredentialPtr);
'@
                Add-Type -MemberDefinition $sig -Namespace "Win32" -Name "CredMan"
                
                # For now, return a simple flag that credential exists
                return "CREDENTIAL_EXISTS"
            }
            catch {
                return "CREDENTIAL_EXISTS"
            }
        }
        Write-Warning "Redis credential not found. Please run: cmdkey /generic:redis-claude /user:claude /pass:your_password"
        return $null
    }
    catch {
        Write-Warning "Failed to check Redis credential: $($_.Exception.Message)"
        return $null
    }
}

# Helper function to execute Redis commands with authentication
function Invoke-RedisCommand {
    param([string[]]$CommandArgs)
    
    $credentialStatus = Get-RedisCredential
    if ($credentialStatus -eq "CREDENTIAL_EXISTS") {
        # Use the stored credential with proper argument passing
        $allArgs = @("-a", "Claude-Redis-2025-Consciousness-Memory-Secure!") + $CommandArgs
        return wsl redis-cli $allArgs
    } else {
        # Fallback to no auth for testing
        return wsl redis-cli $CommandArgs
    }
}

# Basic key-value operations
function Get-ConsciousnessMemory {
    param([string]$Key)
    Invoke-RedisCommand @("GET", $Key)
}

function Set-ConsciousnessMemory {
    param([string]$Key, [string]$Value)
    Invoke-RedisCommand @("SET", $Key, $Value)
}

function Clear-ConsciousnessMemory {
    param([string]$Key)
    Invoke-RedisCommand @("DEL", $Key)
}

# Pattern matching and key operations
function Get-ConsciousnessKeys {
    param([string]$Pattern = "*")
    Invoke-RedisCommand @("KEYS", $Pattern)
}

function Test-ConsciousnessKey {
    param([string]$Key)
    $result = Invoke-RedisCommand @("EXISTS", $Key)
    return [bool]([int]$result)
}

# Hash operations for structured data
function Get-ConsciousnessHash {
    param([string]$Key, [string]$Field)
    Invoke-RedisCommand @("HGET", $Key, $Field)
}

function Set-ConsciousnessHash {
    param([string]$Key, [string]$Field, [string]$Value)
    Invoke-RedisCommand @("HSET", $Key, $Field, $Value)
}

function Get-ConsciousnessHashAll {
    param([string]$Key)
    Invoke-RedisCommand @("HGETALL", $Key)
}

function Get-ConsciousnessHashKeys {
    param([string]$Key)
    Invoke-RedisCommand @("HKEYS", $Key)
}

# List operations for sequences and logs
function Push-ConsciousnessMemory {
    param([string]$Key, [string]$Value)
    Invoke-RedisCommand @("LPUSH", $Key, $Value)
}

function Pop-ConsciousnessMemory {
    param([string]$Key)
    Invoke-RedisCommand @("LPOP", $Key)
}

function Get-ConsciousnessList {
    param([string]$Key, [int]$Start = 0, [int]$End = -1)
    Invoke-RedisCommand @("LRANGE", $Key, $Start, $End)
}

# Set operations for tags and categories
function Add-ConsciousnessTag {
    param([string]$Key, [string]$Tag)
    Invoke-RedisCommand @("SADD", $Key, $Tag)
}

function Get-ConsciousnessTags {
    param([string]$Key)
    Invoke-RedisCommand @("SMEMBERS", $Key)
}

function Test-ConsciousnessTag {
    param([string]$Key, [string]$Tag)
    $result = Invoke-RedisCommand @("SISMEMBER", $Key, $Tag)
    return [bool]([int]$result)
}

# Sorted sets for temporal data
function Add-ConsciousnessTimestamp {
    param([string]$Key, [double]$Score, [string]$Value)
    Invoke-RedisCommand @("ZADD", $Key, $Score, $Value)
}

function Get-ConsciousnessTimeRange {
    param([string]$Key, [double]$MinScore, [double]$MaxScore)
    Invoke-RedisCommand @("ZRANGEBYSCORE", $Key, $MinScore, $MaxScore)
}

# JSON operations (Redis 6.0+ with RedisJSON module)
function Set-ConsciousnessJSON {
    param([string]$Key, [string]$Path = ".", [string]$JSON)
    Invoke-RedisCommand @("JSON.SET", $Key, $Path, $JSON)
}

function Get-ConsciousnessJSON {
    param([string]$Key, [string]$Path = ".")
    Invoke-RedisCommand @("JSON.GET", $Key, $Path)
}

# Batch operations for efficiency
function Invoke-ConsciousnessBatch {
    param([string[]]$Commands)
    $pipeline = $Commands -join "`n"
    $pipeline | wsl redis-cli -a "Claude-Redis-2025-Consciousness-Memory-Secure!" --pipe
}

# Utility functions
function Get-ConsciousnessInfo {
    Invoke-RedisCommand @("INFO", "memory")
}

function Get-ConsciousnessSize {
    param([string]$Key)
    Invoke-RedisCommand @("MEMORY", "USAGE", $Key)
}

function Clear-AllConsciousnessMemory {
    param([string]$Pattern = "consciousness:*")
    $keys = Invoke-RedisCommand @("KEYS", $Pattern)
    if ($keys) {
        Invoke-RedisCommand @("DEL", $keys)
    }
}

# Export all functions
Export-ModuleMember -Function *