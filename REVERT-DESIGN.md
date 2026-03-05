# Revert revolutionary design

To go back to the previous “basic” design:

1. **Remove the design layer**
   - In `src/main.tsx`, delete the line: `import "./design-revolution.css";`

2. **Restore previous layout**
   - In `src/App.tsx`:
     - **Banner:** Restore the original announcement bar (no `pillow-banner` class).
     - **Header:** Restore the original header (no `pillow-header`; use previous logo + nav structure, e.g. `revo-nav` or original).
     - **Hero:** Restore the original hero (no `pillow-hero` / `pillow-value-box`; use previous centered or `revo-hero` layout with title, subtitle, CTA).
     - **Benefit bar:** Remove the `pillow-benefit-bar` div (or replace with the previous trust strip `revo-trust-strip`).
     - **Why section:** Restore the standalone `WhyChooseUs` section and the separate **Comparison** section with full `<ComparisonTable />` (remove `pillow-why-section` and `ComparisonTable embedded` usage).
   - In `src/components/WhyChooseUs.tsx` and `src/components/ReviewsSection.tsx`, restore the previous markup and class names (no `revo-*` classes).
   - In `src/App.tsx` product grid, restore the previous product card markup (no `revo-product-card`, original padding and image aspect ratio).
   - In `src/components/ComparisonTable.tsx`, remove the `embedded` and `otherLabel` props if you want the component to always render the full section.

3. **Optional**
   - Delete `src/design-revolution.css` and this file.

If you want, you can ask: “Revert the design” and the same changes can be reverted for you.
