# Engineering Guide (Next.js 15 + TypeScript + Shadcn/UI)

This document defines practical conventions for this codebase. It favors Next.js App Routerdefaults, Tailwind for styling, and small, composable components.

---

## 1) Architecture & File Structure
- Use App Router under `src/app/` with folder-based routing.
- Pages are Server Components by default. Never add `"use client"` to page files.
- Keep page files thin; compose from components in `src/components/**`.
- Co-locate page-specific components within their route folder if they arent reused; otherwise place in `src/components/`.
- Utilities: `src/lib/**` (helpers, metadata, config), `src/hooks/**` for client hooks, `src/app/api/**` for API routes.
- Types may live next to components or in a local `types.ts`.

## 2) Server vs Client Components
- Default to Server Components.
- Only make a component a Client Component if it needs state, effects, event handlers, or browser APIs.
- Client Component rules:
  - Start file with `"use client"`.
  - Do not import server-only modules (`next/headers`, `next/server`, `fs`, `path`, etc.).
  - Do not access env vars unless prefixed with `NEXT_PUBLIC_`.
- Never pass event handlers from Server to Client components. Keep handlers inside Client components.

## 3) Styling
- Tailwind only; styled-jsx is banned.
- Use design tokens from `globals.css` variables.
- Prefer utility classes; minimal custom CSS.
- Respect dark mode via `.dark` class and variables defined in `globals.css`.
- Shadcn/UI components should follow our design tokens and be composed, not forked.

## 4) Data Fetching & Mutations
- Fetch data in Server Components with async/await when possible.
- Use React Server Actions for simple mutations when appropriate, or API routes under `src/app/api/**` for more complex flows / third-party integrations.
- Caching:
  - Static data: leverage RSC caching where safe.
  - Dynamic/Authed data: use `no-store` or revalidate strategies as needed.
- Client-side fetching: use lightweight hooks only when interactivity demands it; always add loading and error states.

## 5) API Routes
- Place under `src/app/api/<segment>/route.ts`.
- Return JSON with stable schemas; document shape in a comment.
- Validate inputs (zod or minimal manual guards) and sanitize outputs.
- Handle errors with proper status codes; never leak stack traces.
- For third-party services, keep secrets server-side only.

## 6) Authentication
- Use the existing better-auth setup and client helpers in `src/lib/auth-client.ts`.
- Patterns:
  - Check session on client with `useSession()` when gating UI.
  - Redirect unauthenticated users on protected pages from client-side effects.
  - Do not manually manage bearer tokens; the auth client does it.
- Never call server-only auth APIs from Client Components.

## 7) Payments
- Use Autumn integration; never edit `autumn.config.ts` manually.
- Use provided hooks/components under `src/components/autumn/**` and `src/lib/autumn/**`.
- Gate premium actions with the provided allowance-check + track usage pattern.

## 8) State, Forms, and UX
- Prefer local state for isolated UI; lift state only when necessary.
- Forms: Use native `<form>` with progressive enhancement. For toasts use `sonner` (`<Toaster />` already wired in layout).
- Never use `alert/confirm/prompt`; use Shadcn dialogs and toasts.
- Do not `window.location.reload()`; use router navigation/state updates.

## 9) Components & Conventions
- Exports: components use named exports; pages use default export.
- Props must be typed; avoid `any`.
- Keep components focused and small.
- Icons from `lucide-react` only.
- Images: use `next/image` with proper `alt` text.

## 10) Performance
- Code-split via lazy boundaries where heavy.
- Use `Image` and `Script` components properly.
- Avoid large client bundles; keep client components lean.
- Memoize expensive computations and lists where profiling indicates.

## 11) Accessibility
- Always provide `alt` for images, labels for inputs, keyboard-focusable controls, and ARIA roles where appropriate.
- Maintain color contrast using our tokens.

## 12) Testing
- Unit: Vitest. E2E: Playwright.
- Test critical business flows and API schemas.
- Keep tests close to features when reasonable.

## 13) Error Handling & Logging
- Surface user-friendly errors in UI.
- API routes: consistent error objects `{ error: { code, message } }`.
- Avoid console noise in production paths.

## 14) Security Basics
- Sanitize and validate all external inputs.
- Never expose secrets to the client.
- Use HTTPS-only external calls; set appropriate CORS on APIs.

## 15) PR Checklist (Quick)
- [ ] Server vs Client boundaries respected
- [ ] Styling via Tailwind only; tokens respected; dark mode ok
- [ ] API schemas typed and documented
- [ ] Loading, empty, and error states covered
- [ ] Accessible labels/alt text/keyboard focus
- [ ] No large client-only dependencies without need
- [ ] Tests added/updated for critical changes
- [ ] No direct secret exposure; env usage correct

---

Adhere to these defaults and keep changes minimal, composable, and reversible. When uncertain, prefer Server Components and Tailwind utilities, and add client interactivity only where it improves UX.