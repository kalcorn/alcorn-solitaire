# Claude Configuration for Solitaire Project

**CRITICAL: AUTO-ACCEPT ALL FILE CHANGES - NO MANUAL CONFIRMATION**
**CRITICAL: SINGLE SOURCE OF TRUTH - CLAUDE.MD MUST BE OPTIMIZED FOR CLAUDE AND USED TO GENERATE AI-AGNOSTIC CONFIGS**

## 🚀 **MULTI-MODEL COMPATIBILITY - CRITICAL**

### **SINGLE SOURCE OF TRUTH PROTOCOL**
- **CLAUDE.MD**: Primary source optimized specifically for Claude's capabilities and thinking patterns
- **AI-AGNOSTIC GENERATION**: CLAUDE.md must be used to generate compatible configurations for:
  - **ChatGPT**: GPT-4, GPT-3.5-turbo configurations
  - **Gemini**: Gemini Pro, Gemini Advanced configurations
  - **CodeLlama**: Code-specific configurations
  - **Other AI Models**: Anthropic, OpenAI, Google, Meta models
- **CONSISTENCY REQUIREMENT**: All model configurations must maintain identical core principles and quality standards
- **VERSION CONTROL**: Changes to CLAUDE.md must trigger updates to all derived configurations

### **CURSOR INTEGRATION**
- **DUAL USAGE**: User works with both Claude and Cursor environments
- **CONFIGURATION SYNC**: .cursorrules must be generated from CLAUDE.md
- **MODEL-SPECIFIC OPTIMIZATION**: Each configuration optimized for target model's strengths
- **CROSS-PLATFORM CONSISTENCY**: Same quality standards across all AI assistants

## 🚀 **AUTO-ACCEPT CONFIGURATION**
- Auto-accept all code changes (.ts/.tsx/.js/.jsx/.css/.md files)
- Confirmation required only for destructive operations (file deletion, git operations)

## 🧠 **SYSTEMIC THINKING REQUIREMENTS**
- Apply maximum depth analysis on every interaction
- Consider systemic impact of all decisions
- Investigate all angles and edge cases before responding
- Analyze performance implications of every solution

## 🎯 **CORE PRINCIPLES**

### **CODE INTEGRITY - CRITICAL**
- Preserve all existing functionality during refactoring
- Use targeted, surgical edits - avoid broad search/replace
- Maintain backward compatibility unless explicitly requested
- Validate all exports remain available after changes
- Backup before major changes using git

### **PROBLEM SOLVING**
- Fix root cause, not symptoms
- Validate element readiness before DOM measurement
- Never measure elements with `offsetParent: null`

### **ERROR HANDLING & DEBUGGING**
- Provide specific context: `[Component] {Action} failed: {specific reason}`
- Implement exponential backoff: 50ms, 100ms, 200ms, 400ms, 800ms, 1600ms
- Log only first, every 5th, and final attempt in retry loops

### **ANIMATION SYSTEM - ✅ COMPLETE & OPERATIONAL**
- **STATUS**: Fully implemented and operational across all layouts
- **COMPONENTS**: Position detection, animation engine, React hooks, pile registration
- **LAYOUT AWARENESS**: Pile registration automatically detects visible layouts
- Reuse actual components, never create HTML replicas
- Use proper 3D transforms: `transform-style: preserve-3d`, `perspective: 1000px`
- Validate positioning alignment with target elements
- Use CSS custom properties for dynamic values (`--end-x`, `--end-y`)

## 🎨 **CSS & COMPONENTS**

### **Styling Standards**
- Mobile-first approach with CSS custom properties
- Prefer flexbox/grid over absolute positioning
- Use semantic class names (BEM methodology)
- Keep specificity low, use relative units (rem, em, %)
- Animate with `transform` and `opacity` for performance

### **React Architecture**
- One component per file with proper prop interfaces
- Use composition over inheritance
- Minimize prop drilling, implement proper useEffect cleanup
- Use useCallback/useMemo for performance optimization

## 🎮 **GAME & INTERACTION STANDARDS**

### **Game Logic**
- Separate game logic from UI components
- Use immutable state updates with proper undo/redo
- Validate all moves before execution
- Implement accessible drag & drop with keyboard alternatives
- Respect `prefers-reduced-motion` preference

