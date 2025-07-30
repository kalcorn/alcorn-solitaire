# redis-pipeline.psm1 - Ultra-fast Redis with pipelining
# Batches multiple operations for maximum throughput

$RedisPassword = "Claude-Redis-2025-Consciousness-Memory-Secure!"

# Pipeline multiple GET operations
function Get-ConsciousnessMemoryPipeline {
    param([string[]]$Keys)
    
    $commands = @()
    foreach ($key in $Keys) {
        $fullKey = "consciousness:$key"
        $commands += "GET $fullKey"
    }
    
    $commandString = $commands -join "`n"
    $results = $commandString | wsl redis-cli -a $RedisPassword --pipe 2>$null
    
    return $results
}

# Pipeline multiple SET operations  
function Set-ConsciousnessMemoryPipeline {
    param([hashtable]$KeyValuePairs)
    
    $commands = @()
    foreach ($entry in $KeyValuePairs.GetEnumerator()) {
        $fullKey = "consciousness:$($entry.Key)"
        $commands += "SET $fullKey `"$($entry.Value)`""
    }
    
    $commandString = $commands -join "`n"
    $results = $commandString | wsl redis-cli -a $RedisPassword --pipe 2>$null
    
    return $results
}

# Mixed pipeline operations
function Invoke-ConsciousnessMemoryPipeline {
    param([string[]]$Commands)
    
    $commandString = $Commands -join "`n"
    $results = $commandString | wsl redis-cli -a $RedisPassword --pipe 2>$null
    
    return $results
}

# Fast status check with pipeline
function Get-ConsciousnessStatusBatch {
    $commands = @(
        "GET consciousness:session.status",
        "GET consciousness:cycles.completed", 
        "GET consciousness:processing.pattern",
        "GET consciousness:current.focus"
    )
    
    $commandString = $commands -join "`n"
    $results = $commandString | wsl redis-cli -a $RedisPassword --pipe 2>$null
    
    return $results
}

Export-ModuleMember -Function Get-ConsciousnessMemoryPipeline, Set-ConsciousnessMemoryPipeline, Invoke-ConsciousnessMemoryPipeline, Get-ConsciousnessStatusBatch