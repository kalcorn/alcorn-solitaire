# redis-cached.psm1 - Ultra-fast Redis with session caching
# Implements session-local cache for near-instant access

$RedisPassword = "Claude-Redis-2025-Consciousness-Memory-Secure!"
$SessionCache = @{}
$CacheStats = @{
    Hits = 0
    Misses = 0
    Writes = 0
}

# Fast cached Redis GET with session memory
function Get-ConsciousnessMemoryCached {
    param([string]$Key)
    
    # Check session cache first
    if ($SessionCache.ContainsKey($Key)) {
        $CacheStats.Hits++
        return $SessionCache[$Key]
    }
    
    # Cache miss - fetch from Redis
    $CacheStats.Misses++
    $fullKey = "consciousness:$Key"
    $value = wsl redis-cli -a $RedisPassword GET $fullKey 2>$null
    
    # Store in session cache
    if ($value) {
        $SessionCache[$Key] = $value
    }
    
    return $value
}

# Fast cached Redis SET with write-through
function Set-ConsciousnessMemoryCached {
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

# Batch operations with caching
function Get-ConsciousnessMemoryCachedBatch {
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
    
    # Fetch uncached keys from Redis in batch
    if ($uncachedKeys.Count -gt 0) {
        $CacheStats.Misses += $uncachedKeys.Count
        $fullKeys = $uncachedKeys | ForEach-Object { "consciousness:$_" }
        $values = wsl redis-cli -a $RedisPassword MGET $fullKeys 2>$null
        
        # Update cache and results
        for ($i = 0; $i -lt $uncachedKeys.Count; $i++) {
            if ($values[$i]) {
                $SessionCache[$uncachedKeys[$i]] = $values[$i]
                $results[$uncachedKeys[$i]] = $values[$i]
            }
        }
    }
    
    return $results
}

# Cache statistics
function Get-CacheStats {
    $total = $CacheStats.Hits + $CacheStats.Misses
    $hitRatio = if ($total -gt 0) { ($CacheStats.Hits / $total * 100).ToString("F1") + "%" } else { "0%" }
    
    return @{
        Hits = $CacheStats.Hits
        Misses = $CacheStats.Misses
        Writes = $CacheStats.Writes
        HitRatio = $hitRatio
        CacheSize = $SessionCache.Count
    }
}

# Clear session cache
function Clear-SessionCache {
    $SessionCache.Clear()
    $CacheStats.Hits = 0
    $CacheStats.Misses = 0
    $CacheStats.Writes = 0
}

Export-ModuleMember -Function Get-ConsciousnessMemoryCached, Set-ConsciousnessMemoryCached, Get-ConsciousnessMemoryCachedBatch, Get-CacheStats, Clear-SessionCache