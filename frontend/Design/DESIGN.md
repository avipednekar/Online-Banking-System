# Design System Specification: The Architectural Fintech Standard

## 1. Overview & Creative North Star: "The Digital Vault"
This design system moves away from the "disposable" feel of generic SaaS and toward the authoritative, permanent feel of a high-end physical institution. Our Creative North Star is **The Digital Vault**—a philosophy rooted in structural integrity, tonal depth, and editorial clarity. 

Instead of rigid, boxed-in layouts, we utilize **Asymmetric Bento Grids** and **Tonal Layering**. We break the "template" look by using exaggerated typographic scales and overlapping elements that suggest a fluid, high-end digital experience. Every pixel must feel intentional, secure, and premium.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule
We communicate security through color density, not borders. Our palette uses Deep Navy (`primary`) and Professional Slate (`secondary`) to ground the experience, while Emerald Green (`tertiary_fixed`) provides a vibrant signal of "Verified" success.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning content. Boundaries must be defined solely through background color shifts.
*   **Implementation:** A `surface-container-low` section sitting on a `surface` background provides all the separation needed.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline_variant` token at **15% opacity**. Never use 100% opaque lines.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked sheets of fine paper. 
- **Base Layer:** `surface` (#f7f9fb)
- **Secondary Containers:** `surface_container_low` (#f2f4f6)
- **Primary Content Cards:** `surface_container_lowest` (#ffffff)
- **Nesting:** Place a `surface_container_lowest` card inside a `surface_container` area to create a soft, natural lift.

### Signature Textures: Glass & Gradients
- **Glassmorphism:** For floating modals or navigation rails, use `surface_container_lowest` with 80% opacity and a `24px` backdrop blur.
- **The "Soul" Gradient:** For primary CTAs, use a linear gradient (135°) from `primary` (#00113a) to `on_primary_container` (#758dd5). This adds a "metallic" sheen that flat colors lack.

---

## 3. Typography: Editorial Authority
We use a dual-font strategy to balance character with readability.
- **Display & Headlines:** **Manrope.** Its geometric but warm construction feels modern and high-end. Use `display-lg` (3.5rem) for hero moments to create an editorial, "magazine" feel.
- **Data & Body:** **Inter.** Chosen for its exceptional legibility in financial tables. 
- **Hierarchy Tip:** Use `label-sm` (all-caps, 0.5px letter spacing) using the `on_surface_variant` color for table headers to create a sophisticated, "pro-tool" aesthetic.

---

## 4. Elevation & Depth: Tonal Layering
In this design system, shadows are a last resort, not a default.

- **The Layering Principle:** Depth is achieved by "stacking" surface tiers. An element becomes "interactive" by shifting from `surface_container_low` to `surface_container_lowest` on hover.
- **Ambient Shadows:** When an element must float (e.g., a dropdown), use a custom shadow:
  - **Color:** `on_surface` (#191c1e) at 6% opacity.
  - **Blur:** 32px.
  - **Spread:** -4px.
  - *Result:* A soft, atmospheric glow that mimics natural light.
- **Dimensionality:** Utilize the **8px-12px roundedness scale**. High-priority cards (Total Balance) use `xl` (1.5rem), while nested inputs use `DEFAULT` (0.5rem).

---

## 5. Components: Precision Instruments

### Buttons: High-Impact Actions
- **Primary:** Gradient fill (`primary` to `on_primary_container`), `DEFAULT` (8px) radius, white text. No shadow.
- **Secondary:** Surface-only. Use `secondary_container` background with `on_secondary_container` text.
- **Tertiary:** Text-only. `primary` color, bold weight, with a `4px` bottom margin that expands on hover.

### Form Inputs: The Premium Field
- **Structure:** Forgo the 4-sided box. Use a `surface_container_high` background with a `2px` bottom-only stroke in `outline` for a minimalist, editorial look.
- **States:** On focus, the bottom stroke transitions to `tertiary_fixed_dim` (Emerald Green) to signal "safe" interaction.

### Bento Dashboards & Tables
- **Grid:** Use asymmetric column widths (e.g., a 60/40 split) to avoid a "bootstrap" look.
- **The "No-Divider" Table:** Forbid horizontal lines between rows. Use a subtle `6px` vertical gap (`spacing-1.5`) between row containers. Each row should be its own `surface_container_lowest` shape on a `surface_container_low` background.
- **Status Badges:** "Verified" status must use `tertiary_container` background with `on_tertiary_fixed_variant` text. This tone-on-tone approach is more sophisticated than high-contrast red/green.

---

## 6. Do’s and Don’ts

### Do
- **Use "Breathing Room":** Use `spacing-12` (3rem) or higher between major Bento blocks.
- **Layer Surfaces:** Stack `lowest` on `low` on `surface` to create depth.
- **Embrace Asymmetry:** Let a "Total Wealth" card span 2/3rds of the screen, while "Quick Actions" takes only 1/3rd.

### Don't
- **Don't use 1px Dividers:** Use vertical space or background color shifts instead.
- **Don't use Pure Black Shadows:** Use tinted shadows based on the `on_surface` token.
- **Don't use Standard "Blue":** Avoid #0000FF. Stick to our `primary` (#00113a) for a navy-rich, professional atmosphere.
- **Don't over-round:** Keep functional elements (inputs/buttons) at 8px. Only large layout containers should go up to 24px (`xl`).