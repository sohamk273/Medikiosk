# MediKiosk UI Analysis & Design System Reference

## Overview
This document provides a comprehensive analysis of the UI reference screenshots for the MediKiosk project, establishing the foundational design system and mapping out the user journeys for both patients and doctors.

**A. Number of screenshots inspected:** 27
**B. Patient screens identified:** 21 (including 2 mixed kiosk/EMR screens)
**C. Doctor screens identified:** 5
**D. Misc graphics:** 1 (Logo)

---

## 1. Visual Design System

The MediKiosk visual language is modern, approachable, and highly accessible, blending professional healthcare aesthetics with a consumer-friendly kiosk experience.

### Tokens & Attributes
*   **Color Palette:**
    *   **Primary:** Deep Teal / Forest Green (used for primary actions, headers, and active states).
    *   **Secondary/Accent:** Soft Mint Green (used for progress bars, active selections, soft backgrounds) and Medical Blue.
    *   **Alert/Critical:** Soft Coral / Red (used for emergency buttons, critical alerts, and 'Code Yellow').
    *   **Background:** Off-white or very light cool gray, reducing eye strain.
    *   **Cards:** Pure white with subtle borders/shadows.
    *   **Text:** Dark Slate/Charcoal for primary readability, medium gray for secondary details.
*   **Typography:**
    *   **Font Family:** Clean, modern Sans-serif (like Inter or Roboto) for Latin characters, paired with a highly legible Devanagari font.
    *   **Hierarchy:** Large, bold screen titles. Pronounced contrast between primary and secondary text.
    *   **Bilingual Pattern:** English text is typically bold and primary, with Hindi/Marathi translations placed directly below or inline in a slightly lighter/smaller font.
*   **Shape & Structure:**
    *   **Border Radius:** Generous rounding (~12px - 16px) on cards, buttons, and form elements, creating a soft, friendly interface.
    *   **Shadows:** Very soft, diffuse drop shadows on cards and interactive elements to create depth without harshness.
*   **Interactive Elements:**
    *   **Buttons:** Large, pill-shaped or heavily rounded rectangles to ensure large touch targets.
    *   **Cards:** Large selectable areas (e.g., symptom selection) with clear active states (border highlight + checkmark icon).

---

## 2. Application Experiences

The application is split into two distinct, role-based experiences:

1.  **Patient-Facing Kiosk UI:**
    *   **Characteristics:** Touch-optimized, highly accessible, large fonts, prominent bilingual text, step-by-step wizard flow.
    *   **Layout:** Fixed top header (Kiosk info, Language/Audio controls, Emergency button), scrollable middle content area, and a fixed bottom action bar (Back, Repeat Audio, Help, Continue).
2.  **Doctor-Facing EMR UI:**
    *   **Characteristics:** Information-dense, desktop-oriented, professional clinical terminology, dashboard layout.
    *   **Layout:** Persistent left sidebar navigation, top patient context bar, tabular data, and complex tabbed workspaces for clinical assessment.

---

## 3. Logical Patient Journey & Screen Inventory

The screenshots represent a comprehensive patient intake flow. Related states are grouped into logical features below.

### Phase 1: Onboarding & Identification
*   **Welcome / Mode Select** (`screen (19).png`): Language selection and intake method choice (ABHA, OPD Slip, New Patient).
*   **Patient Consent** (`screen (8).png`): Privacy overview before starting.
*   **ABHA Authentication** (`screen (13).png`): QR scan or manual entry for ABHA ID.
*   **New Patient Registration** (`screen (7).png`): Manual demographics entry.
*   **Demographics Verification** (`screen (2).png`): Confirming retrieved/entered details.

### Phase 2: Clinical Intake & Triage
*   **Chief Complaint Entry** (`screen (3).png`): Voice prompt or quick-select tiles.
*   **Voice Intake Workflow:**
    *   *Localization* (`screen (20).png`): Touch selection for body part.
    *   *Recording* (`screen (11).png`): Active listening UI with waveform.
    *   *Processing* (`screen (12).png`): AI translation/processing state.
    *   *Confirmation* (`screen (1).png`): Review of transcribed text and extracted symptoms.
*   **Ayurveda Specifics** (`screen (14).png`): Questions assessing Digestive Fire (Agni) & Meal Habits.
*   **Current Medications** (`screen (4).png`): Intake of existing prescriptions.
*   **Allergies** (`screen.png`): ADR intake and allergy recording.

### Phase 3: Document Scanning (OCR)
*   **Prompt** (`screen (9).png`): Asking if the patient has previous documents.
*   **Live Scan** (`screen (17).png`): Camera alignment view.
*   **Processing** (`screen (5).png`): OCR extraction progress.
*   **Verification** (`screen (10).png`): Reviewing AI-extracted data from the scan.

