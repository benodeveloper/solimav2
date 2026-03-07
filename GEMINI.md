##  Next.js Engineering Standards

###  Architecture & Framework

* **Framework:** Next.js with **App Router** and a `src` directory.
* **Styling:** Tailwind CSS 4. Design aesthetic must mimic **Pipedrive** (clean, high-contrast, functional, and data-driven).
* **Modularity:** Every UI element must be a standalone component. Every page section must be an independent, reusable component.
* **File Structure:** **Strictly one component per file.** No exceptions.

### Data & Persistence

* **Stack:** Drizzle ORM with MySQL.
* **Schema Design:**
* Every table must include: `id` (Integer, Auto-increment), `created_at`, and `updated_at`.
* Naming Convention: Use `snake_case` for all database columns.


* **Logic Flow:** Define logic in **Services**, then call those Services within **Server Actions**.

###  Code Quality & TypeScript

* **Typing:** Strict TypeScript. Use **Generics** wherever applicable to increase code reusability and type safety.
* **DRY Principle:** Do not repeat yourself. Extract shared logic into **Helpers**.
* **Documentation:** Helper functions must be well-typed and include JSDoc comments.
* **Comments:** Comment only complex logic. **Restrictions:** No numbered lists (e.g., "1. something") and **no emojis** in comments or code.
* **Testing:** Write unit tests only for complex business logic or high-risk utility functions.

###  Metadata & Author Information

Whenever a file header or "About" section is generated, use the following:

* **Author:** benodeveloper
* **Website:** [https://www.benodeveloper.com](https://www.benodeveloper.com)
* **Email:** listoun.developer@gmail.com

---

###  Directory Structure Example

To maintain the "one component per file" rule, use this structure:

```text
src/
├── app/              # Routes and Pages
├── components/       # Atomic UI and Section components
├── db/               # Drizzle schema and connection
├── services/         # Business logic layer
├── actions/          # Next.js Server Actions
├── enums/            # All TypeScript Enums (one per file)
├── lib/              # Helpers and Utils
└── tests/            # Logic tests

```

###  Modular Standards

* **Enums:** All enums must be placed in the `src/enums` directory. Each enum must reside in its own file named after the enum (e.g., `media-collection.enum.ts`).
* **Components:** Strictly one component per file. No exceptions.


```typescript
/**
 * Processes a collection and returns a mapped record.
 * @param items - The array of items to process.
 * @param key - The property to use as the unique identifier.
 * @returns A mapped object of the generic type.
 */
export function mapCollectionToRecord<T>(items: T[], key: keyof T): Record<string, T> {
  // Logic here
}

```
