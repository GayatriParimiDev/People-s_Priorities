# Persistent Agent Memory

Use this section to write general rules, project setup details, style preferences, or learnings. Update this file using your write_file/patch_file tools to persist memories.

## Learnings & Guidelines
- **Backend Architecture:** Uses Express.js with `pg` (node-postgres) for Neon PostgreSQL.
- **Routing:** Modular routing pattern implemented in `backend/src/index.js` with separate routers for `auth`, `suggestions`, and `ai`.
- **Database:** Neon DB requires SSL; `sslmode=verify-full` is now enforced in `db.js`. Schema updates are managed via `alteration.sql` scripts.
- **NLP/AI:** Basic keyword-based categorization implemented in `aiController.js` as a placeholder for future LLM integration.
- **Environment:** `.env.example` tracks required keys including `DATABASE_URL` and `OPENAI_API_KEY`.
- **Workflow:** Follows a 10-step plan defined in `TODO.md`. All tasks (1-38) are now complete.
- **Frontend Build:** Uses Vite with a custom `server.ts` build process; `npm run build` bundles the server using `esbuild` into `dist/server.cjs`.
- **Testing/Linting:** `npm run lint` (in `frontend/`) runs `tsc --noEmit` to verify type safety.
- **Development:** Frontend dev server is started via `npm run dev` (using `tsx server.ts`). Backend dev server uses `nodemon` with a pre-start script (`scripts/kill-port.js`) to clear port 5000.
- **HMR/Vite:** Vite HMR is configurable via `DISABLE_HMR` env var; cache issues are resolved by clearing `node_modules/.vite`. WebSocket connection issues in Firefox are mitigated by explicitly setting `server.hmr.clientPort` to 443 and `host` to `localhost` in `vite.config.ts`.
- **Authentication:** RBAC is implemented via a `role` column in the `users` table (`ADMINISTRATOR`, `MP`, `CITIZEN`).
- **Frontend Navigation:** Login flow uses `setView` state updates and `window.history.pushState` to ensure correct redirection to the dashboard upon successful authentication.
- **Error Handling:** `AuthView` includes explicit `setLoading(false)` calls in catch blocks to prevent UI deadlocks during failed authentication attempts.
- **Process Management:** Use `npx kill-port <port>` to clear development ports (5000, 5173, 24678) if processes hang.
- **Credential Injection:** `AuthView` contains a `fillSeedCredential` helper to populate demo accounts; it is designed to clear UI error/success states upon invocation to prevent stale feedback.

## File-to-Data Map
- `.gitignore`: Project-wide ignore rules.
- `alteration.sql`: SQL script containing schema migration queries (e.g., adding RBAC roles).
- `backend/.env`: Local environment variables (not tracked in repo).
- `backend/.env.example`: Template for required backend environment variables.
- `backend/package-lock.json`: Backend dependency lockfile.
- `backend/package.json`: Backend scripts and dependencies.
- `backend/scripts/kill-port.js`: Utility script to terminate processes occupying the backend port.
- `backend/src/controllers/aiController.js`: Logic for categorizing citizen suggestions using keyword matching.
- `backend/src/controllers/authController.js`: Authentication logic and session management.
- `backend/src/controllers/suggestionController.js`: CRUD operations for citizen suggestions and status updates.
- `backend/src/db.js`: PostgreSQL connection pool configuration for Neon DB with `verify-full` SSL.
- `backend/src/index.js`: Main Express server entry point with dynamic port handling.
- `backend/src/routes/ai.js`: API routes for AI-driven categorization tasks.
- `backend/src/routes/auth.js`: Authentication-related API endpoints.
- `backend/src/routes/suggestions.js`: API routes for managing citizen feedback and priorities.
- `backend/src/test-db.js`: Database connectivity test script.
- `backend/src/views/login.html`: Login interface.
- `frontend/.env.example`: Template for frontend environment variables.
- `frontend/.gitignore`: Frontend-specific ignore rules.
- `frontend/index.html`: Main HTML entry point.
- `frontend/metadata.json`: Frontend project metadata.
- `frontend/package-lock.json`: Frontend dependency lockfile.
- `frontend/package.json`: Frontend scripts and dependencies.
- `frontend/README.md`: Frontend documentation.
- `frontend/server.ts`: Frontend development server configuration.
- `frontend/src/App.tsx`: Main React application component.
- `frontend/src/components/AuthView.tsx`: Authentication UI component with login/signup logic, navigation, error handling, and demo credential injection.
- `frontend/src/components/DashboardView.tsx`: MP/MLA dashboard UI for visualizing data.
- `frontend/src/components/EvaluationEngine.tsx`: Component for AI-driven project evaluation.
- `frontend/src/components/IntakeConsole.tsx`: Interface for managing incoming requests.
- `frontend/src/components/LedgerView.tsx`: View for displaying lists of suggestions.
- `frontend/src/components/ProposalDecisionView.tsx`: Interface for MPs/MLAs to approve, reject, or comment on proposals.
- `frontend/src/components/PublicLanding.tsx`: Public-facing landing page.
- `frontend/src/components/SettingsView.tsx`: User/System settings interface.
- `frontend/src/components/Sidebar.tsx`: Navigation sidebar component.
- `frontend/src/components/StatusTimeline.tsx`: UI for tracking suggestion status history.
- `frontend/src/index.css`: Global styles.
- `frontend/src/main.tsx`: React DOM entry point.
- `frontend/src/types.ts`: TypeScript interface definitions for the frontend.
- `frontend/tsconfig.json`: TypeScript configuration.
- `frontend/vite.config.ts`: Vite build configuration with HMR, proxy settings, and WebSocket client port/host overrides.
- `schema.sql`: Database schema definitions for users, constituencies, and suggestions.
- `TODO.md`: Project task tracking and progress status (all tasks 1-38 completed).