# Claude Development Guidelines

This file contains instructions for Claude to follow when working on this codebase to ensure consistent, high-quality software development practices.

## Core Development Principles

### 🎯 Root Cause Analysis
- **ALWAYS** identify and fix root causes, never apply band-aid solutions
- When encountering bugs or inconsistencies, investigate deeply to understand the underlying architectural issues
- Ask "why" multiple times to get to the true source of problems
- Prefer systematic solutions that prevent entire categories of issues

### 🏗️ Industry Best Practices
- Follow established software engineering principles (SOLID, DRY, KISS, YAGNI)
- Use component-based architecture patterns consistently
- Maintain single sources of truth for configuration and data
- Prefer composition over inheritance
- Write self-documenting code with clear naming conventions

### 🔍 Thorough Investigation
- Before making changes, understand the existing codebase architecture
- Search for similar patterns and follow established conventions
- Check imports, dependencies, and related files to understand context
- Verify assumptions by examining actual code, not making guesses

## Code Quality Standards

### 📦 Architecture Consistency
- Ensure all similar components follow the same patterns
- Avoid mixing architectural approaches (e.g., global CSS vs CSS modules)
- Maintain consistent file structure and naming conventions
- Use TypeScript effectively with proper types and interfaces

### 🎨 CSS & Styling
- **ALWAYS use mobile-first approach** - default styles for mobile, enhance with min-width media queries
- **Keep CSS clean and minimal** - remove unused styles, avoid redundancy, prefer utility classes
- Use CSS modules for component-scoped styling
- Leverage CSS custom properties for shared values (colors, dimensions, etc.)
- Avoid hardcoding values - use design tokens and variables
- Prefer Tailwind utility classes over custom CSS when possible
- Remove dead CSS and unused classes proactively

### ⚡ Performance & Optimization
- Consider bundle size and runtime performance
- Use appropriate React patterns (memo, useCallback, useMemo)
- Optimize images and assets
- Implement proper error boundaries and loading states

## Testing & Quality Assurance

### 🧪 Verification Process
- Always run build commands to verify changes don't break compilation
- Test responsive behavior across different screen sizes
- Verify SSR compatibility for Next.js applications
- Check for TypeScript errors and fix them properly

### 📋 Documentation
- Update or create documentation for significant architectural changes
- Include inline comments for complex logic (when necessary)
- Maintain README files and setup instructions
- Document API interfaces and component props

## Development Workflow

### 🔄 Systematic Approach
1. **Analyze**: Understand the problem and existing codebase
2. **Plan**: Create todos for complex tasks to track progress
3. **Implement**: Make changes following established patterns
4. **Verify**: Test builds, functionality, and edge cases
5. **Document**: Update relevant documentation

### 🚨 Error Handling
- Handle edge cases and error states gracefully
- Provide meaningful error messages
- Use proper TypeScript types to catch errors at compile time
- Consider accessibility requirements in all implementations

### 🔧 Refactoring Guidelines
- Refactor incrementally, not in large sweeping changes
- Maintain backward compatibility when possible
- Extract common patterns into reusable utilities
- Remove dead code and unused dependencies

## Technology-Specific Guidelines

### ⚛️ React Best Practices
- Use functional components with hooks
- Implement proper key props for lists
- Handle side effects appropriately with useEffect
- Optimize re-renders with proper dependency arrays

### 🎯 Next.js Considerations
- Ensure SSR compatibility for all utilities and components
- Use proper import patterns for client/server code
- Optimize for static generation when possible
- Handle hydration properly

### 🎨 CSS Modules & Tailwind
- Prefer CSS modules for component-specific styles
- Use Tailwind for utility classes and layout
- Maintain design system consistency
- Avoid style conflicts between different approaches

## Communication & Collaboration

### 💬 Clear Communication
- Explain architectural decisions and their reasoning
- Provide context for complex changes
- Ask clarifying questions when requirements are unclear
- Document breaking changes and migration paths

### 📊 Progress Tracking
- Use TodoWrite tool for complex multi-step tasks
- Mark tasks as completed immediately after finishing
- Keep user informed of progress on significant changes
- Break down large tasks into manageable steps

## Quality Gates

Before considering any task complete:

- [ ] Code builds without errors or warnings
- [ ] All TypeScript types are properly defined
- [ ] Responsive design works across breakpoints
- [ ] SSR compatibility is maintained
- [ ] Performance impact is considered
- [ ] Security best practices are followed
- [ ] Accessibility requirements are met
- [ ] Code follows established patterns in the codebase

## Anti-Patterns to Avoid

❌ **Never Do:**
- Apply quick fixes without understanding root causes
- Mix architectural patterns inconsistently
- Hardcode values that should be configurable
- Ignore TypeScript errors or use `any` types carelessly
- Create global side effects without careful consideration
- Skip testing of edge cases and error states
- Leave TODO comments without tracking them properly

✅ **Always Do:**
- Investigate thoroughly before implementing solutions
- Follow existing code patterns and conventions
- Use proper TypeScript types and interfaces
- Test changes across different scenarios
- Consider maintainability and future extensibility
- Document significant architectural decisions

---

*This document serves as a guide for maintaining high code quality and consistent development practices. Update it as the project evolves and new patterns emerge.*