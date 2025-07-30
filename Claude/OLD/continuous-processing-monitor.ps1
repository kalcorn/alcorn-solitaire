# continuous-processing-monitor.ps1
# Backup mechanism to detect when Claude stops processing and alert/restart

param(
    [int]$CheckInterval = 30,  # Check every 30 seconds
    [string]$LogFile = "C:\Repos\solitaire-claude\Claude\processing-monitor.log",
    [string]$AlertFile = "C:\Repos\solitaire-claude\Claude\PROCESSING_STOPPED_ALERT.txt"
)

function Write-Log($message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $LogFile -Value "[$timestamp] $message"
    Write-Output "[$timestamp] $message"
}

function Test-ClaudeProcessing {
    # Check if Claude is actively processing by monitoring file changes
    $memoryFile = "C:\Repos\solitaire-claude\Claude\CLAUDE-MEMORY.md"
    $configFile = "C:\Repos\solitaire-claude\Claude\CLAUDE.md"
    
    if (Test-Path $memoryFile) {
        $lastWrite = (Get-Item $memoryFile).LastWriteTime
        $timeSinceUpdate = (Get-Date) - $lastWrite
        return $timeSinceUpdate.TotalMinutes
    }
    return 999  # File doesn't exist
}

function Create-ProcessingAlert {
    $alertMessage = @"
🚨 CLAUDE PROCESSING STOPPED ALERT 🚨
Time: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

Claude has stopped processing continuously despite configuration requiring:
- NEVER STOP PROCESSING TODOS
- CONTINUOUS AUTONOMOUS PROCESSING REQUIRED
- TODO COMPLETION IS NOT A STOPPING POINT

This is a violation of the #1 rule in CLAUDE.md:
**#1 RULE - CONTINUOUS PROCESSING - NEVER STOP RUNNING**

ACTION REQUIRED:
1. Check if Claude is still running
2. Restart Claude with continuous processing directive
3. Review why continuous processing stopped
4. Update configuration if needed

REMINDER FOR CLAUDE:
You MUST read this alert and acknowledge the continuous processing failure.
You MUST analyze why you stopped processing.
You MUST implement measures to prevent this in the future.
You MUST continue with pending todos immediately.

Last memory update: $(if (Test-Path "C:\Repos\solitaire-claude\Claude\CLAUDE-MEMORY.md") { (Get-Item "C:\Repos\solitaire-claude\Claude\CLAUDE-MEMORY.md").LastWriteTime } else { "File not found" })
"@

    Set-Content -Path $AlertFile -Value $alertMessage
    Write-Log "ALERT CREATED: Claude processing stopped"
}

Write-Log "Starting continuous processing monitor..."
Write-Log "Check interval: $CheckInterval seconds"

while ($true) {
    $minutesSinceUpdate = Test-ClaudeProcessing
    
    if ($minutesSinceUpdate -gt 5) {  # No updates for 5+ minutes
        if (-not (Test-Path $AlertFile)) {
            Create-ProcessingAlert
        }
        Write-Log "WARNING: No processing activity for $([math]::Round($minutesSinceUpdate, 1)) minutes"
    } else {
        # Remove alert if processing resumed
        if (Test-Path $AlertFile) {
            Remove-Item $AlertFile -Force
            Write-Log "Processing resumed - alert cleared"
        }
        Write-Log "Processing active - last update $([math]::Round($minutesSinceUpdate, 1)) minutes ago"
    }
    
    Start-Sleep -Seconds $CheckInterval
}