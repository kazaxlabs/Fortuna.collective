# Antigravity Design System
## UI/UX Style & Design Guidelines for Fortuna Collective

### 1. Vision & Philosophy
Antigravity is a design system built for the **Fortuna Collective**. It balances high-end minimalism with a tactile, hardware-inspired interface. The goal is to create a digital environment that feels like a private, secure, and strategic workstation.

- **Architectural Honesty**: Structure is defined by depth (shadows and light) rather than borders and fills.
- **Strategic Professionalism**: Every interaction should feel intentional and high-stakes.
- **Distinguished Minimalism**: No unnecessary noise. Content is the priority, framed by a premium interface.

---

### 2. Visual Language: Neumorphism 2.0
The core of Antigravity is a refined take on Neumorphism. Instead of extreme soft shadows, we use subtle, high-performance depth effects.

#### 2.1 Surfaces
- **Convex (`neu-convex`)**: Primary surface level. Used for cards and interactive containers.
- **Concave (`neu-concave`)**: Inset depth. Used for inputs, search bars, and the "vault" background.
- **Button (`neu-button`)**: Elevated interactive states. Responsive to hover and press with active depth shifts.

#### 2.2 Color Palette
| Token | Light Mode | Dark Mode | Usage |
| :--- | :--- | :--- | :--- |
| `--color-bg` | `#F8F9FB` | `#0D0D0E` | Page background |
| `--color-text` | `#1D1D1F` | `#F5F5F7` | Primary content |
| `--color-accent` | `#007AFF` | `#007AFF` | Strategic highlights |
| `--color-shadow-dark` | `#E6E8ED` | `#000000` | Depth shadows |
| `--color-shadow-light`| `#FFFFFF` | `#1A1A1B` | Highlight gleams |

---

### 3. Typography & Hierarchy
We prioritize legibility and professional tone.

#### 3.1 Typefaces
- **Primary (Sans)**: `Inter` or `-apple-system`. Used for accessibility and cleanliness.
- **Metadata (Mono)**: `JetBrains Mono` or `ui-monospace`. Used for technical data, status labels, and "Core Node" identifiers.

#### 3.2 Type Scale
- **Display**: 48px, Bold, -0.022em. For branding and major headers.
- **H2**: 32px, Bold, -0.019em. For section titles.
- **Label**: 12px, Medium, +0.02em tracking. Uppercase. For metadata and strategic tags.

---

### 4. Component Standards

#### 4.1 Buttons
- **Primary**: Accent color (`--color-accent`). High contrast.
- **Secondary**: Elevated Neumorphic button.
- **Interaction**: Must include scale-down (`active:scale-95`) feedback for a tactile feel.

#### 4.2 Icons
- **Provider**: `lucide-react`.
- **Styling**: `strokeWidth={2.5}` or `3` for a bold, hardware-inspired look. Opacity should be muted (40-60%) unless active.

---

### 5. Terminology (The Collective Lexicon)
Language is as important as visuals. Avoid generic terminology.

- **Navigation**: Home, Network, Channels, Messages, Notifications.
- **Internal**: "Core Node" (User), "Strategic Architect" (Admin), "Vault" (File Storage).
- **Actions**: "Initiate Sync" (Follow), "Transmit" (Post), "Clear All" (Notification clear).

---

### 6. Responsive Guidelines (Safe Areas)
Antigravity is optimized for native-feel delivery on mobile.

- **Header/Footer**: Must respect `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`.
- **Navigation**: Bottom-primary on mobile. Sidebar-primary on desktop.
- **Touch Targets**: Buttons must be at least 44px on mobile devices.

---

### 7. Motion & Interaction
- **Transitions**: Use `motion/react` (Framer Motion) for all route and modal transitions.
- **Fade & Scale**: Prefer subtle scale-ups (0.98 -> 1.0) and opacity fades over sliding animations.
- **Stagger**: Feed items should stagger-in to emphasize content priority.
