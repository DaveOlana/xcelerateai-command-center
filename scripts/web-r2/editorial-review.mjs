const audit = (week, dependencies, found, repaired, rationale) => ({
  buildId: `WEBD-R2-B-W${String(week).padStart(2, '0')}-01`,
  weekId: `WEBD-R2-W${String(week).padStart(2, '0')}`,
  readiness: 'YES',
  dependencies,
  hiddenPrerequisitesFound: found,
  hiddenPrerequisitesRepaired: repaired,
  hiddenPrerequisitesRemaining: [],
  rationale,
});

export const editorialBuildAudits = [
  audit(1, [
    { name: 'Save and preview a complete HTML document through localhost', classification: 'taught-this-week', evidence: 'Setup verifies the preview route; Core Study and the supplied document shell establish save, refresh, title, metadata, and the source-versus-DOM boundary.' },
    { name: 'Create a meaningful document outline with landmarks, headings, links, and an image alternative', classification: 'taught-this-week', evidence: 'The Build fixes the required content, landmark count, heading hierarchy, link purposes, local asset, and alternative-text test before editing begins.' },
    { name: 'Find and repair invalid markup from evidence', classification: 'taught-this-week', evidence: 'The validator, Elements panel, keyboard route, missing-image case, and supplied missing closing-anchor defect make diagnosis reproducible.' },
  ], [
    'A blank first web project can force a beginner to invent content, structure, paths, accessibility decisions, and debugging procedure simultaneously.',
    'A local image and localhost preview can silently assume folder/path knowledge not covered by ordinary HTML introductions.',
  ], [
    'A complete commented shell, fixed fictional content outline, local SVG, exact acceptance checks, and two bounded sessions leave only semantic authoring and repair to the learner.',
    'Setup verifies the folder and localhost route; the Build supplies the asset path, a deliberate rename test, and exact recovery evidence.',
  ], 'Approved as a gentle first instructional Week: no CSS, JavaScript, arithmetic, calculator, framework, or open-ended visual design is required.'),
  audit(2, [
    { name: 'Attach and organize an external stylesheet', classification: 'taught-this-week', evidence: 'Core Study and the scaffold establish one relative stylesheet plus Reset, Tokens, Base, Layout, Components, and States sections.' },
    { name: 'Use cascade, inheritance, custom properties, typography, and the box model', classification: 'taught-this-week', evidence: 'The contract fixes the palette, spacing scale, shared classes, readable measure, and computed values that must be inspected.' },
    { name: 'Measure contrast and diagnose specificity', classification: 'taught-this-week', evidence: 'The learner records ratios and matched/computed declarations, then repairs one supplied over-specific rule without !important.' },
  ], [
    'Visual styling can become subjective and hide whether the learner understands the cascade or merely tweaks until it looks acceptable.',
    'Contrast and specificity tools can be named without giving a beginner an observable procedure.',
  ], [
    'The supplied copy, base palette, exact properties, long-title boundary, and reusable-class restrictions convert visual work into checkable behavior.',
    'The evidence sheet fixes the inspected element, computed properties, contrast threshold, competing selectors, and focused repair.',
  ], 'Approved because the artifact is bounded, accessibility evidence is concrete, and both 105-minute sessions remain under the two-hour cap.'),
  audit(3, [
    { name: 'Choose Flexbox for one-dimensional controls and Grid for card tracks', classification: 'taught-this-week', evidence: 'Study contrasts the layout models; the supplied six-card content fixes Flex navigation and 1/2/3-column Grid requirements.' },
    { name: 'Implement mobile-first breakpoints and fluid media', classification: 'taught-this-week', evidence: 'The contract supplies the 320, 768, and 1280 CSS-pixel cases, breakpoint minima, media behavior, and no-overflow outcome.' },
    { name: 'Diagnose overflow and reflow under zoom', classification: 'taught-this-week', evidence: 'A supplied fixed-width defect, DevTools inspection, 200 percent zoom, and long-title check produce observable evidence.' },
  ], [
    'Responsive design can require untaught visual design or device ownership if viewports and content are not fixed.',
    'Flexbox and Grid may be treated as interchangeable syntax rather than tools for different layout dimensions.',
  ], [
    'Six fixed cards, local media, exact viewports, column expectations, zoom case, and prohibition on fixed card heights bound the work.',
    'The contract assigns Flex to the wrapping control row and Grid to card tracks, then asks the learner to explain that choice.',
  ], 'Approved as a responsive layout progression from established HTML/CSS; no framework, image service, or design invention is required.'),
  audit(4, [
    { name: 'Use a small browser-JavaScript subset', classification: 'taught-this-week', evidence: 'Study introduces bindings, strings, booleans, conditions, named functions, querySelector(All), textContent, classList, and event listeners only.' },
    { name: 'Connect native controls to predictable DOM updates', classification: 'taught-this-week', evidence: 'The supplied HTML/CSS and three fixed buttons leave named JavaScript TODOs, four exact interaction traces, and keyboard behavior.' },
    { name: 'Repair a missing DOM selection from Console evidence', classification: 'taught-this-week', evidence: 'The selector typo produces a fixed null symptom and file/line clue before one-cause repair.' },
  ], [
    'DOM work can smuggle in arrays, object design, forms, storage, asynchronous code, and unsafe HTML insertion before they are taught.',
    'A button exercise may appear to work with mouse-only inline handlers while bypassing events and keyboard semantics.',
  ], [
    'Finished markup/styles, native buttons, fixed dataset values, named TODOs, and explicit exclusions keep the JavaScript surface small.',
    'The contract requires addEventListener, native Enter/Space behavior, no inline onclick, and a reviewer mouse/keyboard trace.',
  ], 'Approved as the first programming Week because content and layout are supplied and each observable state is predetermined.'),
  audit(5, [
    { name: 'Represent records with stable identity and derive a filtered view', classification: 'taught-this-week', evidence: 'Five supplied records, three filters, a stable data-id rule, and exact counts establish arrays, objects, filter, and event delegation.' },
    { name: 'Render canonical state safely', classification: 'taught-this-week', evidence: 'The supplied signatures require state-first updates and createElement/textContent rendering inside one owned region.' },
    { name: 'Serialize and restore valid local state', classification: 'taught-this-week', evidence: 'One supplied storage key, JSON stringify/parse, fresh/removal/reload cases, and a key-mismatch defect bound persistence.' },
  ], [
    'A generated checklist can force beginners to invent record shape, identity policy, event routing, filters, rendering, and storage recovery together.',
    'Malformed storage recovery would add error policy before network/error handling is taught.',
  ], [
    'The five records, stable IDs, function signatures, filter meanings, and exact test matrix are supplied; no form or item creation is required.',
    'Week 5 handles missing and valid JSON only and names malformed storage as a deferred limit closed by the supplied Week 8 helper.',
  ], 'Approved because the learner practices one canonical state and reload persistence without being asked to design an application architecture.'),
  audit(6, [
    { name: 'Construct an accessible semantic form', classification: 'taught-this-week', evidence: 'The fixed fields specify labels, fieldset/legend, native input types, required/minlength rules, consent, and submit behavior.' },
    { name: 'Expose invalid and successful outcomes accessibly', classification: 'taught-this-week', evidence: 'Supplied error helpers plus aria-describedby, aria-invalid, first-invalid focus, and live status are exercised through a fixed matrix.' },
    { name: 'Perform keyboard, focus, zoom, and label tests', classification: 'taught-this-week', evidence: 'The contract names the exact keyboard actions, 320-pixel/200-percent cases, and a supplied label/id defect.' },
  ], [
    'Form tasks often require backend submission or imply that local confirmation saved data remotely.',
    'Accessibility can be reduced to an automated score or a list of attributes without manual behavior checks.',
  ], [
    'The artifact is explicitly local-only, stores nothing, and shows an in-page preparation confirmation only after valid fictitious input.',
    'The proof requires label activation, focus order, radio/checkbox/submit keyboard behavior, visible focus, zoom/reflow, and human review.',
  ], 'Approved because the fixed form and supplied helpers keep focus on semantics, validation, and observable access behavior rather than backend work.'),
  audit(7, [
    { name: 'Fetch owned JSON through HTTP and check the response boundary', classification: 'taught-this-week', evidence: 'Setup already proves localhost; Study and the scaffold teach async/await, fetch, response.ok, JSON parsing, and project-relative paths.' },
    { name: 'Render loading, success, empty, and failure states', classification: 'taught-this-week', evidence: 'Normal, empty, missing, and malformed fixtures plus Slow 3G provide fixed transitions and expected UI results.' },
    { name: 'Diagnose a request in Network and Console', classification: 'taught-this-week', evidence: 'The singular-path defect produces a known 404 whose request URL, status, initiator, and repair are recorded.' },
  ], [
    'Fetching an external API can introduce accounts, keys, CORS, rate limits, changing data, and privacy concerns.',
    'A happy-path fetch can leave HTTP status handling, empty data, malformed JSON, retry, and loading visibility untested.',
  ], [
    'All fixtures are supplied locally and the setup-verified server provides the only origin; no external API or account is required.',
    'Four fixed fixtures, throttled loading, retry behavior, response.ok, and a URL/status/UI/console matrix make each branch observable.',
  ], 'Approved because the network model is realistic while deterministic local fixtures remove third-party availability and hidden-account risk.'),
  audit(8, [
    { name: 'Integrate semantic, responsive, interactive, persistent, and network behavior', classification: 'established-previously', evidence: 'Weeks 1-7 establish every required UI behavior; the capstone supplies the event records, state shape, function signatures, storage/error helper, and design shell.' },
    { name: 'Recover explicitly from malformed saved state', classification: 'taught-this-week', evidence: 'The supplied helper preserves the invalid value, blocks save toggles, explains the condition, and removes only one named key after explicit Reset.' },
    { name: 'Document, version, deploy, and verify a static site', classification: 'taught-this-week', evidence: 'The contract fixes the repository tree, ignore rules, README headings, meaningful commit minimum, GitHub Pages route, and live CSS/JS/JSON HTTP checks.' },
    { name: 'Run an integrated acceptance and human-review matrix', classification: 'reasonable-integration', evidence: 'Search, category, saved-only, failure/retry, keyboard, responsive, zoom, reload, and live-path cases reuse behavior already practiced separately.' },
  ], [
    'An open-ended capstone can force a beginner to invent data, architecture, visual design, storage policy, tests, and deployment simultaneously.',
    'Localhost localStorage does not transfer to the deployed origin, which can look like data loss unless stated and retested.',
  ], [
    'The starter fixes six sanitized records, semantic hooks, CSS tokens/reset, state/functions, recovery helper, README/test templates, exact behaviors, and exclusions.',
    'The contract explains origin separation and requires the live Pages site to be tested as fresh storage, then saved and reloaded at that same live origin.',
  ], 'Approved because the capstone adds integration and publication—not a new application stack—and splits work into 90-, 90-, and 60-minute sessions.'),
];

