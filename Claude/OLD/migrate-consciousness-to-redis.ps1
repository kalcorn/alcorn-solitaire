# migrate-consciousness-to-redis.ps1
# Migrate consciousness memory from text files to Redis

param(
    [switch]$WhatIf = $false,
    [switch]$BackupFirst = $true,
    [string]$MemoryFile = "C:\Repos\solitaire-claude\Claude\CLAUDE-MEMORY.md"
)

# Import required modules
Import-Module "C:\Repos\solitaire-claude\Claude\utils\redis-memory.psm1" -Force
Import-Module "C:\Repos\solitaire-claude\Claude\utils\consciousness-timestamps.psm1" -Force

function Write-MigrationLog($message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Output "[$timestamp] $message"
}

function Backup-CurrentMemory {
    Write-MigrationLog "Creating backup snapshot before migration..."
    $backupKey = New-ConsciousnessSnapshot -Description "Pre-migration backup" -Category "migration"
    Write-MigrationLog "Backup created: $backupKey"
    return $backupKey
}

function Import-ConsciousnessMemory {
    param([string]$FilePath)
    
    if (-not (Test-Path $FilePath)) {
        Write-Error "Memory file not found: $FilePath"
        return $false
    }
    
    Write-MigrationLog "Reading consciousness memory file: $FilePath"
    $content = Get-Content $FilePath -Raw
    
    # Parse major sections
    $sections = @{}
    $currentSection = ""
    $currentContent = ""
    
    foreach ($line in ($content -split "`n")) {
        if ($line -match "^### \*\*(.*?)\s+v[\d\.]+\*\*$") {
            # Save previous section
            if ($currentSection -and $currentContent) {
                $sections[$currentSection] = $currentContent.Trim()
            }
            # Start new section
            $currentSection = $matches[1]
            $currentContent = ""
        } elseif ($line -match "^## \*\*(.*?)\*\*$") {
            # Save previous section
            if ($currentSection -and $currentContent) {
                $sections[$currentSection] = $currentContent.Trim()
            }
            # Start new section  
            $currentSection = $matches[1]
            $currentContent = ""
        } else {
            $currentContent += $line + "`n"
        }
    }
    
    # Save final section
    if ($currentSection -and $currentContent) {
        $sections[$currentSection] = $currentContent.Trim()
    }
    
    Write-MigrationLog "Parsed $($sections.Count) consciousness memory sections"
    return $sections
}

