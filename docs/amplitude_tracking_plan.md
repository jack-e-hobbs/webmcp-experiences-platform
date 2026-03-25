# Amplitude Tracking Plan: AmazingExperiences (WebMCP Prototype)

## Naming Conventions
To maintain a clean and searchable taxonomy, all data sent to Amplitude must adhere to these standards:
*   **Event Names:** Use **Title Case** (e.g., `Experiences Search Submitted`).
*   **Event Properties:** Use **snake_case** (e.g., `filter_location`).
*   **User Properties:** Use **snake_case** (e.g., `interaction_source`).

## Global User Properties (Applied to all events)
| Property Name | Type | Example | Description |
| :--- | :--- | :--- | :--- |
| `interaction_source` | String | "Human" \| "AI Agent" | Tracks whether the action was initiated by a human user or an AI agent. |
| `webmcp_enabled` | Boolean | `true` | Indicates if the browser supports the WebMCP standard during the session. |
| `browser_agent_present` | Boolean | `true` | Set to true via an `identify` call as soon as any AI agent interaction is detected. |

---

## Product Tracking
When one or more products are associated with an event (e.g. the products returned in an Experience Search Submitted, the product being viewed or purchased), set a `products` event property. This will be done so that we can apply Amplitude's property splitting: https://amplitude.com/docs/analytics/charts/cart-analysis
This event property must be an array of objects, where each object represents a product ID. e.g. for a search of melbourne activities:
```
products: [
    {
        experience_id: "mel-picnic-001",
        experience_name: "Mystery Picnic: Fitzroy"
    },
    {
        experience_id: "mel-date-007",
        experience_name: "Date Night: Laneway Bar Hop"
    }
]
```

### Product Attributes
| Property Name | Type | Definition | Events This is Known for |
| :--- | :--- | :--- | :--- |
| `experience_id` | String | The ID of the experience | All |
| `experience_name` | String | The name of the experience product | All |
| `party_size` | Number | The number of guests that are part of the booking | Booking Initiated, Booking Completed |
| `experience_rating` | Number | The rating of the experience product | All |
| `experience_location` | String | The location of the experience | All |
| `experience_date` | String | The specific date the user is booking for | Booking Initiated, Booking Completed |
| `$product_id`   | String | The ID of the experience | only required for Booking Completed  |

---

## Core Events

### `Experiences Search Submitted`
Triggered when a user or agent filters the experience catalog.

| Property Name | Type | Example |
| :--- | :--- | :--- |
| `filter_location` | String | "Melbourne" |
| `filter_party_size` | Number | 4 |
| `filter_min_rating` | Number | 4.5 |
| `filter_start_date` | String | "2026-04-04" |
| `filter_end_date` | String | "2026-04-06" |
| `results_count` | Integer | 3 |
| `products` | Array | `[{ "experience_id": "exp-1", ... }]` |

### `Experiences Item Viewed`
Triggered when a specific experience detail page is viewed.

| Property Name | Type | Example |
| :--- | :--- | :--- |
| `products` | Array | `[{ "experience_id": "exp-1", "experience_name": "...", "experience_rating": 4.8, "experience_location": "Melbourne" }]` |

### `Experiences Item Added to Wishlist`
Triggered when a user (or agent) adds an item to their wishlist.

| Property Name | Type | Example |
| :--- | :--- | :--- |
| `wishlist_source` | String | "Card" \| "ProductPage" \| "AI Agent" |
| `products` | Array | `[{ "experience_id": "exp-1", ... }]` |

### `Experiences Item Removed from Wishlist`
Triggered when a user (or agent) removes an item from their wishlist.

| Property Name | Type | Example |
| :--- | :--- | :--- |
| `wishlist_source` | String | "Card" \| "ProductPage" \| "AI Agent" |
| `products` | Array | `[{ "experience_id": "exp-1", ... }]` |

### `Experiences Availability Checked`
Triggered **only** when the `get_availability` agent tool is called.

| Property Name | Type | Example |
| :--- | :--- | :--- |
| `experience_id` | String | "syd-picnic-006" |
| `availability_returned` | Array | `["2026-04-04", "2026-04-05"]` |

### `Booking Initiated`
Triggered when a user (or agent) initiates the booking flow for a specific experience.

| Property Name | Type | Example |
| :--- | :--- | :--- |
| `products` | Array | `[{ "experience_id": "exp-1", "experience_name": "...", "party_size": 2, "experience_date": "2026-04-12" }]` |

### `Booking Completed`
Triggered upon successful submission of the checkout form.

| Property Name | Type | Example | Notes |
| :--- | :--- | :--- | :--- |
| `transaction_id` | String | "txn_123456789" | |
| `total_value` | Number | 150.00 | |
| `$revenue` | Number | 150.00 | Required for Amplitude revenue tracking. |
| `$currency` | String | "AUD" | Required for Amplitude revenue tracking. |
| `products` | Array | `[{ "experience_id": "exp-1", "experience_name": "...", "party_size": 2, "experience_date": "2026-04-12", "$product_id": "exp-1" }]` | |

---

## Automatic Events (Amplitude SDK)
The following events are captured automatically by the SDK and will include the **Global User Properties** for segmentation:
*   `[Amplitude] Page Viewed`
*   `[Amplitude] Session Start`

---

## Session Replay
This platform has the **Amplitude Session Replay** plugin enabled.

*   **Sampling:** 100% (1.0) for the duration of the demo.
*   **Purpose:** To visually validate the interaction patterns of AI agents vs. humans.