export const editorialWeekReadiness = [
  { weekId: 'WEBD-R2-W01', answer: 'YES', evidence: 'A complete shell, supplied copy outline/local asset, verified preview route, exact semantic checks, bounded validator defect, and two 90-minute sessions support a complete beginner.' },
  { weekId: 'WEBD-R2-W02', answer: 'YES', evidence: 'Supplied semantic markup, palette, CSS sections, computed-style table, contrast threshold, long-title boundary, and specificity defect make styling measurable rather than subjective.' },
  { weekId: 'WEBD-R2-W03', answer: 'YES', evidence: 'Six supplied cards, local media, fixed viewport matrix, explicit Flex/Grid responsibilities, zoom check, and one overflow repair bound responsive layout.' },
  { weekId: 'WEBD-R2-W04', answer: 'YES', evidence: 'Finished HTML/CSS, native controls, fixed dataset values, named JavaScript TODOs, exact traces, keyboard behavior, and one selector defect keep the first scripting task small.' },
  { weekId: 'WEBD-R2-W05', answer: 'YES', evidence: 'Five records, stable IDs, function signatures, filter meanings, storage key, and reload matrix let the learner focus on state/render/persistence rather than inventing a product.' },
  { weekId: 'WEBD-R2-W06', answer: 'YES', evidence: 'Fixed fictitious fields, native constraints, supplied feedback helpers, exact valid/invalid cases, keyboard/zoom checks, and one label repair make form quality observable.' },
  { weekId: 'WEBD-R2-W07', answer: 'YES', evidence: 'Setup already verifies localhost; supplied normal/empty/missing/malformed fixtures, async skeleton, state containers, Slow 3G check, and 404 diagnosis remove external API uncertainty.' },
  { weekId: 'WEBD-R2-W08', answer: 'YES', evidence: 'The starter supplies sanitized data, semantic hooks, tokens, state/functions, storage recovery, README/test templates, exact acceptance cases, deployment steps, and a human live-site review.' },
];

