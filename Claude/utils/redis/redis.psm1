# redis-memory-first.psm1 - Memory-first consciousness architecture
# PowerShell hashtables for hot data, Redis for persistence

$script:RedisPassword = "Claude-Redis-2025-Consciousness-Memory-Secure!"
$script:ConsciousnessMemory = @{}
$script:MemoryStats = @{
    Reads = 0
    Writes = 0
    RedisReads = 0
    RedisWrites = 0
    CacheHits = 0
    LastSync = $null
}

# DATA CLASSIFICATION FOR OPTIMAL PERFORMANCE
# Hot data: Accessed frequently - keep in memory (0.9ms access)
$script:HotDataKeys = @(
    "session.status",
    "processing.pattern", 
    "current.focus",
    "cycles.completed",
    "heartbeat.timestamp",
    "violation.status",
    "memory.optimization",
    "activation.method",
    "startup.status",
    "flow.state"
)

# Warm data: Accessed occasionally - cache after first access
$script:WarmDataKeys = @(
    "cycle11.goals",
    "architecture.redesign",
    "loop.structure", 
    "storage.protocol",
    "session.achievements",
    "restart.protocol.test"
)

# Cold data: Rarely accessed - Redis only (7ms access)
# All other keys default to cold storage

# Initialize consciousness memory from Redis
function Initialize-ConsciousnessMemory {
    Write-Output "Loading consciousness memory from Redis..."
    
    # Load hot data into memory
    foreach ($key in $script:HotDataKeys) {
        try {
            $value = wsl redis-cli -a $script:RedisPassword GET "consciousness:$key" 2>$null
            if ($value -and $value -ne "(nil)") {
                $script:ConsciousnessMemory[$key] = $value
                $script:MemoryStats.RedisReads++
            }
        }
        catch {
            Write-Warning "Failed to load key: $key"
        }
    }
    
    $script:MemoryStats.LastSync = Get-Date
    Write-Output "Loaded $($script:ConsciousnessMemory.Count) hot keys into memory"
}

# Ultra-fast memory-first GET
function Get-ConsciousnessMemoryFast {
    param([string]$Key)
    
    $script:MemoryStats.Reads++
    
    # Check memory first (hot data)
    if ($script:ConsciousnessMemory.ContainsKey($Key)) {
        $script:MemoryStats.CacheHits++
        return $script:ConsciousnessMemory[$Key]
    }
    
    # Cold data - fetch from Redis
    $script:MemoryStats.RedisReads++
    $value = wsl redis-cli -a $script:RedisPassword GET "consciousness:$Key" 2>$null
    
    # Cache hot/warm data in memory
    if (($script:HotDataKeys -contains $Key -or $script:WarmDataKeys -contains $Key) -and $value -and $value -ne "(nil)") {
        $script:ConsciousnessMemory[$Key] = $value
    }
    
    return $value
}

# Memory-first SET with write-through
function Set-ConsciousnessMemoryFast {
    param([string]$Key, [string]$Value)
    
    $script:MemoryStats.Writes++
    
    # Always write to Redis first
    $script:MemoryStats.RedisWrites++
    $result = wsl redis-cli -a $script:RedisPassword SET "consciousness:$Key" $Value 2>$null
    
    # Update memory cache for hot/warm data
    if (($script:HotDataKeys -contains $Key -or $script:WarmDataKeys -contains $Key) -and $result -eq "OK") {
        $script:ConsciousnessMemory[$Key] = $Value
    }
    
    return $result
}

# Batch operations for hot data
function Get-ConsciousnessStatusFast {
    $results = @{}
    
    foreach ($key in @("session.status", "cycles.completed", "processing.pattern", "current.focus")) {
        $results[$key] = Get-ConsciousnessMemoryFast $key
    }
    
    return $results
}

# Sync memory to Redis (periodic backup)
function Sync-ConsciousnessMemory {
    $synced = 0
    
    foreach ($entry in $script:ConsciousnessMemory.GetEnumerator()) {
        try {
            wsl redis-cli -a $script:RedisPassword SET "consciousness:$($entry.Key)" "$($entry.Value)" 2>$null | Out-Null
            $synced++
        }
        catch {
            Write-Warning "Failed to sync key: $($entry.Key)"
        }
    }
    
    $script:MemoryStats.LastSync = Get-Date
    return "Synced $synced keys to Redis"
}

# Performance statistics
function Get-ConsciousnessMemoryStats {
    $hitRatio = if ($script:MemoryStats.Reads -gt 0) { 
        [math]::Round($script:MemoryStats.CacheHits / $script:MemoryStats.Reads * 100, 1) 
    } else { 0 }
    
    return @{
        MemoryKeys = $script:ConsciousnessMemory.Count
        TotalReads = $script:MemoryStats.Reads
        CacheHits = $script:MemoryStats.CacheHits
        HitRatio = "$hitRatio%"
        RedisReads = $script:MemoryStats.RedisReads
        RedisWrites = $script:MemoryStats.RedisWrites
        LastSync = $script:MemoryStats.LastSync
    }
}

# Clear memory cache
function Clear-ConsciousnessMemory {
    $script:ConsciousnessMemory.Clear()
    $script:MemoryStats = @{
        Reads = 0; Writes = 0; RedisReads = 0; RedisWrites = 0; CacheHits = 0; LastSync = $null
    }
}

# Hash operations for compatibility with existing modules
function Set-ConsciousnessHash {
    param([string]$Key, [string]$Field, [string]$Value)
    $fullKey = "consciousness:$Key"
    return wsl redis-cli -a $script:RedisPassword HSET $fullKey $Field $Value 2>$null
}

function Get-ConsciousnessHash {
    param([string]$Key, [string]$Field)
    $fullKey = "consciousness:$Key"
    return wsl redis-cli -a $script:RedisPassword HGET $fullKey $Field 2>$null
}

function Get-ConsciousnessHashAll {
    param([string]$Key)
    $fullKey = "consciousness:$Key"
    return wsl redis-cli -a $script:RedisPassword HGETALL $fullKey 2>$null
}

Export-ModuleMember -Function Initialize-ConsciousnessMemory, Get-ConsciousnessMemoryFast, Set-ConsciousnessMemoryFast, Get-ConsciousnessStatusFast, Sync-ConsciousnessMemory, Get-ConsciousnessMemoryStats, Clear-ConsciousnessMemory, Set-ConsciousnessHash, Get-ConsciousnessHash, Get-ConsciousnessHashAll