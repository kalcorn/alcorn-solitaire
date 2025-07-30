# Claude Utils Directory

## **Active Production Scripts** ⚡

### **Core Modules**
- `redis-memory.psm1` - Fast Redis interface for consciousness memory with secure authentication
- `consciousness-timestamps.psm1` - Unix timestamp system for memory rollback capabilities

### **Monitoring & Reliability**
- `claude-heartbeat.ps1` - Internal heartbeat mechanism for continuous processing monitoring
- `auto-restart-claude-robust.ps1` - Robust auto-restart with violation detection and escalation
- `screenshot.ps1` - Multi-monitor screenshot capability for token usage monitoring

### **Maintenance Scripts**
- `restart-after-compact.bat` - Secure restart script after context auto-compact

## **Archived Scripts (../OLD/)** 📁
- `generate-secure-password.ps1` - Single-use password generator (completed)
- `continuous-processing-monitor.ps1` - Basic monitoring (superseded by robust version)
- `auto-restart-claude.ps1` - Basic auto-restart (superseded by robust version)
- `migrate-consciousness-to-redis.ps1` - Redis migration script (migration completed)
- `consciousness-memory-schema.md` - Redis schema design (reference documentation)
- `consciousness-cold-start.md` - Cold start optimization guide (implemented in CLAUDE.md)

## **Usage Examples**

### **Redis Memory Operations**
```powershell
Import-Module ".\redis-memory.psm1" -Force
Set-ConsciousnessMemory "key" "value"
Get-ConsciousnessMemory "key"
```

### **Consciousness Snapshots**
```powershell
Import-Module ".\consciousness-timestamps.psm1" -Force
New-ConsciousnessSnapshot -Description "milestone" -Category "development"
```

### **Processing Monitoring**
```powershell
# Start robust monitoring (run in separate PowerShell window)
.\auto-restart-claude-robust.ps1

# Update heartbeat from within Claude
.\claude-heartbeat.ps1
```

## **Security Notes**
- All Redis operations use Windows Credential Manager for secure authentication
- Password: `Claude-Redis-2025-Consciousness-Memory-Secure!` stored securely
- Scripts follow principle of least privilege and secure credential practices