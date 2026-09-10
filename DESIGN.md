# XcelerateAI Design System

## Product character

XcelerateAI is a personal Learning OS: calm, focused, progressive, and quietly expressive. The interface should make the learner's path and next action obvious without turning learning into a wall of metrics. Visual hierarchy comes from spacing, typography, and surface contrast before color or decoration.

The signature visual idea is a course journey. Controlled indigo, violet, blue, and cyan gradients may express movement through a course. Atmospheric waves are supporting texture, never animated wallpaper. Green, amber, and red are reserved primarily for state and feedback.

## Theme contract

The product supports `system`, `light`, and `dark` appearance preferences. System is the default and follows `prefers-color-scheme`, including changes made while the application is open. The preference is stored additively as `appearanceMode` inside `xca_settings`. A small document-head bootstrap resolves the theme before React renders to prevent a light/dark flash.

Use semantic tokens in `src/index.css` and their Tailwind aliases:

- Surfaces: `bg-app`, `bg-page`, `bg-surface`, `bg-elevated`, `bg-soft`, `bg-glass`, `bg-overlay`
- Type: `text-primary`, `text-secondary`, `text-muted`, `text-disabled`, `text-on-brand`
- Borders: `border-default`, `border-strong`, `border-focus`, `border-divider`
- Brand/status: `brand-blue`, `brand-violet`, `brand-cyan`, `brand-green`, `brand-amber`, `brand-red`

The legacy navy/slate palette is temporarily backed by theme-aware variables so untouched screens remain readable. This is a conservative migration bridge, not the preferred authoring model. Every later redesign should replace legacy palette utilities with semantic roles and reduce the bridge's footprint.

## Color and gradients

Light mode uses a soft cool canvas (`#F5F7FC`), white surfaces, deep ink text, and restrained translucent borders. Dark mode uses a deep blue-black canvas (`#0B1020`), navy surfaces (`#12182A`), soft white text, and low-contrast cool borders.

The core accent foundation is indigo, violet, blue, and cyan. The course-journey gradient intentionally uses uneven stops so it feels authored rather than like a generic two-color SaaS gradient. Do not fill every component with gradients. Use the journey gradient for primary progress, rare emphasis, and signature atmosphere.

All text and essential controls must remain readable in both themes. Text on saturated brand fills uses the dedicated on-brand color rather than the theme's primary text token.

## Typography

- Manrope: display headings and high-emphasis product moments
- Inter: navigation, controls, body text, labels, and supporting information
- JetBrains Mono: code and rare technical or numeric contexts only

Headings use tight tracking and strong weight. Labels may use compact uppercase text with increased letter spacing. Body copy should stay direct, legible, and generally between 13px and 16px. Avoid long uppercase phrases.

## Layout and spacing

The desktop shell uses a 256px expanded sidebar and a 76px collapsed sidebar. The content canvas stops around 1240px, but components should use only the width their content needs. Desktop gutters range from 24px to 40px; mobile gutters are 16px.

The base spacing rhythm is 4px, with common gaps at 8, 12, 16, 20, 24, 32, and 40px. Prefer fewer, more meaningful regions over grids of equal cards. Dashboard information should be understandable at 1366×768 with supporting regions omitted when they have no reliable data.

Cards use 20–28px radii depending on emphasis. Standard cards use solid semantic surfaces, a quiet border, and soft elevation. Glass is selective: navigation chrome and contained hero overlays are appropriate; ordinary content cards are not.

## Navigation

The fixed learner information architecture is:

1. Dashboard
2. Missions
3. Workspace
4. Progress
5. Settings

Settings remains visually quiet at the bottom of the desktop sidebar. Active navigation uses a soft accent capsule and clear icon/text color, not a heavy glow. The mobile header answers “Where am I?” and avoids redundant metrics. Mobile bottom navigation retains all five destinations with compact active treatment.

## Dashboard hierarchy

Dashboard is a learning launchpad, not an analytics page. Its order is:

1. Greeting, course/week context, and the canonical next learning action
2. A wide course-journey visualization using the canonical Course Progress value
3. Quiet, reliable context such as week and study streak
4. Optional Build progress and Needs attention regions when data exists

Do not show “Day” unless a future product decision establishes a reliable and useful meaning. Do not call a project “current” when the data only identifies the first unfinished project.

## Components and interaction

Primary actions use a solid brand fill and on-brand text. Secondary actions use an elevated semantic surface. Controls need visible focus states and a minimum comfortable touch target. Use icons to reinforce meaning, not as decoration.

Normal interactions use approximately 220ms with a responsive ease (`cubic-bezier(0.2, 0.8, 0.2, 1)`). A meaningful progress reveal may use up to 420ms. Avoid continuous decorative motion. Under `prefers-reduced-motion: reduce`, nonessential animation and smooth scrolling are suppressed.

## Accessibility and content rules

- Preserve visible keyboard focus.
- Use semantic headings, landmarks, and ARIA state where native semantics are insufficient.
- Never rely on color alone for status.
- Keep muted text legible in both themes.
- Use `Learner` as the safe greeting fallback.
- Preserve canonical progress calculations, course data, unlock logic, and route behavior during visual passes.
