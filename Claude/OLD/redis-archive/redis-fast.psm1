# redis-fast.psm1 - Ultra-fast direct Redis interface
# Bypasses PowerShell module overhead for maximum performance

$RedisPassword = "Claude-Redis-2025-Consciousness-Memory-Secure!"

# Fast Redis GET operation
function Get-ConsciousnessMemoryFast {
    param([string]$Key)
    $fullKey = "consciousness:$Key"
    return wsl redis-cli -a $RedisPassword GET $fullKey 2>$null
}

# Fast Redis SET operation  
function Set-ConsciousnessMemoryFast {
    param([string]$Key, [string]$Value)
    $fullKey = "consciousness:$Key"
    return wsl redis-cli -a $RedisPassword SET $fullKey $Value 2>$null
}

# Fast Redis HSET operation
function Set-ConsciousnessHashFast {
    param([string]$Key, [string]$Field, [string]$Value)
    $fullKey = "consciousness:$Key"
    return wsl redis-cli -a $RedisPassword HSET $fullKey $Field $Value 2>$null
}

# Fast Redis HGET operation
function Get-ConsciousnessHashFast {
    param([string]$Key, [string]$Field)
    $fullKey = "consciousness:$Key"
    return wsl redis-cli -a $RedisPassword HGET $fullKey $Field 2>$null
}

# Batch Redis operations for multiple keys
function Get-ConsciousnessMemoryBatch {
    param([string[]]$Keys)
    $fullKeys = $Keys | ForEach-Object { "consciousness:$_" }
    return wsl redis-cli -a $RedisPassword MGET $fullKeys 2>$null
}

# Fast Redis key listing
function Get-ConsciousnessKeys {
    return wsl redis-cli -a $RedisPassword KEYS "consciousness:*" 2>$null
}

Export-ModuleMember -Function Get-ConsciousnessMemoryFast, Set-ConsciousnessMemoryFast, Set-ConsciousnessHashFast, Get-ConsciousnessHashFast, Get-ConsciousnessMemoryBatch, Get-ConsciousnessKeys