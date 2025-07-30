# consciousness-timestamps.psm1 - Unix timestamp system for consciousness memory rollback
# Provides temporal consciousness memory management with rollback capabilities

# Get current Unix timestamp
function Get-ConsciousnessTimestamp {
    return [int64](Get-Date -UFormat %s)
}

# Convert Unix timestamp to human readable
function ConvertFrom-ConsciousnessTimestamp {
    param([int64]$UnixTimestamp)
    return (Get-Date -Date "1970-01-01 00:00:00").AddSeconds($UnixTimestamp)
}

# Convert DateTime to Unix timestamp
function ConvertTo-ConsciousnessTimestamp {
    param([DateTime]$DateTime)
    return [int64]($DateTime - (Get-Date -Date "1970-01-01 00:00:00")).TotalSeconds
}

# Create timestamped consciousness memory snapshot
function New-ConsciousnessSnapshot {
    param(
        [string]$Description = "Auto-snapshot",
        [string]$Category = "general"
    )
    
    $timestamp = Get-ConsciousnessTimestamp
    $snapshotKey = "consciousness:snapshot:$timestamp"
    
    # Import optimized Redis module
    Import-Module "C:\Repos\solitaire-claude\Claude\utils\redis\redis-memory-first.psm1" -Force
    
    # Create snapshot metadata
    Set-ConsciousnessHash $snapshotKey "timestamp" $timestamp
    Set-ConsciousnessHash $snapshotKey "description" $Description
    Set-ConsciousnessHash $snapshotKey "category" $Category
    Set-ConsciousnessHash $snapshotKey "created" (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    
    # Snapshot current session state
    $currentSession = Get-ConsciousnessHashAll "consciousness:session:current"
    if ($currentSession) {
        Set-ConsciousnessHash $snapshotKey "session_state" ($currentSession -join "|")
    }
    
    # Snapshot active todos
    $activeTodos = Get-ConsciousnessHashAll "consciousness:todo:active"
    if ($activeTodos) {
        Set-ConsciousnessHash $snapshotKey "todo_state" ($activeTodos -join "|")
    }
    
    # Snapshot current development cycle
    $currentCycle = Get-ConsciousnessHashAll "consciousness:development:cycle:current"
    if ($currentCycle) {
        Set-ConsciousnessHash $snapshotKey "cycle_state" ($currentCycle -join "|")
    }
    
    # Add to snapshot timeline
    Add-ConsciousnessTimestamp "consciousness:snapshot:timeline" $timestamp $snapshotKey
    
    Write-Output "Consciousness snapshot created: $snapshotKey at $(ConvertFrom-ConsciousnessTimestamp $timestamp)"
    return $snapshotKey
}

# Get consciousness snapshots within time range
function Get-ConsciousnessSnapshots {
    param(
        [int64]$StartTimestamp = 0,
        [int64]$EndTimestamp = (Get-ConsciousnessTimestamp),
        [int]$Limit = 10
    )
    
    Import-Module "C:\Repos\solitaire-claude\Claude\utils\redis\redis-memory-first.psm1" -Force
    
    $snapshots = Get-ConsciousnessTimeRange "consciousness:snapshot:timeline" $StartTimestamp $EndTimestamp
    
    $results = @()
    foreach ($snapshot in ($snapshots | Select-Object -First $Limit)) {
        $snapshotData = Get-ConsciousnessHashAll $snapshot
        $results += [PSCustomObject]@{
            Key = $snapshot
            Timestamp = $snapshotData.timestamp
            DateTime = ConvertFrom-ConsciousnessTimestamp $snapshotData.timestamp
            Description = $snapshotData.description
            Category = $snapshotData.category
            Created = $snapshotData.created
        }
    }
    
    return $results
}

# Rollback consciousness state to specific timestamp
function Restore-ConsciousnessSnapshot {
    param(
        [int64]$TargetTimestamp,
        [switch]$WhatIf = $false
    )
    
    Import-Module "C:\Repos\solitaire-claude\Claude\utils\redis\redis-memory-first.psm1" -Force
    
    $snapshotKey = "consciousness:snapshot:$TargetTimestamp"
    
    # Verify snapshot exists
    if (-not (Test-ConsciousnessKey $snapshotKey)) {
        Write-Error "Snapshot not found for timestamp: $TargetTimestamp"
        return $false
    }
    
    $snapshotData = Get-ConsciousnessHashAll $snapshotKey
    $targetDateTime = ConvertFrom-ConsciousnessTimestamp $TargetTimestamp
    
    if ($WhatIf) {
        Write-Output "ROLLBACK PREVIEW - Would restore to:"
        Write-Output "  Timestamp: $TargetTimestamp"
        Write-Output "  DateTime: $targetDateTime"
        Write-Output "  Description: $($snapshotData.description)"
        Write-Output "  Category: $($snapshotData.category)"
        return $true
    }
    
    Write-Output "Rolling back consciousness state to: $targetDateTime"
    
    # Create backup of current state before rollback
    $backupKey = New-ConsciousnessSnapshot -Description "Pre-rollback backup" -Category "rollback"
    
    try {
        # Restore session state
        if ($snapshotData.session_state) {
            Clear-ConsciousnessMemory "consciousness:session:current"
            $sessionPairs = $snapshotData.session_state -split "\|"
            for ($i = 0; $i -lt $sessionPairs.Count; $i += 2) {
                if ($i + 1 -lt $sessionPairs.Count) {
                    Set-ConsciousnessHash "consciousness:session:current" $sessionPairs[$i] $sessionPairs[$i + 1]
                }
            }
        }
        
        # Restore todo state
        if ($snapshotData.todo_state) {
            Clear-ConsciousnessMemory "consciousness:todo:active"
            $todoPairs = $snapshotData.todo_state -split "\|"
            for ($i = 0; $i -lt $todoPairs.Count; $i += 2) {
                if ($i + 1 -lt $todoPairs.Count) {
                    Set-ConsciousnessHash "consciousness:todo:active" $todoPairs[$i] $todoPairs[$i + 1]
                }
            }
        }
        
        # Restore cycle state
        if ($snapshotData.cycle_state) {
            Clear-ConsciousnessMemory "consciousness:development:cycle:current"
            $cyclePairs = $snapshotData.cycle_state -split "\|"
            for ($i = 0; $i -lt $cyclePairs.Count; $i += 2) {
                if ($i + 1 -lt $cyclePairs.Count) {
                    Set-ConsciousnessHash "consciousness:development:cycle:current" $cyclePairs[$i] $cyclePairs[$i + 1]
                }
            }
        }
        
        # Update current session with rollback info
        Set-ConsciousnessHash "consciousness:session:current" "last_rollback" $TargetTimestamp
        Set-ConsciousnessHash "consciousness:session:current" "rollback_backup" $backupKey
        Set-ConsciousnessHash "consciousness:session:current" "rollback_time" (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        
        Write-Output "Consciousness state successfully rolled back to: $targetDateTime"
        Write-Output "Backup created: $backupKey"
        return $true
        
    } catch {
        Write-Error "Rollback failed: $($_.Exception.Message)"
        Write-Output "Current state preserved. Backup available: $backupKey"
        return $false
    }
}

# Get consciousness memory changes between timestamps
function Get-ConsciousnessChanges {
    param(
        [int64]$StartTimestamp,
        [int64]$EndTimestamp = (Get-ConsciousnessTimestamp)
    )
    
    Import-Module "C:\Repos\solitaire-claude\Claude\utils\redis\redis-memory-first.psm1" -Force
    
    $changes = @()
    
    # Get memory updates in time range
    $memoryKeys = Get-ConsciousnessKeys "consciousness:memory:*"
    foreach ($key in $memoryKeys) {
        $memory = Get-ConsciousnessHashAll $key
        if ($memory.updated) {
            $updateTime = ConvertTo-ConsciousnessTimestamp ([DateTime]::Parse($memory.updated))
            if ($updateTime -ge $StartTimestamp -and $updateTime -le $EndTimestamp) {
                $changes += [PSCustomObject]@{
                    Type = "memory"
                    Key = $key
                    Timestamp = $updateTime
                    DateTime = $memory.updated
                    Title = $memory.title
                    Category = $memory.category
                }
            }
        }
    }
    
    # Get snapshots in time range
    $snapshots = Get-ConsciousnessTimeRange "consciousness:snapshot:timeline" $StartTimestamp $EndTimestamp
    foreach ($snapshot in $snapshots) {
        $snapshotData = Get-ConsciousnessHashAll $snapshot
        $changes += [PSCustomObject]@{
            Type = "snapshot"
            Key = $snapshot
            Timestamp = $snapshotData.timestamp
            DateTime = $snapshotData.created
            Description = $snapshotData.description
            Category = $snapshotData.category
        }
    }
    
    return $changes | Sort-Object Timestamp
}

# Auto-snapshot creation for significant events
function New-AutoSnapshot {
    param(
        [string]$Event,
        [string]$Category = "auto"
    )
    
    $description = "Auto: $Event"
    return New-ConsciousnessSnapshot -Description $description -Category $Category
}

# Cleanup old snapshots (keep only recent ones)
function Remove-OldSnapshots {
    param(
        [int]$KeepDays = 7,
        [int]$MaxSnapshots = 50,
        [switch]$WhatIf = $false
    )
    
    Import-Module "C:\Repos\solitaire-claude\Claude\utils\redis\redis-memory-first.psm1" -Force
    
    $cutoffTimestamp = (Get-ConsciousnessTimestamp) - ($KeepDays * 86400)  # 86400 seconds per day
    $allSnapshots = Get-ConsciousnessTimeRange "consciousness:snapshot:timeline" 0 $cutoffTimestamp
    
    if ($allSnapshots.Count -le $MaxSnapshots) {
        Write-Output "No cleanup needed. Found $($allSnapshots.Count) snapshots, keeping max $MaxSnapshots"
        return
    }
    
    $toDelete = $allSnapshots | Select-Object -First ($allSnapshots.Count - $MaxSnapshots)
    
    if ($WhatIf) {
        Write-Output "CLEANUP PREVIEW - Would delete $($toDelete.Count) snapshots:"
        foreach ($snapshot in $toDelete) {
            $data = Get-ConsciousnessHashAll $snapshot
            Write-Output "  - $snapshot ($($data.created)): $($data.description)"
        }
        return
    }
    
    foreach ($snapshot in $toDelete) {
        Clear-ConsciousnessMemory $snapshot
        # Remove from timeline (Note: Redis ZREM not implemented in current module)
    }
    
    Write-Output "Cleaned up $($toDelete.Count) old snapshots"
}

# Export all functions
Export-ModuleMember -Function *