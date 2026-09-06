# Implementation Plan: Slice 1 (Foundation & Application Shell)

This plan outlines the steps to build the foundational architecture and shared design system for MediKiosk, focusing strictly on the application shell, routing, and design system components.

## User Review Required

> [!IMPORTANT]
> - I will be re-configuring `vite.config.ts` and `tsconfig.app.json` to support Path Aliasing (e.g. `@/components/*`) as this is best practice for modular apps.
> - I will update `index.css` to inject the Tailwind v4 theme CSS variables corresponding to the MediKiosk color palette.
> - Please confirm if this approach is approved before I proceed to execution.

## Proposed Changes

---

### Configuration & Architecture

#### [MODIFY] `vite.config.ts`
- Add `@tailwindcss/vite` plugin.
- Add path aliasing for `@/*` -> `src/*`.

#### [MODIFY] `tsconfig.app.json`
- Add `baseUrl` and `paths` configuration for `@/*` aliases.

#### [MODIFY] `src/index.css`
- Configure Tailwind v4 base styles, variables, and utility classes matching the MediKiosk design system (Primary Teal, Mint Green, Medical Blue, Alert Coral, Off-white backgrounds).
- Define font-families supporting Latin and Devanagari.

---

### Core Application & Routing

#### [NEW] `src/app/router.tsx`
- Define the routing structure for both Patient Kiosk (e.g. `/patient`, `/patient/voice`, etc.) and Doctor EMR (e.g. `/doctor`, `/doctor/queue`, etc.) experiences.

#### [MODIFY] `src/App.tsx`
- Replace default Vite boilerplate with a clean `RouterProvider` mounting the application routes.

---

### Layout Shells (Placeholders)

#### [NEW] `src/components/layout/KioskLayout.tsx`, `KioskHeader.tsx`, `KioskBottomBar.tsx`
- Build the Patient Kiosk shell.
- Header will include branding, time, language selector, audio toggle, and emergency button.
- Bottom bar will include Back, Repeat Audio, Call Sahayak, and Continue actions.

#### [NEW] `src/components/layout/EMRLayout.tsx`, `SidebarNav.tsx`, `TopBar.tsx`
- Build the Doctor EMR shell.
- Sidebar with navigation items (Dashboard, Queue, Cases, etc.).
- Topbar with search, OPD room, and notifications.

---

### Reusable UI Components

Create the following generic components inside `src/components/ui/` styled according to the UI Analysis constraints (generous radii, touch-friendly, high contrast):

#### Buttons & Inputs
- `Button.tsx` (base), `PrimaryButton.tsx`, `SecondaryButton.tsx`, `DangerButton.tsx`, `IconButton.tsx`
- `Input.tsx`, `Select.tsx`

#### Layout & Indicators
- `Card.tsx`, `Modal.tsx`
- `Badge.tsx`, `StatusBadge.tsx`, `StepProgressIndicator.tsx`, `ProgressBar.tsx`
- `SectionHeader.tsx`, `BilingualText.tsx`

#### Messaging & States
- `Alert.tsx`, `InfoPanel.tsx`
- `LoadingState.tsx`, `ErrorState.tsx`, `EmptyState.tsx`

---

### Placeholder Pages

Create minimal page shells in `src/pages/patient/` and `src/pages/doctor/` that render the appropriate layout (Kiosk or EMR) and a simple title, ensuring the routing correctly renders the architecture.

## Verification Plan

### Automated Checks
- `npm run lint` (using Oxlint) to verify code quality.
- `tsc -b` to verify strict TypeScript adherence.
- `npm run build` to ensure the production build succeeds.

### Manual Verification
- Start `npm run dev`.
- Visually inspect Patient placeholder routes to ensure the header and bottom bar stick properly, and the layout looks correct on touch screen dimensions (1366x768).
- Visually inspect Doctor placeholder routes to ensure the sidebar and topbar structure matches EMR patterns.
- Validate that the design tokens (colors, radii) match the UI specifications.
