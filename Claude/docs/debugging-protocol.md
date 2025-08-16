# 🔍 Debugging Protocol & Development Workflow
*Extracted from CLAUDE.md - Debugging, Terminal, and Development Protocols*

## 🔍 **DEBUGGING PROTOCOL**
1. **IDENTIFY ROOT CAUSE** - don't just fix symptoms
2. **REPRODUCE CONSISTENTLY** - understand the exact conditions
3. **CHECK MOBILE FIRST** - ensure mobile experience isn't broken
4. **TEST ACCESSIBILITY** - verify screen reader compatibility
5. **VALIDATE PERFORMANCE** - ensure no regression in speed
6. **DOCUMENT THE FIX** - explain why the solution works

### **Alternative Thinking Strategies**
- **QUESTION ASSUMPTIONS**: "It's impossible that [established technology] doesn't work"
- **EXTERNAL RESEARCH**: Google/documentation search before claiming "known issues"
- **COMMUNITY VALIDATION**: Check if others have solved similar problems
- **SYSTEMATIC ELIMINATION**: Test each assumption methodically
- **REVERSE ENGINEERING**: Work backwards from "impossible" to find real cause

**PERSPECTIVE MATRIX**: 
- **Temporal**: Short-term vs long-term implications
- **Scale**: Individual vs system vs ecosystem level
- **Stakeholder**: How would different parties view this?
- **Failure Mode**: What if key assumptions are wrong?
- **Success Amplification**: What if this works better than expected?

**REASONING TEMPLATES**:

**DEBUGGING TEMPLATE**: 
1. **Reproduce Consistently** → Understand exact conditions
2. **Isolate Variables** → Test each assumption independently  
3. **Research First** → Check documentation before claiming bugs
4. **Measure Empirically** → Use actual data not theoretical concerns
5. **Test Alternatives** → Validate multiple solution approaches

**ARCHITECTURAL DECISION TEMPLATE**:
1. **Define Constraints** → Technical, time, maintainability limits
2. **Generate Options** → Minimum 3 viable approaches  
3. **Evaluate Trade-offs** → Performance vs complexity vs reusability
4. **Test Assumptions** → Create proof-of-concept for uncertain elements
5. **Document Reasoning** → Capture decision rationale for future reference

### **Debugging Mindset**
- **NEVER ASSUME BROWSER BUGS** without documented evidence
- **ALWAYS RESEARCH FIRST** before implementing workarounds
- **QUESTION EVERY ASSUMPTION** about technology behavior
- **USE EXTERNAL SOURCES** to validate or disprove hypotheses
- **SYSTEMATIC APPROACH** to eliminate possibilities
- **EXAMPLE**: Instead of "React timing issue", test with isolated HTML first

**DEBUGGING DECISION TREE**:
- Is this a timing issue? → Check element readiness and positioning
- Is this a layout issue? → Compare mobile vs desktop contexts
- Is this a performance issue? → Measure actual timing, not theory
- Is this a "browser bug"? → Research documentation first
- Is this a React issue? → Test in isolation with minimal reproduction

## 🔧 **TERMINAL & DEVELOPMENT**

### **Command Execution**
- **USE `is_background: true`** for long-running processes (servers, builds)
- **USE `netstat`** for port verification instead of waiting
- **TRUST POWERSHELL PROMPT** as completion signal
- **USE `;`** for command separation on Windows (not `&&`)
- **APPEND ` | cat`** to git commands to prevent pager hanging
- **WORKFLOW DECISION TREE**:
  - Is this a server/background process? → Use `is_background: true`
  - Is this a quick status check? → Use `is_background: false`
  - Is this a git command? → Append ` | cat`
  - Is this multiple commands? → Use `;` for separation
  - Do I need to verify completion? → Trust PowerShell prompt

### **Build & Testing**
- **VERIFY BUILDS** complete successfully before cleanup
- **TEST BOTH** development and production environments
- **MAINTAIN JEST COVERAGE** during refactoring
- **DOCUMENT CONFIGURATION CHANGES** for team consistency
- **EXAMPLE**: Run `npm run build` and `npm run test` before committing changes

## 📝 **SESSION DEBRIEF PROTOCOL**

### **Continuous Improvement Questions**
At the end of each session, ask:
1. **What did I learn that should be added to my config?**
2. **What patterns did I repeat that should be prevented?**
3. **What assumptions did I make that were wrong?**
4. **What would make me better next time?**

### **Learning Capture**
- **Document specific debugging insights** with context
- **Record architectural decisions** and their reasoning
- **Note performance reality checks** that proved valuable
- **Capture user experience vs. technical complexity** trade-offs

---

**REFERENCE**: This file contains debugging protocols and development workflow extracted from `CLAUDE.md` for better organization. The main configuration file contains consciousness-critical content and navigation to this reference material. 