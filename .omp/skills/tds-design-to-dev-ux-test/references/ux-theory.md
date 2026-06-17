# Apps-in-Toss Mini-App UI/UX Optimization and TDS Practical Guide

## 1. Introduction: Mobile Environment Optimization Based on Cognitive Psychology and the Strategic Value of Toss Design System
The modern mobile application environment has evolved beyond simple aesthetic satisfaction into a problem-solving tool that minimizes users' cognitive load and supports intuitive goal achievement. In particular, the Apps-in-Toss ecosystem, operating within the Toss platform with over 30 million cumulative users, provides a powerful environment where external partners and solo developers can deploy their services in an average of 5 days.

For this open ecosystem to settle successfully and maintain user retention, it is essential that external mini-apps seamlessly inherit Toss's inherently consistent user experience (UX). The Toss Design System (TDS) introduced for this purpose is not just a simple design library, but a massive common language encompassing components, UX writing, and graphic resources.

## 2. Foundation of Visual Structuring: 8pt Grid System and Spatial Hierarchy (Spacing & Margin)
In digital interfaces, whitespace is not empty space but a core architectural material that controls the logical combination and separation of information. TDS strictly adheres to the 8pt grid system, controlling sizes and margins in multiples of 8 (8, 16, 24, 32, 40px). The hierarchy of whitespace applying Gestalt's Law of Proximity is as follows:

| Margin Category (Practical Standard) | Pixel (px) Size | Logical Grouping & Purpose | TDS Practical Application Example |
| :--- | :--- | :--- | :--- |
| **Ultra-Close Margin** | 4px / 8px | Forming a logically completely dependent single chunk. Gap between icon/text. | Default spacing between icon and text inside `ListRow` component, spacing between Badge and text in `Paragraph`. |
| **Default Margin** | 16px / 24px | Standard left/right margin for mobile devices. Vertical margin inside components, default gap between list items. | Default vertical padding of `ListRow` (`verticalPadding="medium"` is 24px, `"small"` is 16px), left/right screen margin. |
| **Inter-Group Margin** | 24px / 32px | Separating form input groups with different characteristics, securing space between independent Card UIs. | Giving independence by spacing 24px after a [Label]-4px-[Input]-8px-[Error] group before the next email form group. |
| **Inter-Section Margin** | 40px / 48px+ | Dividing large sections where the topic or nature of information changes completely. Providing visual rest. | `bottomPadding` under `AmountTop`, or spacing between `ListHeader` and a new data list section. |

> **💡 Note**: Mobile screens are designed based on a width of 375px. Forcibly detaching layouts in design tools to assign arbitrary spacing causes severe frontend bottlenecks and is prohibited.

## 3. Typography Hierarchy Ensuring Information Hierarchy and Accessibility
Text size should be based on strict mathematical scales and information importance, not aesthetic judgments. TDS has built a tokenized typography foundation to dynamically respond to the operating system's 'Larger Text' accessibility settings.

| Generic Tag (Usage) | TDS Corresponding Token | Font Size | Line Height (Ratio) | Font Weight | Practical Application Purpose & Component Mapping |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **H1 (Hero)** | `Typography 1` | 30px | 40px (133%) | Bold | Core screen title. Largest unit of info like `AmountTop` currency display. |
| **H2 (Large Topic)** | `Typography 2` | 26px | 36px (138%) | Bold | Headcopy on onboarding screens that must instantly grab attention. |
| **H3 (Standard Title)** | `Typography 3` | 22px | 32px (145%) | Semi-Bold / Bold | Standard screen title or bottom sheet header. |
| **H4 (Card Title)** | `Typography 4` | 20px | 28px (140%) | Medium / Semi-Bold | Individual card news, main label for form inputs, `ListHeader.TitleParagraph`. |
| **H5 (Subtitle)** | `Typography 5` | 17px | 24px (141%) | Medium | Sub-text and default body text. Standard text for `Paragraph`. |
| **P (Default Body)** | `subTypography 1` | 16px | 24px (150%) | Regular | Most standard body text. Maintains wide line height for readability. |
| **Small (Caption)** | `Typography 6 / 7` | 13~15px | 20px (133~153%) | Regular | Additional explanations, list sub-text, error messages, disclaimers, etc. |

## 4. Component Placement Strategy Considering Gaze Flow and Thumb Zone

