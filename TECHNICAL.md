# Technical Documentation
## Project: Fortuna Collective Stack Architecture

### 1. Technology Stack
- **Frontend Framework**: React 18+ (TSX) via Vite.
- **Styling**: Tailwind CSS 4.0 (using `@import "tailwindcss"` pattern).
- **Backend-as-a-Service**: Firebase 10+ (Auth, Firestore, Cloud Run).
- **Icons**: Lucide React.
- **Animations**: Framer Motion (implemented via `motion/react`).
- **AI Integration**: Google Gemini 1.5 (via `@google/genai`).

### 2. Implementation Sub-Systems

#### 2.1 Authentication Flow
- **Provider**: Google Social Login + Firebase Email/Password.
- **Persistence**: Managed via `AuthProvider.tsx` context.
- **Constraints**: iOS Safari requires "New Tab" auth flows due to iframe cross-origin restrictions.

#### 2.2 Database Layer (Firestore)
The database follows a flat-topped relational structure with specific sub-collections for high-frequency data:
- `/users`: Profile metadata and role authorization.
- `/posts`: Feed transactions with niche-based partitioning.
- `/conversations/{id}/messages`: Sub-collection for message history to optimize query costs.
- `/action_proposals`: Agent-driven state changes awaiting manual approval.

#### 2.3 Antigravity UI (Design Implementation)
All UI components inherit from `index.css` utility classes:
- `neu-convex`: Outward shadow for buttons and active cards.
- `neu-concave`: Inset shadow for search bars and inputs.
- `100dvh`: Dynamic viewport units used to prevent iOS Safari layout shifts.
- `safe-area-inset`: Standard padding for notches and home bars.

### 3. Progressive Web App (PWA)
The app is configured for Standalone mode on iOS:
- `apple-mobile-web-app-capable`: Yes
- `apple-mobile-web-app-status-bar-style`: black-translucent
- Favicons and titles are optimized for Home Screen installation.

### 4. Admin Hierarchy & Controls
- **Admin Flag**: Defined in Firestore under `users/{uid}/role == "admin"`.
- **FOUNDER_ID**: Certain high-level operations are hardcoded to specific administrative UIDs for security.
- **FounderControl**: Restricted route for managing `ActionProposals` and `EvidenceLedgers`.

### 5. Deployment & Maintenance
- **Build Command**: `npm run build`
- **Linting**: `npm run lint` (uses `tsc` for deep type verification).
- **Firebase Rules**: Deploy `firestore.rules` for each schema update to prevent unauthorized data mutations.
