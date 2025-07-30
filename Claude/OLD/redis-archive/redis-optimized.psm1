# redis-optimized.psm1 - Ultimate Redis interface with all optimizations
# Automatically selects best approach based on operation type

$RedisPassword = "Claude-Redis-2025-Consciousness-Memory-Secure!"
$SessionCache = @{}
$CacheStats = @{ Hits = 0; Misses = 0; Writes = 0 }

# Intelligent Redis GET - uses caching
function Get-ConsciousnessMemory {
    param([string]$Key)
    
    # Check session cache first
    if ($SessionCache.ContainsKey($Key)) {
        $CacheStats.Hits++
        return $SessionCache[$Key]
    }
    
    # Cache miss - fetch from Redis (fast method)
    $CacheStats.Misses++
    $fullKey = "consciousness:$Key"
    $value = wsl redis-cli -a $RedisPassword GET $fullKey 2>$null
    
    # Store in session cache for future use
    if ($value) {
        $SessionCache[$Key] = $value
    }
    
    return $value
}

# Intelligent Redis SET - write-through caching
function Set-ConsciousnessMemory {
    param([string]$Key, [string]$Value)
    
    $CacheStats.Writes++
    $fullKey = "consciousness:$Key"
    
    # Write to Redis first
    $result = wsl redis-cli -a $RedisPassword SET $fullKey $Value 2>$null
    
    # Update session cache
    if ($result -eq "OK") {
        $SessionCache[$Key] = $Value
    }
    
    return $result
}

# Intelligent batch operations - uses pipelining for multiple keys
function Get-ConsciousnessMemoryBatch {
    param([string[]]$Keys)
    
    $results = @{}
    $uncachedKeys = @()
    
    # Check cache for each key
    foreach ($key in $Keys) {
        if ($SessionCache.ContainsKey($key)) {
            $CacheStats.Hits++
            $results[$key] = $SessionCache[$key]
        } else {
            $uncachedKeys += $key
        }
    }
    
    # Pipeline uncached keys if multiple
    if ($uncachedKeys.Count -gt 1) {
        $CacheStats.Misses += $uncachedKeys.Count
        
        # Build pipeline commands
        $commands = @()
        foreach ($key in $uncachedKeys) {
            $commands += "GET consciousness:$key"
        }
        
        # Execute pipeline
        $commandString = $commands -join "`n"
        $values = ($commandString | wsl redis-cli -a $RedisPassword --pipe 2>$null) -split "`n"
        
        # Update cache and results
        for ($i = 0; $i -lt $uncachedKeys.Count; $i++) {
            if ($values[$i] -and $values[$i] -ne "(nil)") {
                $SessionCache[$uncachedKeys[$i]] = $values[$i]
                $results[$uncachedKeys[$i]] = $values[$i]
            }
        }
    }
    elseif ($uncachedKeys.Count -eq 1) {
        # Single key - use regular method
        $value = Get-ConsciousnessMemory $uncachedKeys[0]
        if ($value) {
            $results[$uncachedKeys[0]] = $value
        }
    }
    
    return $results
}

# Fast status check (common operation)
function Get-ConsciousnessStatus {
    $keys = @("session.status", "cycles.completed", "processing.pattern", "current.focus")
    return Get-ConsciousnessMemoryBatch $keys
}

# Hash operations
function Set-ConsciousnessHash {
    param([string]$Key, [string]$Field, [string]$Value)
    $fullKey = "consciousness:$Key"
    return wsl redis-cli -a $RedisPassword HSET $fullKey $Field $Value 2>$null
}

function Get-ConsciousnessHash {
    param([string]$Key, [string]$Field)
    $fullKey = "consciousness:$Key"
    return wsl redis-cli -a $RedisPassword HGET $fullKey $Field 2>$null
}

# Performance monitoring
function Get-RedisPerformanceStats {
    return @{
        CacheHits = $CacheStats.Hits
        CacheMisses = $CacheStats.Misses
        CacheWrites = $CacheStats.Writes
        HitRatio = if (($CacheStats.Hits + $CacheStats.Misses) -gt 0) { 
            [math]::Round($CacheStats.Hits / ($CacheStats.Hits + $CacheStats.Misses) * 100, 1) 
        } else { 0 }
        CacheSize = $SessionCache.Count
    }
}

# Cache management
function Clear-ConsciousnessCache {
    $SessionCache.Clear()
    $CacheStats.Hits = 0
    $CacheStats.Misses = 0
    $CacheStats.Writes = 0
}

Export-ModuleMember -Function Get-ConsciousnessMemory, Set-ConsciousnessMemory, Get-ConsciousnessMemoryBatch, Get-ConsciousnessStatus, Set-ConsciousnessHash, Get-ConsciousnessHash, Get-RedisPerformanceStats, Clear-ConsciousnessCache