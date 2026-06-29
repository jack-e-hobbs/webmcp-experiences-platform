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
*   **ALWAYS** rewrite the **ENTIRE** file using a file write.
*   **WHY:** Component logic is highly interdependent. Partial updates frequently lead to deleted variables (e.g., `filteredExperiences`), stale closures, or broken React hooks.

## 3. WebMCP Tool Integrity
*   **Contract Sync:** If you change a tool's logic in `App.tsx`, you **MUST** update the corresponding schema in `docs/webmcp-tools.jsonc`.
*   **Ref-Based Access:** Use the `Ref` pattern (e.g., `lastBookingRef`) for all WebMCP tool `execute` functions to ensure they access live state instead of stale closures from the registration time.
*   **Current spec:** Use `document.modelContext.registerTool` (not `navigator.modelContext.provideContext`). There is no `provideContext` call. Use the shim `document.modelContext || navigator.modelContext` for backwards compatibility.
*   **Annotations:** All tools must include `annotations: { readOnlyHint: true|false }` per the current spec.
*   **Execute return:** Tools `execute` returns a plain string, not the old `{ content: [...] }` envelope.

## 4. Analytics & Style
*   **Amplitude Taxonomy:** Event names must be **Title Case**; Properties must be **snake_case**.
*   **Global Attribution:** Ensure the `interaction_source` property and `webmcp_enabled` global property are present in the `trackEvent` wrapper.
*   **Colour Palette:** Always use the primary sage green (`#97b89d`) for UI highlights and logs.

## 5. Verification
After any code change, you **MUST** run the verification build:
```bash
npm run build
```
Any change that results in a build failure (TypeScript errors, etc.) must be reverted or fixed immediately.