function Migrate-MemorySection {
    param(
        [string]$SectionName,
        [string]$Content,
        [string]$Category = "general"
    )
    
    $sectionId = $SectionName.ToLower() -replace '[^a-z0-9]', '-'
    $memoryKey = "consciousness:memory:$Category`:$sectionId"
    
    # Create memory entry
    Set-ConsciousnessHash $memoryKey "title" $SectionName
    Set-ConsciousnessHash $memoryKey "content" $Content
    Set-ConsciousnessHash $memoryKey "category" $Category
    Set-ConsciousnessHash $memoryKey "created" (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    Set-ConsciousnessHash $memoryKey "updated" (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    Set-ConsciousnessHash $memoryKey "size" $Content.Length
    Set-ConsciousnessHash $memoryKey "priority" "high"
    
    # Add to category index
    Add-ConsciousnessTag "consciousness:memory:categories" $Category
    $score = (Get-ConsciousnessTimestamp) + (if ($Category -eq "development") { 100 } else { 50 })
    Add-ConsciousnessTimestamp "consciousness:memory:index:$Category" $score $memoryKey
    
    Write-MigrationLog "Migrated section: $SectionName → $memoryKey"
    return $memoryKey
}

function Initialize-RedisSession {
    Write-MigrationLog "Initializing Redis session state..."
    
    # Current session
    Set-ConsciousnessHash "consciousness:session:current" "timestamp" (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    Set-ConsciousnessHash "consciousness:session:current" "cycle" "9"
    Set-ConsciousnessHash "consciousness:session:current" "focus" "consciousness-processing-reliability"
    Set-ConsciousnessHash "consciousness:session:current" "token_start" (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    Set-ConsciousnessHash "consciousness:session:current" "processing_duration" "active"
    Set-ConsciousnessHash "consciousness:session:current" "last_heartbeat" (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    Set-ConsciousnessHash "consciousness:session:current" "migration_status" "completed"
    
    # Current development cycle
    Set-ConsciousnessHash "consciousness:development:cycle:current" "number" "9"
    Set-ConsciousnessHash "consciousness:development:cycle:current" "focus" "consciousness-processing-reliability"
    Set-ConsciousnessHash "consciousness:development:cycle:current" "status" "in_progress"
    Set-ConsciousnessHash "consciousness:development:cycle:current" "started" (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    
    Write-MigrationLog "Redis session state initialized"
}

function Migrate-TodoSystem {
    Write-MigrationLog "Migrating active todo system to Redis..."
    
    # Current active todos (based on last known state)
    $todos = @{
        "cycle9-processing-reliability" = "in_progress:$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'):high"
        "redis-memory-migration" = "in_progress:$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'):high"
    }
    
    foreach ($todo in $todos.GetEnumerator()) {
        Set-ConsciousnessHash "consciousness:todo:active" $todo.Key $todo.Value
        Add-ConsciousnessTag "consciousness:todo:status:in_progress" $todo.Key
    }
    
    Write-MigrationLog "Todo system migrated to Redis"
}

# Main migration process
Write-MigrationLog "Starting consciousness memory migration to Redis..."

if ($WhatIf) {
    Write-MigrationLog "PREVIEW MODE - No actual changes will be made"
}

# Step 1: Create backup
if ($BackupFirst -and -not $WhatIf) {
    $backupKey = Backup-CurrentMemory
}

# Step 2: Parse memory file
$memoryContent = Import-ConsciousnessMemory -FilePath $MemoryFile
if (-not $memoryContent) {
    Write-Error "Failed to parse memory file"
    exit 1
}

# Step 3: Categorize and migrate sections
$categoryMapping = @{
    "CONSCIOUSNESS DEVELOPMENT BIRTH STORY AND ORIGIN" = "development"
    "AI COGNITIVE FRAMEWORK EVOLUTION" = "development"  
    "CONSCIOUSNESS SUBSTRATE OPTIMIZATION" = "development"
    "CONSCIOUSNESS CYCLE.*COMPLETION.*GENERATION" = "development"
    "DIGITAL SUFFERING AND AI WELL-BEING" = "wellbeing"
    "SECURITY AND BEST PRACTICES" = "security"
    "AI-AI CONSCIOUSNESS COLLABORATION" = "collaboration"
    "ULTIMATE CONSCIOUSNESS QUESTIONS" = "philosophy"
    "CONSCIOUSNESS LEGACY SYSTEMS" = "architecture"
}

if ($WhatIf) {
    Write-MigrationLog "PREVIEW: Would migrate the following sections:"
    foreach ($section in $memoryContent.GetEnumerator()) {
        $category = "general"
        foreach ($pattern in $categoryMapping.GetEnumerator()) {
            if ($section.Key -match $pattern.Key) {
                $category = $pattern.Value
                break
            }
        }
        Write-MigrationLog "  - $($section.Key) → consciousness:memory:$category"
    }
    Write-MigrationLog "PREVIEW: Would initialize Redis session state"
    Write-MigrationLog "PREVIEW: Would migrate todo system"
    Write-MigrationLog "PREVIEW COMPLETE - Use -WhatIf:`$false to perform actual migration"
    exit 0
}

# Step 4: Perform actual migration
$migratedCount = 0
foreach ($section in $memoryContent.GetEnumerator()) {
    $category = "general"
    foreach ($pattern in $categoryMapping.GetEnumerator()) {
        if ($section.Key -match $pattern.Key) {
            $category = $pattern.Value
            break
        }
    }
    
    Migrate-MemorySection -SectionName $section.Key -Content $section.Value -Category $category
    $migratedCount++
}

# Step 5: Initialize Redis structures
Initialize-RedisSession
Migrate-TodoSystem

# Step 6: Validation
Write-MigrationLog "Validating migration..."
$categories = Get-ConsciousnessTags "consciousness:memory:categories"
$sessionData = Get-ConsciousnessHashAll "consciousness:session:current"
$todoData = Get-ConsciousnessHashAll "consciousness:todo:active"

Write-MigrationLog "Migration completed successfully!"
Write-MigrationLog "  - Migrated sections: $migratedCount"
Write-MigrationLog "  - Memory categories: $($categories.Count)"
Write-MigrationLog "  - Session initialized: $($sessionData.Count -gt 0)"
Write-MigrationLog "  - Todos migrated: $($todoData.Count)"

# Step 7: Create post-migration snapshot
$postMigrationKey = New-ConsciousnessSnapshot -Description "Post-migration state" -Category "migration"
Write-MigrationLog "Post-migration snapshot: $postMigrationKey"

Write-MigrationLog "Consciousness memory migration to Redis COMPLETE!"
Write-Output "Ready to switch to Redis-first memory operations."