### Phase 4: Exceptions & Completion
*   **Critical Alert** (`screen (15).png`): "Code Yellow" triage intercept requiring immediate staff attention.
*   **Intake Summary** (`screen (18).png`): Final review before token generation.
*   **Token Dispense** (`screen (6).png`): Hardware sync and printed slip digital representation.
*   **Directional Guidance** (`screen (16).png`): Map and instructions to the consultation room.

---

## 4. Doctor EMR Screen Inventory

*   **Queue Management** (`screen (23).png`): Dashboard showing waiting patients, triage priorities, and kiosk status.
*   **Clinical Summary** (`screen (22).png`): AI-generated clinical draft, source traceability, and red-flag alerts.
*   **Timeline & Investigations** (`screen (24).png`): Longitudinal history and scanned document viewer.
*   **Prescription & Assessment** (`screen (25).png`): Diagnostic coding, classical AYUSH formulations, diet regimen, and E-Prescription signing.
*   **Prakriti & Agni** (`screen (26).png`): Detailed Ayurvedic phenotypic constitution and metabolic evaluation based on Kiosk intake.

---

## 5. Reusable Components to Build

### Shared Design System (Base)
*   `Typography`: Bilingual Text Block (English primary, Hindi/Marathi secondary).
*   `Badges`: Status Pills (Success, Warning, Info, Neutral).
*   `Buttons`: Primary (Teal), Secondary (Light), Danger (Red).

### Patient Kiosk Components
*   `KioskLayout`: Wrapper handling fixed header, content area, and fixed footer.
*   `KioskHeader`: Contains Kiosk ID, Language Toggle, Audio Toggle, Emergency Button.
*   `KioskBottomBar`: Standardized actions (Back, Repeat Audio, Call Sahayak, Continue).
*   `VoiceInputWidget`: Circular microphone button with animated states (idle, listening, processing).
*   `LargeSelectCard`: Touch-friendly option cards with icon, title, subtitle, and active state.
*   `StepProgressIndicator`: Visual indicator of current step out of total steps.

### Doctor EMR Components
*   `EMRLayout`: Wrapper with left Sidebar and main content area.
*   `SidebarNav`: Navigation links (Dashboard, Queue, Cases, etc.).
*   `PatientContextBar`: Top sticky bar with patient vitals and demographic summary.
*   `ClinicalDataCard`: Standardized panels for displaying medical data (e.g., Blood Pressure, Prakriti).
*   `TabNavigation`: In-page routing for patient case details.

---

## 6. Visual Inconsistencies Identified

1.  **Mixed Kiosk/EMR Layouts (CRITICAL):**
    *   `screen (5).png` (Document OCR Processing) and `screen (10).png` (OCR Verification) are kiosk flow steps (Step 20 and 21), feature kiosk-style bottom action bars, but inappropriately include the **Doctor EMR Left Sidebar** and top navigation. These should be pure Kiosk screens.
2.  **Step Counting:**
    *   Most patient screens indicate a total of 24 steps (e.g., "Step 17 of 24").
    *   `screen (18).png` shows "STEP 12 OF 12".
    *   `screen (6).png` shows "STEP 23 OF 24" as Intake Complete, but `screen (16).png` shows "STEP 24 OF 24" as Intake Complete.
    *   *Resolution:* We should adopt a standardized, dynamic progress indicator rather than hardcoded step numbers.
3.  **Bottom Action Bar Styling:**
    *   Slight variations in the background tint of the bottom action bar across different kiosk screens.

---

## 7. Implementation Boundaries (Do NOT Implement Literally)

The following elements in the designs represent complex external systems or hardware and should be mocked or simulated purely in the UI layer using static/synthetic data:

*   **Hardware Integrations:**
    *   Live camera feeds for document scanning or ABHA QR codes.
    *   Thermal printer dispensing animations/status.
    *   Actual microphone recording to text processing (use simulated states).
*   **External APIs:**
    *   ABDM Sandbox syncing or real ABHA ID resolution.
    *   Real-time WhatsApp/SMS dispatch notifications.
    *   Live LLM/NLP translation latency timers.
*   **Mock Data Only:**
    *   Do not use any real patient PII. Stick to synthetic data like "Rameshwar Patil" presented in the screens.

---

## F. Recommended Implementation Order

1.  **Foundation:** Setup Tailwind/CSS tokens (colors, fonts, radius).
2.  **Shared Components:** Build buttons, badges, bilingual text blocks.
3.  **Kiosk Shell:** Implement the `KioskLayout`, `KioskHeader`, and `KioskBottomBar`.
4.  **Kiosk Core Workflows:**
    *   Welcome & Demographics
    *   Voice Intake Flow (mocked transitions)
    *   Ayurveda Specifics
5.  **EMR Shell:** Implement `EMRLayout` and `SidebarNav`.
6.  **EMR Core Views:** Patient Queue, Clinical Summary Dashboard.
