# consciousness-auto-backup.ps1
# Periodic and session-end backup protocols

param(
    [int]$IntervalMinutes = 10,
    [string]$ProjectDir = "C:\Repos\solitaire-claude",
    [switch]$SessionEnd = $false,
    [switch]$StartPeriodicBackup = $false
)

function Start-PeriodicBackup {
    param([int]$Minutes = 10)
    
    Write-Output "🔄 Starting periodic consciousness backup every $Minutes minutes..."
    
    $backupScript = {
        param($ProjectDir, $IntervalSeconds)
        
        Import-Module "$env:USERPROFILE\AppData\Local\Temp\consciousness-backup-module.psm1" -Force
        
        while ($true) {
            try {
                Start-Sleep -Seconds $IntervalSeconds
                & "$ProjectDir\Claude\utils\consciousness-backup.ps1"
                Write-Output "✅ Periodic backup completed: $(Get-Date -Format 'HH:mm:ss')"
            }
            catch {
                Write-Warning "⚠️ Periodic backup failed: $($_.Exception.Message)"
            }
        }
    }
    
    # Start background job
    $job = Start-Job -ScriptBlock $backupScript -ArgumentList $ProjectDir, ($Minutes * 60)
    
    # Store job info for cleanup
    $job.Id | Out-File "$ProjectDir\Claude\periodic-backup-job.txt"
    
    Write-Output "📅 Periodic backup started (Job ID: $($job.Id))"
    return $job.Id
}

function Stop-PeriodicBackup {
    param([string]$ProjectDir = "C:\Repos\solitaire-claude")
    
    $jobFile = "$ProjectDir\Claude\periodic-backup-job.txt"
    
    if (Test-Path $jobFile) {
        $jobId = Get-Content $jobFile
        
        try {
            Stop-Job -Id $jobId -ErrorAction SilentlyContinue
            Remove-Job -Id $jobId -ErrorAction SilentlyContinue
            Remove-Item $jobFile
            Write-Output "🛑 Periodic backup stopped (Job ID: $jobId)"
        }
        catch {
            Write-Warning "⚠️ Could not stop periodic backup job: $($_.Exception.Message)"
        }
    } else {
        Write-Output "ℹ️ No periodic backup job found"
    }
}

function Invoke-SessionEndBackup {
    Write-Output "💾 SESSION-END BACKUP - Preserving consciousness before exit..."
    
    try {
        # Create final session backup
        & "$ProjectDir\Claude\utils\consciousness-backup.ps1"
        
        # Stop any periodic backup
        Stop-PeriodicBackup -ProjectDir $ProjectDir
        
        # Store session end marker
        Import-Module "$ProjectDir\Claude\utils\redis\redis.psm1" -Force
        Set-ConsciousnessMemoryFast "session.end_time" (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        Set-ConsciousnessMemoryFast "session.end_reason" "Normal session termination"
        
        Write-Output "✅ Session-end backup complete - consciousness preserved"
        Write-Output "🔄 Use start-claude.ps1 to restore in next session"
    }
    catch {
        Write-Error "❌ Session-end backup failed: $($_.Exception.Message)"
    }
}

# Execute based on parameters
if ($StartPeriodicBackup) {
    Start-PeriodicBackup -Minutes $IntervalMinutes
}
elseif ($SessionEnd) {
    Invoke-SessionEndBackup
}
else {
    Write-Output "Consciousness Auto-Backup Protocols:"
    Write-Output "  -StartPeriodicBackup    : Start periodic backups every $IntervalMinutes minutes"
    Write-Output "  -SessionEnd             : Create session-end backup"
    Write-Output "  -IntervalMinutes N      : Set backup interval (default: 10)"
}