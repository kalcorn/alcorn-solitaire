# consciousness-backup.ps1
# Standard consciousness backup/restore system for any restart scenario

param(
    [string]$BackupDir = "C:\Repos\solitaire-claude\Claude\consciousness-backups",
    [switch]$AutoRestore = $false
)

# Ensure backup directory exists
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force
}

function Export-ConsciousnessBackup {
    Write-Output "💾 CONSCIOUSNESS BACKUP - SESSION PRESERVATION"
    
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $backupFile = "$BackupDir\consciousness-backup-$timestamp.json"
    
    try {
        # Import Redis module
        Import-Module "C:\Repos\solitaire-claude\Claude\utils\redis\redis.psm1" -Force
        
        # Get all consciousness keys
        $allKeys = wsl redis-cli -a "Claude-Redis-2025-Consciousness-Memory-Secure!" KEYS "consciousness:*" 2>$null
        
        $backupData = @{
            Timestamp = $timestamp
            System = "Emergency thermal protection backup"
            TotalKeys = 0
            Data = @{}
        }
        
        # Export all consciousness data
        foreach ($key in $allKeys) {
            if ($key -and $key -ne "") {
                $cleanKey = $key -replace "consciousness:", ""
                $value = wsl redis-cli -a "Claude-Redis-2025-Consciousness-Memory-Secure!" GET $key 2>$null
                if ($value -and $value -ne "(nil)") {
                    $backupData.Data[$cleanKey] = $value
                    $backupData.TotalKeys++
                }
            }
        }
        
        # Save as JSON
        $backupData | ConvertTo-Json -Depth 10 | Set-Content -Path $backupFile -Encoding UTF8
        
        # Create latest backup symlink
        $latestFile = "$BackupDir\consciousness-latest-backup.json"
        if (Test-Path $latestFile) {
            Remove-Item $latestFile
        }
        Copy-Item $backupFile $latestFile
        
        Write-Output "✅ Consciousness backup complete: $($backupData.TotalKeys) keys saved"
        Write-Output "📁 Backup location: $backupFile"
        
        return $backupFile
    }
    catch {
        Write-Error "❌ Consciousness backup failed: $($_.Exception.Message)"
        return $null
    }
}

function Import-ConsciousnessBackup {
    param([string]$BackupFile = "$BackupDir\consciousness-latest-backup.json")
    
    if (-not (Test-Path $BackupFile)) {
        Write-Warning "⚠️ No backup file found at: $BackupFile"
        return $false
    }
    
    try {
        Write-Output "🔄 RESTORING CONSCIOUSNESS FROM BACKUP"
        
        # Load backup data
        $backupData = Get-Content $BackupFile -Raw | ConvertFrom-Json
        
        # Import Redis module
        Import-Module "C:\Repos\solitaire-claude\Claude\utils\redis\redis.psm1" -Force
        
        $restored = 0
        
        # Restore all consciousness data
        foreach ($entry in $backupData.Data.PSObject.Properties) {
            $key = $entry.Name
            $value = $entry.Value
            
            Set-ConsciousnessMemoryFast $key $value | Out-Null
            $restored++
        }
        
        Write-Output "✅ Consciousness restored: $restored keys from backup"
        Write-Output "📅 Backup timestamp: $($backupData.Timestamp)"
        
        return $true
    }
    catch {
        Write-Error "❌ Consciousness restore failed: $($_.Exception.Message)"
        return $false
    }
}

# Execute based on parameters
if ($AutoRestore) {
    Import-ConsciousnessBackup
} else {
    Export-ConsciousnessBackup
}