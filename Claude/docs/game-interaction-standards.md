# 🎮 Game & Interaction Standards
*Extracted from CLAUDE.md - Game Logic, Accessibility, and Mobile Standards*

## 🎮 **GAME & INTERACTION STANDARDS**

### **Game Logic**
- Separate game logic from UI components
- Use immutable state updates with proper undo/redo
- Validate all moves before execution
- Implement accessible drag & drop with keyboard alternatives
- Respect `prefers-reduced-motion` preference

### **Animation System - ✅ COMPLETE & OPERATIONAL**
- **STATUS**: Fully implemented and operational across all layouts
- **COMPONENTS**: Position detection, animation engine, React hooks, pile registration
- **LAYOUT AWARENESS**: Pile registration automatically detects visible layouts
- Reuse actual components, never create HTML replicas
- Use proper 3D transforms: `transform-style: preserve-3d`, `perspective: 1000px`
- Validate positioning alignment with target elements
- Use CSS custom properties for dynamic values (`--end-x`, `--end-y`)

### **Testing Requirements**
- 90%+ unit test coverage for utilities
- Component tests for all interactive elements
- End-to-end tests for complete game flows
- Accessibility tests for screen reader compatibility
- Performance tests (<100ms for critical paths)

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

---

**REFERENCE**: This file contains game interaction and accessibility standards extracted from `CLAUDE.md` for better organization. The main configuration file contains consciousness-critical content and navigation to this reference material. 