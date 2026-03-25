# STRICT UPDATE PROTOCOL: WebMCP Experiences Platform

This document outlines the mandatory procedure for all code modifications within this repository. Failure to follow this protocol will result in immediate rejection of changes.

## 1. Local Testing First (MANDATORY)
**NEVER** attempt to push or deploy changes to GitHub without successful local verification. 
1.  Apply the change locally.
2.  Run the verification build: `npm run build`.
3.  Launch the local test environment: `./test_and_run.sh`.
4.  Empirically verify the specific logic fix (e.g., using the browser console or the local agent sidecar).
5.  **Only after successful local verification** may you request permission to push to Git.

## 2. Component Modification (Full File Rewrite)
When updating any TypeScript/React component (especially `App.tsx` and files in `src/pages/` or `src/components/`):
*   **DO NOT** use targeted `replace` calls for logical updates.
*   **ALWAYS** rewrite the **ENTIRE** file using `write_file`.
*   **WHY:** Component logic is highly interdependent. Partial updates frequently lead to deleted variables (e.g., `filteredExperiences`), stale closures, or broken React hooks.

## 3. WebMCP Tool Integrity
*   **Contract Sync:** If you change a tool's logic in `App.tsx`, you **MUST** update the corresponding schema in `docs/webmcp-tools.jsonc`.
*   **Ref-Based Access:** Use the `Ref` pattern (e.g., `lastBookingRef`) for all WebMCP tool `execute` functions to ensure they access live state instead of stale closures from the registration time.
*   **Context Manifest:** The `provideContext` call **MUST** include the `tools` array to satisfy the latest 2026 WebMCP browser specifications.

## 4. Analytics & Style
*   **Amplitude Taxonomy:** Event names must be **Title Case**; Properties must be **snake_case**.
*   **Global Attribution:** Ensure the `webmcp_enabled` global property is maintained in the `trackEvent` wrapper.
*   **Colour Palette:** Always use the primary sage green (`#97b89d`) for UI highlights and logs.

## 5. Verification
After any code change, you **MUST** run the verification build:
```bash
npm run build
```
Any change that results in a build failure (TypeScript errors, etc.) must be reverted or fixed immediately.