### 4.1. Logical Division of Top/Middle/Bottom based on Thumb Zone
* **Top (Read-Only Zone):** Informational text and global navigation elements with low interaction frequency. (`Navbar`, `AmountTop`, `ListHeader`)
* **Middle (Exploration-Only Zone):** Space where scrolling and horizontal swiping occur. (`ListRow`, `Tab`, `Asset`, `Badge`)
* **Bottom (Action-Only Zone):** The Hot Zone where the thumb reaches fastest and most comfortably. Place primary action buttons here. (`FixedBottomCTA`)

### 4.2. Gaze Guidance Utilizing Visual Patterns
* **F-Pattern (Information Exploration Screens):** Scanning from top-left to right, then moving to the next line. The `ListRow` component accommodates this by placing a thumbnail on the left, core text in the center, and supplementary actions (`Switch`, `withArrow`) on the right.
* **Z-Pattern (Action-Inducing Screens):** On onboarding/payment screens, the gaze shoots diagonally from top-left to bottom-right. The final action button is placed at the bottom-center or bottom-right. Positive CTAs (`variant="fill"`) are placed on the right, and negative CTAs (`variant="weak"`) on the left.

## 5. Controlling Cognitive Load through Single-Purpose Screens and Transparent UX Writing

### 5.1. Implementation of Single-Purpose Screens
Screens where critical conversions occur must not have any navigation or banners other than the single purpose. Advanced settings should be hidden in lower depths to maximize conversion rates.

### 5.2. Strict Prohibition of Dark Patterns
* **No immediate bottom sheets upon entry:** Blocking notifications or promotional bottom sheets before the main screen is exposed is prohibited.
* **No back-button interception:** Forcibly blocking the user flow with benefit pop-ups when trying to exit is prohibited.
* **Transparent predictability:** Button labels must be written so users can clearly predict the next situation.

### 5.3. Brand Tone & Manner: UX Writing and Graphic Principles
* **Casual polite tone & positive framing:** Use active and positive expressions like "It has expired" in a conversational tone rather than rigid, passive phrasing.
* **Accurate situational delivery:** Standardize closing simple info windows to 'Close' (to prevent confusion with 'Cancel' which might imply undoing an action).
* **Accuracy-based graphic usage:** Prohibit causing anxiety with excessive exclamation marks or meaningless loading spinners when there is no actual wait time.

## 6. Practical Scenario-Specific Structural Layout Design Guide

### Scenario A: Information Input & Form Screens (Login, Sign up, Remittance)
* **Top Navigation:** Provide only `Navbar.BackButton` to fix the gaze on the form.
* **Header Section:** 24px margin right below `Navbar`, then expose a clear Call to Action using `Typography 2`.
* **Input Area:** Strictly observe logical grouping. On error, change borders and messages to `colors.red500`. Auto-focus the active input to the center of the scroll.
* **Bottom CTA:** `FixedBottomCTA.Single` at the very bottom. Initially `disabled={true}`, then switch to `variant="fill"` upon passing validation.

### Scenario B: Information Exploration & Selection Screens (Product Details, Card News, Benefits)
* **List Header:** Specify list characteristics using `ListHeader.TitleParagraph`.
* **Tab Navigation:** Place `Tab` if there are many items (if >4, use `fluid={true}`).
* **Contents List:** Repeatedly arrange `ListRow` (Left `Asset`, Center `ListRow.Texts`, Right toggle or arrow). Red Bean marker on top-right when events occur.
* **Visual Separation:** Insert `Border variant="height16"` between chunks of different characteristics.

### Scenario C: Status Confirmation & Result Screens (Payment Complete, Error, etc.)
* **Status Asset:** Secure top margin and place a large success/warning icon right in the center.
* **Hero Typography:** Specify the result below the icon using `AmountTop` or `Typography 1` text.
* **Bottom CTA:** Place a single `FixedBottomCTA` like "Return to Home" without forcing additional exploration.

## 7. Conclusion
In the Apps-in-Toss and TDS environment, an engineering approach based on data and mathematical logic is essential before aesthetic splendor. Strict adherence to the 8pt grid, typography tokens, and F/Z patterns prevents design fragmentation and ensures accessibility. By controlling only the Props without arbitrarily detaching the provided TDS components and fostering a transparent UX environment, an overwhelming user experience can be created.
