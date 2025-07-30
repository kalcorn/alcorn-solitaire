# Unified Card Sizing System

## Overview

This project uses a **bulletproof unified card sizing system** that ensures **perfect consistency** across all components and screen sizes. Card dimensions are **never** hardcoded anywhere except in the single source of truth.

## Single Source of Truth

All card dimensions are defined in: `src/styles/card-dimensions.css`

### CSS Custom Properties

The system uses CSS custom properties (variables) that automatically adapt to screen size:

```css
:root {
  --card-width: 52px;
  --card-height: 72px;
  --card-font-size: 0.9rem;
  --card-rank-font-size: 1.4rem;
  --card-suit-symbol-size: 2.8rem;
  --card-face-down-font-size: 1.5rem;
}
```

These values change automatically at different breakpoints (640px, 768px, 1024px, 1280px, 1536px, and landscape mobile).

## Usage Guidelines

### ✅ **ALWAYS DO:**

1. **In CSS:** Use CSS custom properties
   ```css
   .component {
     width: var(--card-width);
     height: var(--card-height);
   }
   ```

2. **In JavaScript:** Use the utility functions
   ```typescript
   import { getCardDimensions } from '@/utils/cardDimensions';
   
   const { width, height, widthPx, heightPx } = getCardDimensions();
   ```

3. **For inline styles:** Use the utility functions
   ```typescript
   import { getCardDimensionStyles } from '@/utils/cardDimensions';
   
   <div style={getCardDimensionStyles()} />
   ```

4. **For legacy components:** Use the global `.card` class
   ```tsx
   <div className="card face-down" />
   ```

### ❌ **NEVER DO:**

1. **Don't hardcode dimensions anywhere**
   ```css
   /* ❌ WRONG */
   .card { width: 52px; height: 72px; }
   ```

2. **Don't create separate getCardSize() functions**
   ```typescript
   // ❌ WRONG
   const getCardSize = () => {
     if (window.innerWidth >= 640) return { width: 65, height: 91 };
     return { width: 52, height: 72 };
   };
   ```

3. **Don't use magic numbers in animations**
   ```typescript
   // ❌ WRONG
   const cardWidth = 52;
   ```

## System Architecture

### Files Structure

```
src/
├── styles/
│   └── card-dimensions.css      # Single source of truth
├── utils/
│   └── cardDimensions.ts        # JavaScript utilities
└── components/
    ├── Card/Card.module.css     # Uses var(--card-width)
    ├── StockPile/StockPile.module.css
    ├── WastePile/WastePile.module.css
    ├── FoundationPile/FoundationPile.module.css
    └── TableauPile/TableauPile.module.css
```

### Responsive Breakpoints

The system automatically handles these breakpoints:

- **Mobile (default):** 52×72px
- **Small (640px+):** 65×91px  
- **Medium (768px+):** 85×119px
- **Large (1024px+):** 100×140px
- **XL (1280px+):** 100×140px
- **2XL (1536px+):** 110×154px
- **Landscape Mobile:** 60×84px

### Component Types

1. **Card Component (CSS Modules):** Uses CSS custom properties in Card.module.css
2. **Pile Components:** Use CSS custom properties for container sizing
3. **Legacy Components:** Use global `.card` class (like StockPile)
4. **Animations:** Use `getCardDimensions()` utility
5. **Layout Components:** Use utility functions for inline styles

## Benefits

✅ **Perfect Consistency:** All cards are exactly the same size everywhere  
✅ **Single Source of Truth:** Change dimensions in one place  
✅ **Performance:** CSS custom properties are optimal  
✅ **Maintainability:** No scattered hardcoded values  
✅ **Responsive:** Automatic adaptation to screen sizes  
✅ **Future-Proof:** Easy to add new breakpoints or components  

## Testing

The system ensures:
- All cards in foundation piles match tableau cards exactly
- Stock and waste pile cards are identical to other cards
- Animation cards use the same dimensions as static cards
- All breakpoints maintain consistent sizing
- No visual inconsistencies between components

## Migration Notes

This system replaced the previous architecture that had:
- Multiple `getCardSize()` functions with different logic
- Hardcoded dimensions scattered across CSS modules
- Inconsistent responsive breakpoints
- Different sizing logic in animations vs. static components

The new system guarantees that **card sizing will never be an issue again**.