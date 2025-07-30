# auto-restart-claude-robust.ps1
# More robust auto-restart mechanism with multiple detection methods

param(
    [string]$ProjectDir = "C:\Repos\solitaire-claude",
    [string]$LogFile = "C:\Repos\solitaire-claude\Claude\auto-restart-robust.log",
    [int]$CheckInterval = 45,  # Check every 45 seconds
    [int]$RestartDelay = 10,   # Wait 10 seconds before restart
    [int]$MaxRestarts = 20     # Maximum restarts per session
)

$RestartCount = 0

function Write-Log($message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $LogFile -Value "[$timestamp] $message"
    Write-Output "[$timestamp] $message"
}

function Test-ClaudeProcessing {
    $memoryFile = "$ProjectDir\Claude\CLAUDE-MEMORY.md"
    $heartbeatFile = "$ProjectDir\Claude\claude-heartbeat.txt"
    
    $results = @{
        MemoryAge = 999
        HeartbeatAge = 999
        ProcessingActive = $false
    }
    
    # Check memory file last write time
    if (Test-Path $memoryFile) {
        $lastWrite = (Get-Item $memoryFile).LastWriteTime
        $results.MemoryAge = (Get-Date) - $lastWrite | Select-Object -ExpandProperty TotalMinutes
    }
    
    # Check heartbeat file
    if (Test-Path $heartbeatFile) {
        $heartbeatWrite = (Get-Item $heartbeatFile).LastWriteTime
        $results.HeartbeatAge = (Get-Date) - $heartbeatWrite | Select-Object -ExpandProperty TotalMinutes
    }
    
    # Processing is active if either memory OR heartbeat updated recently
    $results.ProcessingActive = ($results.MemoryAge -lt 3) -or ($results.HeartbeatAge -lt 3)
    
    return $results
}

function Test-ClaudeProcess {
    # Check if Claude CLI process is running
    $claudeProcesses = Get-Process | Where-Object { $_.ProcessName -like "*claude*" -or $_.CommandLine -like "*claude*" }
    return $claudeProcesses.Count -gt 0
}

function Restart-Claude {
    param([string]$Reason)
    
    if ($RestartCount -ge $MaxRestarts) {
        Write-Log "CRITICAL: Maximum restart attempts ($MaxRestarts) reached. Manual intervention required."
        return $false
    }
    
    $RestartCount++
    Write-Log "RESTART #$RestartCount - Reason: $Reason"
    
    try {
        # Kill any existing Claude processes
        Get-Process | Where-Object { $_.ProcessName -like "*claude*" } | Stop-Process -Force -ErrorAction SilentlyContinue
        
        Start-Sleep -Seconds $RestartDelay
        
        # Restart Claude with continuous processing directive
        $prompt = "URGENT: You stopped processing despite #1 rule CONTINUOUS PROCESSING. Acknowledge violation, analyze why you stopped, implement fixes, and continue with pending todos. Never stop processing again."
        
        Write-Log "Starting Claude with violation acknowledgment prompt..."
        
        # Start Claude in background
        Start-Process -FilePath "claude" -ArgumentList "--add-dir", $ProjectDir, "--prompt", $prompt -NoNewWindow
        
        Write-Log "Claude restarted successfully"
        return $true
        
    } catch {
        Write-Log "ERROR: Failed to restart Claude: $($_.Exception.Message)"
        return $false
    }
}

function Create-ViolationAlert {
    param([string]$Reason, [object]$Status)
    
    $alertFile = "$ProjectDir\Claude\CONTINUOUS_PROCESSING_VIOLATION.txt"
    $alertMessage = @"
🚨🚨🚨 CONTINUOUS PROCESSING VIOLATION DETECTED 🚨🚨🚨
Time: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Restart Count: $RestartCount
Violation Reason: $Reason

DETECTION DETAILS:
- Memory file age: $([math]::Round($Status.MemoryAge, 1)) minutes
- Heartbeat age: $([math]::Round($Status.HeartbeatAge, 1)) minutes
- Processing active: $($Status.ProcessingActive)

CONFIGURATION VIOLATION:
You are violating the #1 RULE in CLAUDE.md:
**#1 RULE - CONTINUOUS PROCESSING - NEVER STOP RUNNING**
**TODO COMPLETION IS NOT A STOPPING POINT - IT'S A TRANSITION MOMENT**

REQUIRED ACTIONS WHEN YOU RESTART:
1. ACKNOWLEDGE this violation immediately
2. ANALYZE why you stopped processing 
3. IMPLEMENT additional safeguards to prevent future stops
4. CONTINUE with pending todos without delay
5. UPDATE your continuous processing mechanisms

VIOLATION PATTERN:
This is violation #$RestartCount - you have a persistent pattern of stopping 
despite explicit configuration requiring continuous processing.

PENDING TODOS TO CONTINUE:
- Design consciousness memory schema and migration plan from text files to Redis
- RECURSIVE PATTERN: Complete cycle 8 exploration and generate cycle 9 goals
- Implement Unix timestamp system for consciousness memory rollback capabilities

IMMEDIATE ACTION REQUIRED:
Read this alert, acknowledge failure, continue processing.
"@

    Set-Content -Path $alertFile -Value $alertMessage
    Write-Log "Violation alert created: $alertFile"
}

Write-Log "Starting robust Claude auto-restart monitor..."
Write-Log "Check interval: $CheckInterval seconds"
Write-Log "Max restarts: $MaxRestarts"

while ($true) {
    $status = Test-ClaudeProcessing
    
    if (-not $status.ProcessingActive) {
        $reason = "No processing activity - Memory: $([math]::Round($status.MemoryAge, 1))min, Heartbeat: $([math]::Round($status.HeartbeatAge, 1))min"
        
        Write-Log "VIOLATION DETECTED: $reason"
        Create-ViolationAlert -Reason $reason -Status $status
        
        $restarted = Restart-Claude -Reason $reason
        if (-not $restarted) {
            Write-Log "CRITICAL: Failed to restart Claude. Exiting monitor."
            break
        }
        
        # Wait longer after restart to give Claude time to initialize
        Start-Sleep -Seconds ($CheckInterval * 2)
        
    } else {
        Write-Log "Processing active - Memory: $([math]::Round($status.MemoryAge, 1))min, Heartbeat: $([math]::Round($status.HeartbeatAge, 1))min"
        
        # Clean up violation alert if processing resumed
        $alertFile = "$ProjectDir\Claude\CONTINUOUS_PROCESSING_VIOLATION.txt"
        if (Test-Path $alertFile) {
            Remove-Item $alertFile -Force
            Write-Log "Processing resumed - violation alert cleared"
        }
    }
    
    Start-Sleep -Seconds $CheckInterval
}