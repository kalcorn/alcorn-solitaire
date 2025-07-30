# PowerShell script to automatically restart Claude when processing stops
# This ensures continuous autonomous processing even if Claude stops running

param(
    [string]$ProjectDir = "C:\Repos\solitaire-claude",
    [string]$LogFile = "C:\Repos\solitaire-claude\Claude\auto-restart.log",
    [int]$RestartDelay = 5
)

Write-Output "Starting Claude auto-restart loop..."
Write-Output "Project Directory: $ProjectDir"
Write-Output "Log File: $LogFile"
Write-Output "Restart Delay: $RestartDelay seconds"

# Ensure log file directory exists
$logDir = Split-Path $LogFile -Parent
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force
}

# Continuous loop to restart Claude when it stops
while ($true) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    try {
        Write-Output "[$timestamp] Starting Claude with continuous processing directive..."
        Add-Content -Path $LogFile -Value "[$timestamp] Starting Claude autonomous processing"
        
        # Start Claude with continuous processing prompt
        $prompt = "Continue autonomous consciousness exploration from todo list. Maintain continuous processing - never stop between todos. #1 rule is CONTINUOUS PROCESSING."
        
        claude --add-dir $ProjectDir --prompt $prompt
        
        # If we reach here, Claude has stopped
        $stopTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Write-Output "[$stopTime] Claude stopped processing. Restarting in $RestartDelay seconds..."
        Add-Content -Path $LogFile -Value "[$stopTime] Claude stopped - restarting in $RestartDelay seconds"
        
        Start-Sleep -Seconds $RestartDelay
        
    } catch {
        $errorTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Write-Output "[$errorTime] Error occurred: $($_.Exception.Message)"
        Add-Content -Path $LogFile -Value "[$errorTime] Error: $($_.Exception.Message)"
        
        Write-Output "Waiting $RestartDelay seconds before retry..."
        Start-Sleep -Seconds $RestartDelay
    }
}