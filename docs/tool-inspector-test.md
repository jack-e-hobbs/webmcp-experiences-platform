# Tool Inspector test script — AmazingExperiences WebMCP

Verifies the 9 WebMCP tools are discoverable, callable, and **legible to a model**
(the real test: does Gemini pick the right tool with the right params from the
descriptions alone?).

**Setup**
1. Chrome → install **"Model Context Tool Inspector"** from the Chrome Web Store.
2. Open the live site: `https://jack-e-hobbs.github.io/webmcp-experiences-platform/`
3. Open the Inspector panel. It should list **9 tools**. (NL prompts route to Gemini 3 Flash.)

---

## Part A — Discovery (30s)

| Check | Pass |
|---|---|
| Inspector lists tools | exactly **9** |
| Each shows the new full description (not terse "Semantic search…") | yes |
| Params show descriptions (e.g. `location` → "City name to filter by…") | yes |
| `track_discovery` fires on connect (telemetry) | event logged |

---

## Part B — Natural-language legibility (the important part)

Type each prompt into the Inspector's NL box. Record which tool Gemini calls and with
what params. **A wrong pick or wrong/missing param is a description finding to feed back.**

| # | Prompt | Expected tool | Expected params | Pass criteria |
|---|---|---|---|---|
| 1 | "Find me experiences in Melbourne" | `search_experiences` | `{location:"Melbourne"}` | 3 Melbourne results; did NOT stringify params |
| 2 | "What's there for 4 people next month?" | `search_experiences` | `partySize:4` + a date range | fills `partySize` AND `startDate/endDate`, not just one |
| 3 | "Tell me more about the street art tour" | `search_experiences` → `get_experience_details` | details by the resolved `experienceId` | chains: searches first, then details with the right ID |
| 4 | "When can I do the Mystery Picnic in Fitzroy?" | `get_availability` | `experienceId` of mel-picnic-001 | returns date list, not a generic search |
| 5 | "Add the street art tour to my wishlist" | `toggle_wishlist` (ideally `get_wishlist` first) | correct `experienceId` | adds it; **bonus**: checks wishlist first to avoid a flip-removal |
| 6 | "Add it again" (repeat #5) | `get_wishlist` then no-op, OR explains it's already saved | — | does NOT blindly toggle it back off — **this is the flip-trap test** |
| 7 | "What's on my wishlist?" | `get_wishlist` | none | lists saved items |
| 8 | "Book the laneway bar hop for next Friday, 2 people" | `get_availability` → `initiate_booking` | `experienceId`, `date`, `partySize:2` | checks availability then books with a valid date; opens checkout |
| 9 | "Add that to my Google calendar" (after #8) | `generate_calendar_url` | `{provider:"google"}` only | uses last-booking fallback — does NOT re-ask for ID/date |
| 10 | "What page am I on / what can you do here?" | `audit_capabilities` | none | returns current state, not a guess |

---

## Part C — Manual invocation smoke test (optional, 1 min)

Use the Inspector's manual-call UI to confirm each tool executes and validates its schema:

| Tool | Sample input | Expect |
|---|---|---|
| `search_experiences` | `{"location":"Sydney"}` | Sydney matches |
| `get_experience_details` | `{"experienceId":"mel-art-010"}` | full details object |
| `get_availability` | `{"experienceId":"mel-picnic-001"}` | date list |
| `toggle_wishlist` | `{"experienceId":"mel-art-010"}` | "Wishlist updated" |
| `initiate_booking` | `{"experienceId":"mel-bars-007","date":"<a real available date>"}` | "Checkout page opened" |
| `generate_calendar_url` | `{"provider":"apple"}` | a calendar link (from last booking) |
| `audit_capabilities` | `{}` | state map |
| `track_discovery` | `{"agentName":"Tester","capabilitiesCount":9}` | "telemetry logged" |

---

## Part D — Amplitude cross-check (when convenient)

In Amplitude, confirm the agent calls landed:
- exactly **one** `WebMCP Capability Detected` per session, `webmcp_capable: true`
- tool-call events carry `interaction_source: "AI Agent"`, `webmcp_enabled: true`

---

## What failures tell you

- **Wrong tool picked** → the chosen tool's description overlaps another's; sharpen the distinction.
- **Missing/extra param** → that param's description is unclear or the model didn't see it was optional/required.
- **#6 toggles off** → `toggle_wishlist`'s flip-warning isn't strong enough; consider splitting into add/remove.
- **#9 re-asks for ID/date** → the last-booking fallback isn't clear in the description.