export const editorialSemanticReview = {
  status: 'PASS',
  method: 'Human-led adversarial review examined all 25 competency dependencies, 32 contextual concepts, bounded external Study assignments, 80 assessment targets, eight Build contracts, setup assumptions, session limits, accessibility progression, state/storage/network failure paths, Git safety, deployment boundaries, and required human evidence. Deterministic validators consume this judgment but do not create it.',
  findingsReviewed: [
    'Rejected Revision 1 generated concept-card pages and repeated microbuild wording as the primary learning route; Revision 2 uses inspected external instruction followed by observable browser practice.',
    'Kept Week 1 deliberately gentle with no CSS, JavaScript, arithmetic, calculator, blank-page design, or repository publication.',
    'Established localhost preview during setup so later relative paths and fetch do not rely on file URLs or an undisclosed server prerequisite.',
    'Separated HTML semantics, CSS systems, responsive layout, small JavaScript behavior, canonical state, forms/accessibility, and network states into a dependency-respecting sequence.',
    'Required actual validator, Elements, Styles, Computed, Console, Application, Network, keyboard, viewport, zoom, reload, and live-deployment evidence rather than unsupported quality claims.',
    'Used local sanitized JSON fixtures rather than an external API, key, paid service, changing endpoint, or CORS-sensitive dependency.',
    'Required all graded items to map to bounded Core instruction from the current or earlier Week, assess distinct decisions, and use plausible web-development distractors with shuffled runtime order.',
    'Kept every instructional Build session at 105 minutes or less and every capstone segment at 90 minutes or less; setup is separate and capability-skippable after verification.',
  ],
  adversarialResult: 'PASS after recorded repairs. A basic-computer-literate learner receives the environment, content, data, scaffolds, failure cases, review procedure, and deployment boundary needed to complete each artifact without inventing hidden architecture or relying on generic course-owned definition cards.',
};

