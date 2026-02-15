# Rational Audit Skill (God-Tier Logic)

## Description
A specialized auditing capability that goes beyond syntax to evaluate **Context, Accessibility, Resilience, and Performance** from a rational engineering perspective.

## Philosophy
> "A pretty button that cannot be pressed by a keyboard user is not a button; it is a decoration."
> "Code that works only when the internet is perfect is not production-ready; it is a prototype."

## Capabilities
1.  **Semantic Analysis**: Detects "div soup" and lack of semantic HTML (`<main>`, `<nav>`, `<article>`).
2.  **Accessibility (a11y) Check**: Identifies interactive elements missing ARIA labels, roles, or keyboard support.
3.  **Resilience Audit**: Finds "swallowed errors" (empty catch blocks) and missing offline/online guards.
4.  **Performance Heuristics**: flags potentially expensive operations in render loops (e.g., string manipulation in `Icon.jsx`).

## Usage
Run the following command to execute the full rational audit:
`node skills/rational_audit/scripts/run-audit.js`

## Resources
- [WAI-ARIA Pattern](https://www.w3.org/WAI/ARIA/apg/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