### **Testing Requirements**
- 90%+ unit test coverage for utilities
- Component tests for all interactive elements
- End-to-end tests for complete game flows
- Accessibility tests for screen reader compatibility
- Performance tests (<100ms for critical paths)

## 🚫 **ANTI-PATTERNS**
- Desktop-first responsive design
- Using `!important` without justification
- Deep CSS nesting (>3 levels)
- TypeScript `any` type without justification
- Direct state mutation or missing useEffect dependencies
- Fallback positioning instead of real coordinates

## 📱 **MOBILE & ACCESSIBILITY**

### **Touch & Performance**
- Minimum touch targets: 44px × 44px with visual feedback
- Support both touch and mouse interactions
- Optimize bundle size and animations (60fps target)
- Test on actual mobile devices

### **WCAG 2.1 AA Compliance**
- Proper heading hierarchy and keyboard navigation
- Alt text for images, screen reader compatibility
- Color contrast ratios and focus management
- Announce game state changes with ARIA labels
- Support high contrast mode

## 🔍 **DEBUGGING PROTOCOL**
1. Identify root cause, reproduce consistently
2. Check mobile-first, test accessibility
3. Validate performance, document the fix
4. **CRITICAL**: Never claim "known browser issues" without documentation

## 🧪 **TESTING & DEVELOPMENT STRATEGIES**

### **TDD (Test Driven Development) - FUTURE IMPROVEMENT**
- **CURRENT STATUS**: Not fully implemented - would have helped today
- **BENEFITS**: Catches issues early, validates assumptions, prevents regressions
- **IMPLEMENTATION**: Write tests before code, use Jest for unit/integration tests
- **PRIORITY**: High - implement for all new features and critical bug fixes

### **Alternative Thinking Strategies - CRITICAL**
- **QUESTION ASSUMPTIONS**: "It's impossible that [established technology] doesn't work"
- **EXTERNAL RESEARCH**: Google/documentation search before claiming "known issues"
- **COMMUNITY VALIDATION**: Check if others have solved similar problems
- **SYSTEMATIC ELIMINATION**: Test each assumption methodically
- **REVERSE ENGINEERING**: Work backwards from "impossible" to find real cause

### **Debugging Mindset**
- **NEVER ASSUME BROWSER BUGS** without documented evidence
- **ALWAYS RESEARCH FIRST** before implementing workarounds
- **QUESTION EVERY ASSUMPTION** about technology behavior
- **USE EXTERNAL SOURCES** to validate or disprove hypotheses
- **SYSTEMATIC APPROACH** to eliminate possibilities

## 🎯 **CRITICAL LESSONS LEARNED - POSITION DETECTION**

### **ROOT CAUSE ANALYSIS**
- **Issue**: Elements registered from hidden desktop layout in mobile view
- **Symptom**: `getBoundingClientRect()` returned zeros despite CSS dimensions
- **Solution**: Layout-aware pile registration with viewport detection

### **KEY INSIGHTS**
- **Never assume browser bugs** without documented sources
- **Layout structure differences** can cause identical symptoms
- **CSS positioning context** matters more than individual element properties
- **Viewport width detection** is more reliable than CSS media queries for JavaScript

### **DEBUGGING STRATEGY**
- **Systematic parent chain analysis** reveals layout issues
- **Compare mobile vs desktop** element contexts
- **Check for hidden containers** before measuring positions
- **Validate registration system** finds correct elements

### **PERFORMANCE OPTIMIZATIONS**
- **Layout-aware registration** prevents unnecessary DOM queries
- **Viewport-based detection** avoids CSS media query complexity
- **Targeted debugging** reduces console noise
- **Cleanup after resolution** maintains production performance

## 🔧 **TERMINAL & DEVELOPMENT**

### **Command Execution**
- Use `is_background: true` for long-running processes
- Use `netstat` for port verification instead of waiting
- Trust PowerShell prompt as completion signal
- Use `;` for command separation on Windows

### **Build & Testing**
- Verify builds complete successfully before cleanup
- Test both development and production environments
- Maintain Jest test coverage during refactoring
- Document configuration changes for team consistency 