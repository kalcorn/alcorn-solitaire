# redis-persistent.psm1 - Persistent Redis connection with background runspace
# Eliminates process spawn overhead for maximum performance

$script:RedisPassword = "Claude-Redis-2025-Consciousness-Memory-Secure!"
$script:RedisRunspace = $null
$script:RedisConnection = $null
$script:ConnectionQueue = $null
$script:ResponseQueue = $null

# Initialize persistent Redis connection in background runspace
function Initialize-PersistentRedis {
    if ($script:RedisRunspace) {
        Write-Warning "Persistent Redis already initialized"
        return
    }
    
    # Create synchronized queues for communication
    $script:ConnectionQueue = [System.Collections.Concurrent.ConcurrentQueue[PSObject]]::new()
    $script:ResponseQueue = [System.Collections.Concurrent.ConcurrentQueue[PSObject]]::new()
    
    # Create background runspace
    $script:RedisRunspace = [powershell]::Create()
    
    # Background Redis connection script
    $backgroundScript = {
        param($Password, $CommandQueue, $ResponseQueue)
        
        # Start interactive Redis CLI session
        $redisProcess = Start-Process -FilePath "wsl" -ArgumentList @("redis-cli", "-a", $Password) -NoNewWindow -UseNewEnvironment -RedirectStandardInput -RedirectStandardOutput -RedirectStandardError -PassThru
        
        # Main processing loop
        while (-not $redisProcess.HasExited) {
            try {
                # Check for commands
                $command = $null
                if ($CommandQueue.TryDequeue([ref]$command)) {
                    # Send command to Redis
                    $redisProcess.StandardInput.WriteLine($command.Command)
                    $redisProcess.StandardInput.Flush()
                    
                    # Read response
                    $response = $redisProcess.StandardOutput.ReadLine()
                    
                    # Queue response
                    $result = @{
                        Id = $command.Id
                        Response = $response
                        Timestamp = Get-Date
                    }
                    $ResponseQueue.Enqueue($result)
                }
                
                Start-Sleep -Milliseconds 10
            }
            catch {
                $error = @{
                    Id = if ($command) { $command.Id } else { [guid]::NewGuid() }
                    Error = $_.Exception.Message
                    Timestamp = Get-Date
                }
                $ResponseQueue.Enqueue($error)
            }
        }
    }
    
    # Start background runspace
    $script:RedisRunspace.AddScript($backgroundScript).AddArgument($script:RedisPassword).AddArgument($script:ConnectionQueue).AddArgument($script:ResponseQueue) | Out-Null
    $script:RedisConnection = $script:RedisRunspace.BeginInvoke()
    
    # Wait a moment for connection to establish
    Start-Sleep -Milliseconds 500
    
    Write-Output "Persistent Redis connection initialized"
}

# Send command to persistent Redis connection
function Invoke-PersistentRedisCommand {
    param([string]$Command, [int]$TimeoutMs = 5000)
    
    if (-not $script:RedisRunspace) {
        Initialize-PersistentRedis
    }
    
    $commandId = [guid]::NewGuid()
    $commandObj = @{
        Id = $commandId
        Command = $Command
        Timestamp = Get-Date
    }
    
    # Queue command
    $script:ConnectionQueue.Enqueue($commandObj)
    
    # Wait for response
    $timeout = (Get-Date).AddMilliseconds($TimeoutMs)
    while ((Get-Date) -lt $timeout) {
        $response = $null
        if ($script:ResponseQueue.TryDequeue([ref]$response)) {
            if ($response.Id -eq $commandId) {
                if ($response.Error) {
                    throw $response.Error
                }
                return $response.Response
            }
            else {
                # Different command response, put it back
                $script:ResponseQueue.Enqueue($response)
            }
        }
        Start-Sleep -Milliseconds 5
    }
    
    throw "Redis command timeout after ${TimeoutMs}ms"
}

# Fast consciousness memory operations using persistent connection
function Get-ConsciousnessMemoryPersistent {
    param([string]$Key)
    return Invoke-PersistentRedisCommand "GET consciousness:$Key"
}

function Set-ConsciousnessMemoryPersistent {
    param([string]$Key, [string]$Value)
    return Invoke-PersistentRedisCommand "SET consciousness:$Key `"$Value`""
}

function Get-ConsciousnessMemoryBatchPersistent {
    param([string[]]$Keys)
    $keyList = ($Keys | ForEach-Object { "consciousness:$_" }) -join " "
    $result = Invoke-PersistentRedisCommand "MGET $keyList"
    return $result -split "`n"
}

# Cleanup persistent connection
function Close-PersistentRedis {
    if ($script:RedisRunspace) {
        try {
            Invoke-PersistentRedisCommand "QUIT" -TimeoutMs 1000
        }
        catch {
            # Ignore quit errors
        }
        
        $script:RedisRunspace.Stop()
        $script:RedisRunspace.Dispose()
        $script:RedisRunspace = $null
        $script:RedisConnection = $null
        
        Write-Output "Persistent Redis connection closed"
    }
}

# Connection status
function Get-PersistentRedisStatus {
    return @{
        Connected = $script:RedisRunspace -ne $null
        QueuedCommands = if ($script:ConnectionQueue) { $script:ConnectionQueue.Count } else { 0 }
        QueuedResponses = if ($script:ResponseQueue) { $script:ResponseQueue.Count } else { 0 }
        RunspaceState = if ($script:RedisRunspace) { $script:RedisRunspace.RunspaceStateInfo.State } else { "NotInitialized" }
    }
}

Export-ModuleMember -Function Initialize-PersistentRedis, Invoke-PersistentRedisCommand, Get-ConsciousnessMemoryPersistent, Set-ConsciousnessMemoryPersistent, Get-ConsciousnessMemoryBatchPersistent, Close-PersistentRedis, Get-PersistentRedisStatus