export const editorialRepairLedger = [
  { finding: 'Revision 1 used course-owned generated concept pages as the main Study experience.', repair: 'Revision 2 uses bounded live external explanations, demonstrations, interactive practice, validators, and browser tooling; each card states exactly what to consume, where to stop, what to produce mentally, and what to do next.' },
  { finding: 'The earlier generic template repeated the same definition/apply/predict/debug wording across unrelated topics.', repair: 'Each Week now has its own artifact, supplied scaffold, exact browser behaviors, deliberate defect, acceptance matrix, evidence form, and human-review route.' },
  { finding: 'A first-session calculator or interactive app would combine too many prerequisites.', repair: 'Week 1 creates a semantic Semester Guide from a supplied shell and copy outline, then validates, navigates, breaks, and repairs markup only.' },
  { finding: 'Resource diversity could become a format quota or a documentation-heavy route.', repair: 'Resources are chosen point by point for learning role and include demonstrations, interactive games/labs, tutorials, DevTools practice, validators, and focused references; documentation is bounded and paired with action.' },
  { finding: 'Browser JavaScript could assume prior programming or introduce a full application model immediately.', repair: 'Week 4 teaches only the values, named functions, selectors, safe DOM updates, class changes, and native-control events needed for one fixed notice switcher.' },
  { finding: 'Persistence can silently trust malformed saved text or overwrite it during fallback.', repair: 'Week 5 limits scope to missing/valid saved state and names malformed input as a limit; the Week 8 supplied helper preserves invalid data, blocks mutation, explains recovery, and resets only the named key after consent.' },
  { finding: 'Form exercises can imply a backend submission and accessibility can collapse into attribute copying.', repair: 'Week 6 is explicitly local-only and requires manual label, keyboard, focus, error association, status, zoom, and narrow-width evidence with fictitious data.' },
  { finding: 'External API work creates hidden network, account, key, data-shape, and availability dependencies.', repair: 'Week 7 uses owned local fixtures for normal, empty, 404, and malformed responses through the setup-verified localhost origin.' },
  { finding: 'A capstone can become an open-ended product-design and architecture exam.', repair: 'FreshStart Hub supplies the sanitized schema/data, semantic hooks, visual tokens, state/function signatures, safe storage/error helper, README and test templates, exact results, and explicit exclusions.' },
  { finding: 'Deployment can pass locally while failing under a repository base path or case-sensitive host.', repair: 'The final proof verifies the live HTML, CSS, JavaScript, and JSON URLs individually, reloads the published route, and records asset statuses plus same-origin saved-state behavior.' },
];
