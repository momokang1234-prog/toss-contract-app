# Project Memory Index

This file tracks the project's high-signal operational memory, context, and rule packs for the `omp` / `omg` agent. Detailed notes are kept in `.omg/memory/`, and modular rules are kept in `.omg/rules/`.

## Active Rule Packs
- [TDS Mobile Typography CSS Variables](.omg/rules/tds-css-typography.md)
  - Describes the necessary two-stage injection (`makeFixedTypographyVariables` and `makeMobileTypographyVariables`) required for `@toss/tds-mobile` v2.x to render `<Paragraph>` text sizes correctly.
- [TDS Mobile Paragraph Nesting Bug](.omg/rules/tds-paragraph-nesting.md)
  - Describes how nesting `<Paragraph>` components inside each other alongside raw text strips the raw text of its typography CSS span. Advises using standard `<div>` flex containers for mixing text and elements.
