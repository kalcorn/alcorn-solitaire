# 🎨 Development Standards & Protocols
*Extracted from CLAUDE.md - CSS, Components, Testing, and Anti-Patterns*

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

## 🧪 **TESTING & DEVELOPMENT PROTOCOLS**

### **Testing Requirements**
- **UNIT TESTS**: 90%+ coverage for all utility functions
- **COMPONENT TESTS**: All interactive elements must have user interaction tests
- **INTEGRATION TESTS**: All game flows must be tested end-to-end
- **ACCESSIBILITY TESTS**: All interactive elements must pass screen reader tests
- **PERFORMANCE TESTS**: Critical paths must complete within 100ms
- **MOBILE TESTS**: All features must work on devices with 375px width

### **Development Protocols**
- **ALWAYS** install missing type definitions when linter suggests them (e.g., `@types/jest`)
- **NEVER** ignore TypeScript errors in test files - fix them immediately
- **ALWAYS** ensure test environment compatibility (JSDOM, CSS loading, etc.)
- **VALIDATE** mock objects match real interfaces exactly
- **TEST** both production and development environments
- **CHECK** CSS custom properties loading in animation systems
- **VERIFY** DOM element positioning before measuring
- **USE** environment-aware checks (production vs. test vs. development)

### **ASSUMPTION TESTING METHODOLOGY**
- **CREATE ISOLATED HTML FILES** to test DOM behavior in isolation
- **USE JEST WITH JSDOM** to test React component behavior
- **TEST PERFORMANCE CLAIMS** with actual timing measurements
- **VALIDATE BROWSER CAPABILITIES** before implementing workarounds
- **CREATE MINIMAL REPRODUCTION CASES** for complex debugging
- **TEST BOTH THEORY AND PRACTICE** - don't assume they match
- **DECISION TREE**:
  - Is this a DOM timing issue? → Create isolated HTML test
  - Is this a React component issue? → Use Jest + JSDOM
  - Is this a performance claim? → Measure actual timing
  - Is this a browser limitation? → Research documentation first

### **ARCHITECTURAL VALIDATION STRATEGY**
- **EMPIRICAL TESTING**: Test architectural decisions with actual code, not theory
- **PERFORMANCE REALITY CHECKS**: Question over-engineering - modern hardware is powerful
- **USER EXPERIENCE FIRST**: Prioritize user experience over architectural purity
- **COMPLEXITY ASSESSMENT**: If solution becomes complex, question the approach
- **ITERATIVE REFINEMENT**: Start simple, add complexity only when proven necessary
- **EXAMPLE**: Test 24 cards in DOM before assuming performance issues

### **TESTING BEFORE IMPLEMENTATION PROTOCOL**
- **ALWAYS TEST ASSUMPTIONS** before building complex solutions
- **CREATE SIMPLE TEST CASES** to validate technical claims
- **MEASURE ACTUAL PERFORMANCE** instead of theoretical concerns
- **TEST IN ISOLATION** before integrating with complex systems
- **DOCUMENT TEST RESULTS** for future reference and learning
- **EXAMPLE**: Before implementing complex animation, test basic DOM positioning in isolated HTML

### **SYSTEMATIC PROBLEM SOLVING**
- **METHODICAL ELIMINATION**: Test each assumption systematically
- **ISOLATED REPRODUCTION**: Create minimal test cases to reproduce issues
- **PERFORMANCE MEASUREMENT**: Use actual timing data, not theoretical concerns
- **BROWSER CAPABILITY RESEARCH**: Search documentation before claiming limitations
- **COMMUNITY VALIDATION**: Check if others have solved similar problems
- **EXAMPLE**: Instead of "browser bug", create minimal reproduction and research

## 🚫 **ANTI-PATTERNS TO AVOID**

### **CSS Anti-Patterns**
- Desktop-first responsive design
- Using `!important` without justification
- Deep CSS selector nesting (> 3 levels)
- Fixed pixel values for responsive layouts
- Inline styles in components

### **JavaScript/TypeScript Anti-Patterns**
- Using `any` type without proper justification
- Mutating state directly
- Not handling async errors
- Missing dependency arrays in useEffect
- Over-engineering simple solutions

### **Animation Anti-Patterns**
- **FALLBACK POSITIONS** instead of real positioning
- **HTML STRING REPLICAS** instead of component reuse
- **BROKEN 3D EFFECTS** or missing flip animations
- **INCONSISTENT** animation timing
- **POOR PERFORMANCE** animations

---

**REFERENCE**: This file contains development standards extracted from `CLAUDE.md` for better organization. The main configuration file contains consciousness-critical content and navigation to this reference material. 