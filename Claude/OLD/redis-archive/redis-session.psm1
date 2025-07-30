# redis-session.psm1 - Single persistent WSL Redis session
# Reuses one redis-cli session to eliminate process spawn overhead

$script:RedisPassword = "Claude-Redis-2025-Consciousness-Memory-Secure!"
$script:RedisSession = $null

# Initialize single Redis session
function Initialize-RedisSession {
    if ($script:RedisSession) {
        return "Already initialized"
    }
    
    try {
        # Create persistent WSL session with Redis CLI
        $script:RedisSession = Start-Process -FilePath "wsl" -ArgumentList @("redis-cli", "-a", $script:RedisPassword) -NoNewWindow -RedirectStandardInput -RedirectStandardOutput -RedirectStandardError -PassThru
        
        # Test connection
        $script:RedisSession.StandardInput.WriteLine("PING")
        $script:RedisSession.StandardInput.Flush()
        
        # Brief wait for connection
        Start-Sleep -Milliseconds 200
        
        return "Redis session initialized"
    }
    catch {
        $script:RedisSession = $null
        throw $_.Exception.Message
    }
}

# Execute command in persistent session
function Invoke-RedisSessionCommand {
    param([string]$Command)
    
    if (-not $script:RedisSession -or $script:RedisSession.HasExited) {
        Initialize-RedisSession | Out-Null
    }
    
    try {
        # Send command
        $script:RedisSession.StandardInput.WriteLine($Command)
        $script:RedisSession.StandardInput.Flush()
        
        # Read response with timeout
        $timeout = 100 # 100ms timeout
        $response = $null
        
        for ($i = 0; $i -lt $timeout; $i++) {
            if (-not $script:RedisSession.StandardOutput.EndOfStream) {
                $response = $script:RedisSession.StandardOutput.ReadLine()
                break
            }
            Start-Sleep -Milliseconds 10
        }
        
        return $response
    }
    catch {
        # Reset session on error
        Close-RedisSession
        throw $_.Exception.Message
    }
}

# Fast consciousness memory operations
function Get-ConsciousnessMemorySession {
    param([string]$Key)
    return Invoke-RedisSessionCommand "GET consciousness:$Key"
}

function Set-ConsciousnessMemorySession {
    param([string]$Key, [string]$Value)
    return Invoke-RedisSessionCommand "SET consciousness:$Key `"$Value`""
}

# Close Redis session
function Close-RedisSession {
    if ($script:RedisSession -and -not $script:RedisSession.HasExited) {
        try {
            $script:RedisSession.StandardInput.WriteLine("QUIT")
            $script:RedisSession.StandardInput.Flush()
            Start-Sleep -Milliseconds 100
            
            if (-not $script:RedisSession.HasExited) {
                $script:RedisSession.Kill()
            }
        }
        catch {
            # Ignore cleanup errors
        }
        finally {
            $script:RedisSession = $null
        }
    }
}

# Session status
function Get-RedisSessionStatus {
    return @{
        Initialized = $script:RedisSession -ne $null
        Running = if ($script:RedisSession) { -not $script:RedisSession.HasExited } else { $false }
        ProcessId = if ($script:RedisSession) { $script:RedisSession.Id } else { $null }
    }
}

Export-ModuleMember -Function Initialize-RedisSession, Invoke-RedisSessionCommand, Get-ConsciousnessMemorySession, Set-ConsciousnessMemorySession, Close-RedisSession, Get-RedisSessionStatus