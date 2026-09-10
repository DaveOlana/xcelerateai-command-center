# Knowledge Map — Elliot Product Track

**Stage:** 2 of the XcelerateAI Curriculum System, authored per `KNOWLEDGE_MAP_GUIDE.md`.
**Status:** retro-fitted. This track was originally built without a Knowledge Map, which is the documented root cause of its blurred, indistinguishable missions. This document supplies the missing stage.

**This document is a required input to BOTH Stage 3 (Resource Discovery) and Stage 5 (Curriculum Creation).** Neither stage reads competencies from Blueprint prose.

---

## Summary

| | |
|---|---|
| Total competencies | **170** |
| Core (must be mission-covered) | 161 |
| Stretch (optional enrichment) | 4 |
| Out of scope (deliberate exclusions) | 5 |
| Foundational / Intermediate / Advanced | 39 / 86 / 45 |
| Entry points (no prerequisites) | `ENV-TERM-01`, `ENV-EDITOR-01`, `DOC-README-01` |

**Graph validated:** acyclic, every prerequisite resolves, a full topological order exists, and every prerequisite precedes its dependent in that order — so no forward reference is possible. 1,249 automated checks, 0 failures.

---

## trackScope — the Seam 1 resolution

`KNOWLEDGE_MAP_GUIDE.md` requires listing every competency and explicitly forbids cutting any to fit the available time. `CURRICULUM_CREATION_GUIDE.md` and `JSON_VALIDATION_GUIDE.md` both then require that *every* mapped competency be covered by at least one mission. For any real profession those three cannot all hold, and validation could never pass.

Resolution, approved by the operator: each competency carries a **`trackScope`**.

- **`core`** — essential to this track's stated outcome (Elliot V1). **Must** be covered by at least one mission. A gap here is a genuine finding, never something to relabel away.
- **`stretch`** — genuinely valuable, offered through stretch goals or optional resources. Not required to be mission-covered.
- **`out-of-scope`** — part of the profession but deliberately excluded from this track. Recorded so the omission is a visible decision rather than an oversight, and so a later track can pick it up.

The Stage 5 and Stage 7 coverage checks apply to **`core` only**.

---

## How to read an entry

Each competency carries an **authored** ID (never tokenized from a week or mission title), a plain skill name, a description, its prerequisite IDs, a depth level, a one-line demonstration of mastery, and its trackScope.

---

## Environment & tooling

### `ENV-TERM-01` — Terminal and command line

Navigating folders and running commands from a shell.

- **Depth:** Foundational
- **Prerequisites:** _none — entry point_
- **Demonstrated by:** Run a command in the project folder and read its output.

### `ENV-EDITOR-01` — Editor and project folders

Opening a project folder in an editor and creating files within it.

- **Depth:** Foundational
- **Prerequisites:** _none — entry point_
- **Demonstrated by:** Open a folder in VS Code and create a new file inside it.

### `ENV-NODE-01` — Node.js runtime

What Node.js is and confirming it is installed and reporting a version.

- **Depth:** Foundational
- **Prerequisites:** `ENV-TERM-01` Terminal and command line
- **Demonstrated by:** Run node -v and explain what the runtime does.

### `ENV-RUN-01` — Running a JavaScript file

Executing a .js file with Node and seeing its output.

- **Depth:** Foundational
- **Prerequisites:** `ENV-NODE-01` Node.js runtime · `ENV-EDITOR-01` Editor and project folders
- **Demonstrated by:** Run node file.js and see the expected output.

### `NODE-NPM-01` — npm and package installation

Initialising a project and installing a dependency.

- **Depth:** Foundational
- **Prerequisites:** `ENV-NODE-01` Node.js runtime
- **Demonstrated by:** Initialise a project and install a package.

### `NODE-SCRIPT-01` — npm run scripts

Defining and running a named script so a project starts with one command.

- **Depth:** Intermediate
- **Prerequisites:** `NODE-NPM-01` npm and package installation
- **Demonstrated by:** Start the project with a single npm script.


## Version control & evidence

### `GIT-INIT-01` — Git init and first commit

Turning a folder into a repository and recording a first snapshot.

- **Depth:** Foundational
- **Prerequisites:** `ENV-TERM-01` Terminal and command line
- **Demonstrated by:** Initialise a repo and create a commit.

### `GIT-STAGE-01` — Git staging and commits

The staging area, and what git status reports before and after a commit.

- **Depth:** Foundational
- **Prerequisites:** `GIT-INIT-01` Git init and first commit
- **Demonstrated by:** Stage selected changes and explain what git status showed at each step.

### `GIT-REPO-01` — Repository structure

Organising a repository so a stranger can navigate it.

- **Depth:** Intermediate
- **Prerequisites:** `GIT-STAGE-01` Git staging and commits
- **Demonstrated by:** Lay out a repo with a clear folder scheme and explain the scheme.

### `GIT-MSG-01` — Meaningful commit messages

Writing messages that describe intent rather than mechanics.

- **Depth:** Intermediate
- **Prerequisites:** `GIT-STAGE-01` Git staging and commits
- **Demonstrated by:** Produce a commit history whose messages explain why each change happened.

### `DOC-README-01` — Technical documentation (README)

Writing setup and usage instructions a stranger can follow without help.

- **Depth:** Foundational
- **Prerequisites:** _none — entry point_
- **Demonstrated by:** Write a README another person can follow to run the project.

### `DOC-PROOF-01` — Proof-of-work capture

Recording evidence that work happened: commits, screenshots, notes.

- **Depth:** Foundational
- **Prerequisites:** `DOC-README-01` Technical documentation (README) · `GIT-STAGE-01` Git staging and commits
- **Demonstrated by:** Submit a repo link, commit and screenshot evidencing a completed build.

### `GIT-BUGLOG-01` — Bug logging

Keeping a written record of failures encountered and how they were resolved.

- **Depth:** Intermediate
- **Prerequisites:** `DOC-README-01` Technical documentation (README)
- **Demonstrated by:** Maintain a bug log with cause and fix for each entry.

### `GIT-PROOFREC-01` — Weekly proof records

Maintaining a per-week evidence trail across a long project.

- **Depth:** Intermediate
- **Prerequisites:** `DOC-PROOF-01` Proof-of-work capture
- **Demonstrated by:** Produce a weekly proof section covering several weeks of work.

### `DOC-FINDINGS-01` — Documenting findings and constraints

Recording what was learned, including limits, so another person can act.

- **Depth:** Intermediate
- **Prerequisites:** `DOC-README-01` Technical documentation (README)
- **Demonstrated by:** Hand over an audit another developer could act on unaided.


## JavaScript language core

### `JS-LOG-01` — Program output with console.log

Printing values so a program can be observed while it runs.

- **Depth:** Foundational
- **Prerequisites:** `ENV-RUN-01` Running a JavaScript file
- **Demonstrated by:** Print several values and confirm them in the terminal.

### `JS-VAR-01` — Variable declaration

Storing a value under a name with let or const, and choosing between them.

- **Depth:** Foundational
- **Prerequisites:** `JS-LOG-01` Program output with console.log
- **Demonstrated by:** Declare variables, print them, and explain the let/const choice.

### `JS-TYPE-01` — Primitive data types

Strings, numbers and booleans, and choosing the type that fits a fact.

- **Depth:** Foundational
- **Prerequisites:** `JS-VAR-01` Variable declaration
- **Demonstrated by:** Model several real facts using the correct primitive type for each.

### `JS-STR-01` — Strings and concatenation

Building text from stored values.

- **Depth:** Foundational
- **Prerequisites:** `JS-TYPE-01` Primitive data types
- **Demonstrated by:** Build a printed message from several string variables.

### `JS-TMPL-01` — Template literals

Embedding expressions in multi-line strings with backtick syntax.

- **Depth:** Foundational
- **Prerequisites:** `JS-STR-01` Strings and concatenation
- **Demonstrated by:** Produce a multi-line report using one template literal with embedded values.

### `JS-NUM-01` — Arithmetic operators

Calculating with numbers and reading the result.

- **Depth:** Foundational
- **Prerequisites:** `JS-TYPE-01` Primitive data types
- **Demonstrated by:** Compute a total from stored inputs rather than typing the answer.

### `JS-NAN-01` — NaN and type coercion

Why arithmetic on text produces NaN, and how to trace it to its source.

- **Depth:** Intermediate
- **Prerequisites:** `JS-NUM-01` Arithmetic operators
- **Demonstrated by:** Trigger NaN deliberately, trace its origin and correct the type.

### `JS-DERIVE-01` — Deriving values from stored values

Computing new facts from existing ones instead of duplicating them.

- **Depth:** Foundational
- **Prerequisites:** `JS-NUM-01` Arithmetic operators
- **Demonstrated by:** Compute a remaining-amount value from stored totals.

### `JS-EDGE-01` — Edge-case handling

Deciding what a program should do at the boundaries of valid input.

- **Depth:** Intermediate
- **Prerequisites:** `JS-DERIVE-01` Deriving values from stored values
- **Demonstrated by:** Handle an out-of-range input with a deliberate, stated behaviour.

### `JS-REFACTOR-01` — Refactoring repetition into variables

Removing duplicated literals so a change happens in one place.

- **Depth:** Foundational
- **Prerequisites:** `JS-VAR-01` Variable declaration
- **Demonstrated by:** Lift a repeated literal into a variable and show the single point of change.

### `JS-BOOL-01` — Boolean comparison operators

Comparing values to produce true or false, including === versus =.

- **Depth:** Foundational
- **Prerequisites:** `JS-TYPE-01` Primitive data types
- **Demonstrated by:** Write comparisons and explain why === is used rather than =.

### `JS-COND-01` — Conditional branching

Choosing between paths with if / else if / else.

- **Depth:** Foundational
- **Prerequisites:** `JS-BOOL-01` Boolean comparison operators
- **Demonstrated by:** Produce three distinct outcomes from one branching chain.

### `JS-COND-02` — Ordering multiple conditions

Sequencing conditions so a broad test does not swallow a specific case.

- **Depth:** Intermediate
- **Prerequisites:** `JS-COND-01` Conditional branching
- **Demonstrated by:** Order a chain correctly and justify why that order is required.

### `JS-FUNC-01` — Function declarations

Naming a reusable block of logic and calling it.

- **Depth:** Foundational
- **Prerequisites:** `JS-VAR-01` Variable declaration
- **Demonstrated by:** Declare a function and call it more than once.

### `JS-FUNC-02` — Parameters and arguments

Passing values into a function so it works on varied input.

- **Depth:** Foundational
- **Prerequisites:** `JS-FUNC-01` Function declarations
- **Demonstrated by:** Call one function with several different inputs.

### `JS-FUNC-03` — Return values versus printing

Why returning a value makes a function reusable where printing does not.

- **Depth:** Intermediate
- **Prerequisites:** `JS-FUNC-02` Parameters and arguments
- **Demonstrated by:** Use one function's returned value inside other code.

### `JS-FUNC-04` — Decomposing logic into helpers

Splitting a problem into single-purpose functions.

- **Depth:** Intermediate
- **Prerequisites:** `JS-FUNC-03` Return values versus printing
- **Demonstrated by:** Break one task into helpers that are each independently testable.

### `JS-COMPOSE-01` — Composing functions with conditionals

Combining reusable logic and branching into one coherent decision flow.

- **Depth:** Intermediate
- **Prerequisites:** `JS-FUNC-03` Return values versus printing · `JS-COND-01` Conditional branching
- **Demonstrated by:** Build a decision that calls helper functions and resolves to one outcome.

### `JS-TEST-01` — Scenario-based manual testing

Defining expected results per scenario before checking the code against them.

- **Depth:** Intermediate
- **Prerequisites:** `JS-COMPOSE-01` Composing functions with conditionals
- **Demonstrated by:** Test several named scenarios against a written expectation for each.

### `JS-INTEGRATE-01` — Integrating core JavaScript constructs

Using variables, functions, conditionals, arrays and objects together in one program.

- **Depth:** Intermediate
- **Prerequisites:** `JS-COMPOSE-01` Composing functions with conditionals · `DATA-AOO-01` Arrays of objects · `DATA-LOOP-01` Iteration with loops
- **Demonstrated by:** Ship a multi-file program that uses every core construct purposefully.


## Data structures & modules

### `DATA-ARR-01` — Arrays and indexing

Holding an ordered collection and reading items by position.

- **Depth:** Foundational
- **Prerequisites:** `JS-VAR-01` Variable declaration
- **Demonstrated by:** Store several items in one array and read a specific one.

### `DATA-LOOP-01` — Iteration with loops

Processing every item in a collection without repeating code.

- **Depth:** Foundational
- **Prerequisites:** `DATA-ARR-01` Arrays and indexing
- **Demonstrated by:** Print every item in an array with one loop.

### `DATA-IDX-01` — Zero-based index versus display numbering

Deriving human-facing numbering from a zero-based position.

- **Depth:** Foundational
- **Prerequisites:** `DATA-LOOP-01` Iteration with loops
- **Demonstrated by:** Print a list numbered from one while iterating from zero.

### `DATA-OBJ-01` — Objects and key-value pairs

Grouping related facts about one entity under named keys.

- **Depth:** Foundational
- **Prerequisites:** `JS-VAR-01` Variable declaration
- **Demonstrated by:** Model one entity as an object and read its properties.

### `DATA-OBJ-02` — Nested property access

Reading values several levels deep, and why a typo returns undefined.

- **Depth:** Intermediate
- **Prerequisites:** `DATA-OBJ-01` Objects and key-value pairs
- **Demonstrated by:** Read a nested value and explain what a misspelled key returns.

### `DATA-OBJ-03` — Updating a property after creation

Mutating one field of an existing object.

- **Depth:** Foundational
- **Prerequisites:** `DATA-OBJ-01` Objects and key-value pairs
- **Demonstrated by:** Change one property and show the before and after.

### `DATA-AOO-01` — Arrays of objects

Modelling a collection of entities, each with its own fields.

- **Depth:** Intermediate
- **Prerequisites:** `DATA-ARR-01` Arrays and indexing · `DATA-OBJ-01` Objects and key-value pairs
- **Demonstrated by:** Build an array of objects and summarise each in a loop.

### `DATA-METHODS-01` — Array methods (map, filter, find) &nbsp;·&nbsp; **stretch**

Transforming and searching collections declaratively.

- **Depth:** Intermediate
- **Prerequisites:** `DATA-LOOP-01` Iteration with loops
- **Demonstrated by:** Search a collection with find or filter instead of a manual loop.

### `MOD-FILE-01` — Multi-file code organisation

Splitting a program across files by responsibility.

- **Depth:** Intermediate
- **Prerequisites:** `JS-FUNC-01` Function declarations
- **Demonstrated by:** Separate data, helpers and entry point into distinct files.

### `MOD-IMPORT-01` — Module imports and exports

Sharing values between files explicitly.

- **Depth:** Intermediate
- **Prerequisites:** `MOD-FILE-01` Multi-file code organisation
- **Demonstrated by:** Export from one file and consume it in another.


## Debugging discipline

### `DBG-READ-01` — Reading an error and locating its source

Using an error message to find the failing line rather than guessing.

- **Depth:** Foundational
- **Prerequisites:** `ENV-RUN-01` Running a JavaScript file
- **Demonstrated by:** Cause an error deliberately, read it, and fix the named line.

### `DBG-VERIFY-01` — Systematic verification against test cases

Checking a build against every stated criterion rather than a spot check.

- **Depth:** Intermediate
- **Prerequisites:** `DBG-READ-01` Reading an error and locating its source
- **Demonstrated by:** Run every test case for a build and record each result.

### `DBG-BREAK-01` — Controlled failure and recovery

Breaking one thing on purpose to observe its signature, then repairing it.

- **Depth:** Intermediate
- **Prerequisites:** `DBG-VERIFY-01` Systematic verification against test cases
- **Demonstrated by:** Introduce one deliberate fault, observe how it presents, and repair it.

### `DBG-DOC-01` — Documenting a fix

Recording the symptom, the cause and the repair so it is reusable knowledge.

- **Depth:** Intermediate
- **Prerequisites:** `DBG-BREAK-01` Controlled failure and recovery
- **Demonstrated by:** Write up a fault: what was seen, what caused it, what resolved it.

### `DBG-ISOLATE-01` — Isolating a failure to one layer

Determining which part of a multi-part system actually failed.

- **Depth:** Advanced
- **Prerequisites:** `DBG-VERIFY-01` Systematic verification against test cases
- **Demonstrated by:** Given a failure spanning client and server, identify which side is at fault.


## HTML & CSS

### `HTML-SEM-01` — Semantic HTML structure

Describing a page with elements that carry meaning.

- **Depth:** Foundational
- **Prerequisites:** `ENV-EDITOR-01` Editor and project folders
- **Demonstrated by:** Build a page using meaningful sectioning elements.

### `CSS-LINK-01` — Linking a stylesheet

Connecting CSS to a page and confirming it applied.

- **Depth:** Foundational
- **Prerequisites:** `HTML-SEM-01` Semantic HTML structure
- **Demonstrated by:** Link a stylesheet and prove it is in effect.

### `CSS-SEL-01` — CSS selectors

Targeting elements to style them.

- **Depth:** Foundational
- **Prerequisites:** `CSS-LINK-01` Linking a stylesheet
- **Demonstrated by:** Style specific elements using class and element selectors.

### `CSS-BOX-01` — The box model

How padding, border and margin determine an element's space.

- **Depth:** Foundational
- **Prerequisites:** `CSS-SEL-01` CSS selectors
- **Demonstrated by:** Control spacing deliberately using the box model.

### `CSS-LAYOUT-01` — Flexbox or Grid layout

Arranging elements in rows, columns or a grid.

- **Depth:** Intermediate
- **Prerequisites:** `CSS-BOX-01` The box model
- **Demonstrated by:** Lay out a card row that reflows sensibly.

### `CSS-RESP-01` — Responsive layout at narrow viewports

Designing so content remains usable as the viewport narrows. Distinct from React Native mobile work: this is CSS in a browser.

- **Depth:** Intermediate
- **Prerequisites:** `CSS-LAYOUT-01` Flexbox or Grid layout
- **Demonstrated by:** Show a layout that does not overflow at 360px wide.

### `CSS-TAILWIND-01` — Utility-first styling with Tailwind &nbsp;·&nbsp; **stretch**

Composing styles from utility classes rather than bespoke CSS.

- **Depth:** Intermediate
- **Prerequisites:** `CSS-SEL-01` CSS selectors
- **Demonstrated by:** Style a component using utility classes.


## DOM

### `DOM-TREE-01` — The DOM as a tree of nodes

The page as a structure JavaScript can read and change.

- **Depth:** Foundational
- **Prerequisites:** `HTML-SEM-01` Semantic HTML structure · `JS-VAR-01` Variable declaration
- **Demonstrated by:** Describe a page's structure as a tree and locate a node within it.

### `DOM-SEL-01` — Selecting elements with querySelector

Finding a specific element from JavaScript.

- **Depth:** Foundational
- **Prerequisites:** `DOM-TREE-01` The DOM as a tree of nodes
- **Demonstrated by:** Select an element and confirm the selector matched.

### `DOM-TEXT-01` — Reading and writing textContent

Changing what a page displays from code.

- **Depth:** Foundational
- **Prerequisites:** `DOM-SEL-01` Selecting elements with querySelector
- **Demonstrated by:** Change an element's text from JavaScript.

### `DOM-TIMING-01` — Script timing relative to page load

Why code running before elements exist cannot find them.

- **Depth:** Intermediate
- **Prerequisites:** `DOM-SEL-01` Selecting elements with querySelector
- **Demonstrated by:** Explain and fix a selector that failed because it ran too early.

### `DOM-CLASS-01` — Updating classes from JavaScript

Changing appearance by toggling classes rather than inline styles.

- **Depth:** Intermediate
- **Prerequisites:** `DOM-SEL-01` Selecting elements with querySelector · `CSS-SEL-01` CSS selectors
- **Demonstrated by:** Toggle a class to change an element's appearance.

### `DOM-CONSOLE-01` — Keeping the browser console clean

Treating console errors and warnings as defects rather than noise.

- **Depth:** Intermediate
- **Prerequisites:** `DOM-SEL-01` Selecting elements with querySelector · `DBG-READ-01` Reading an error and locating its source
- **Demonstrated by:** Deliver a page with no console errors and explain any warning resolved.


## Events

### `EVT-MODEL-01` — The browser event model

Code that waits and responds rather than running once top to bottom.

- **Depth:** Intermediate
- **Prerequisites:** `DOM-SEL-01` Selecting elements with querySelector
- **Demonstrated by:** Explain how event-driven execution differs from sequential execution.

### `EVT-LISTEN-01` — addEventListener and click handlers

Attaching behaviour to a user action.

- **Depth:** Foundational
- **Prerequisites:** `EVT-MODEL-01` The browser event model
- **Demonstrated by:** Wire a button so clicking it runs your code.

### `EVT-UPDATE-01` — Updating the page from an event

Changing displayed content in response to user action.

- **Depth:** Foundational
- **Prerequisites:** `EVT-LISTEN-01` addEventListener and click handlers · `DOM-TEXT-01` Reading and writing textContent
- **Demonstrated by:** Change page text when a button is clicked.

### `EVT-STATE-01` — Reflecting state change in the UI

Keeping what the user sees consistent with the underlying state.

- **Depth:** Intermediate
- **Prerequisites:** `EVT-UPDATE-01` Updating the page from an event · `DOM-CLASS-01` Updating classes from JavaScript
- **Demonstrated by:** Show a state change through both text and styling.

### `EVT-DISABLE-01` — Disabling a control after use

Preventing an action that should only happen once.

- **Depth:** Intermediate
- **Prerequisites:** `EVT-STATE-01` Reflecting state change in the UI
- **Demonstrated by:** Disable a button after its action completes.


## Forms, JSON & browser storage

### `FORM-INPUT-01` — Forms and reading input values

Collecting text from a user and reading it in code.

- **Depth:** Foundational
- **Prerequisites:** `HTML-SEM-01` Semantic HTML structure · `EVT-LISTEN-01` addEventListener and click handlers
- **Demonstrated by:** Read a value the user typed and use it.

### `FORM-DEFAULT-01` — Preventing default form submission

Stopping the browser reloading the page on submit.

- **Depth:** Intermediate
- **Prerequisites:** `FORM-INPUT-01` Forms and reading input values
- **Demonstrated by:** Submit a form without the page reloading.

### `FORM-VALID-01` — Rejecting empty or invalid input

Refusing input that should not be accepted, with a clear reason.

- **Depth:** Intermediate
- **Prerequisites:** `FORM-INPUT-01` Forms and reading input values
- **Demonstrated by:** Reject an empty submission with a specific message.

### `JSON-FMT-01` — JSON as a data format

The shape and rules of JSON, and why it is used to exchange data.

- **Depth:** Foundational
- **Prerequisites:** `DATA-OBJ-01` Objects and key-value pairs
- **Demonstrated by:** Read a JSON structure and describe what it contains.

### `JSON-SER-01` — JSON.stringify and JSON.parse

Converting between objects and their text representation.

- **Depth:** Intermediate
- **Prerequisites:** `JSON-FMT-01` JSON as a data format
- **Demonstrated by:** Round-trip an object through text and back without loss.

### `STOR-LOCAL-01` — localStorage get and set

Persisting data in the browser across page loads.

- **Depth:** Intermediate
- **Prerequisites:** `JSON-SER-01` JSON.stringify and JSON.parse
- **Demonstrated by:** Save a value and read it back after a refresh.

### `STOR-ROUND-01` — Serialisation round-trip through storage

Why storage holds only strings, and what happens when that is forgotten.

- **Depth:** Intermediate
- **Prerequisites:** `STOR-LOCAL-01` localStorage get and set
- **Demonstrated by:** Store and retrieve a structured value correctly, and explain the failure mode.

### `STOR-RENDER-01` — Rendering a list from stored data

Drawing the interface from persisted data as the single source of truth.

- **Depth:** Intermediate
- **Prerequisites:** `STOR-LOCAL-01` localStorage get and set · `DATA-LOOP-01` Iteration with loops · `DOM-TEXT-01` Reading and writing textContent
- **Demonstrated by:** Render a saved list that survives a refresh.

### `STOR-DELETE-01` — Deleting a stored item

Removing an entry from both the display and the underlying store.

- **Depth:** Intermediate
- **Prerequisites:** `STOR-RENDER-01` Rendering a list from stored data
- **Demonstrated by:** Delete one item and confirm it stays gone after refresh.


## Async & fetch

### `ASYNC-PROMISE-01` — Promises and async/await

Working with results that arrive later without blocking.

- **Depth:** Intermediate
- **Prerequisites:** `JS-FUNC-03` Return values versus printing
- **Demonstrated by:** Await an asynchronous result and use it once available.

### `FETCH-GET-01` — The fetch API

Requesting data over the network and parsing the response.

- **Depth:** Intermediate
- **Prerequisites:** `ASYNC-PROMISE-01` Promises and async/await · `JSON-SER-01` JSON.stringify and JSON.parse
- **Demonstrated by:** Fetch JSON and log the parsed result.

### `FETCH-RENDER-01` — Rendering fetched data

Turning a network response into visible interface.

- **Depth:** Intermediate
- **Prerequisites:** `FETCH-GET-01` The fetch API · `DOM-TEXT-01` Reading and writing textContent
- **Demonstrated by:** Render cards from fetched JSON.

### `FETCH-STATES-01` — Loading and error states

Showing the user what is happening while a request is pending or failed.

- **Depth:** Intermediate
- **Prerequisites:** `FETCH-GET-01` The fetch API
- **Demonstrated by:** Show a loading indicator and a real error message on failure.


## React

### `REACT-VITE-01` — Vite project structure

Scaffolding and running a modern frontend project.

- **Depth:** Foundational
- **Prerequisites:** `NODE-NPM-01` npm and package installation
- **Demonstrated by:** Create and run a Vite React project.

### `REACT-JSX-01` — Components and JSX

Describing interface as composable functions returning markup.

- **Depth:** Intermediate
- **Prerequisites:** `JS-FUNC-01` Function declarations · `HTML-SEM-01` Semantic HTML structure · `REACT-VITE-01` Vite project structure
- **Demonstrated by:** Build a component that renders on the page.

### `REACT-IMPORT-01` — Component imports and exports

Sharing components across files.

- **Depth:** Intermediate
- **Prerequisites:** `REACT-JSX-01` Components and JSX · `MOD-IMPORT-01` Module imports and exports
- **Demonstrated by:** Export a component and render it from another file.

### `REACT-PROPS-01` — Props and one-way data flow

Passing data down so one component can render many variations.

- **Depth:** Intermediate
- **Prerequisites:** `REACT-JSX-01` Components and JSX
- **Demonstrated by:** Render the same component twice with different props.

### `REACT-COMPOSE-01` — Component composition

Building larger interfaces from smaller components.

- **Depth:** Intermediate
- **Prerequisites:** `REACT-PROPS-01` Props and one-way data flow
- **Demonstrated by:** Assemble a screen from several independent components.

### `REACT-LIST-01` — Rendering a list from an array

Producing many elements from one description and a collection.

- **Depth:** Intermediate
- **Prerequisites:** `REACT-PROPS-01` Props and one-way data flow · `DATA-LOOP-01` Iteration with loops
- **Demonstrated by:** Render a card per item from an array.

### `REACT-KEY-01` — Stable keys in rendered lists

Why list items need stable identity, and what index keys break.

- **Depth:** Advanced
- **Prerequisites:** `REACT-LIST-01` Rendering a list from an array
- **Demonstrated by:** Explain and fix a duplicate or index-based key problem.

### `REACT-STATE-01` — State with useState

Data a component owns that changes over time and triggers re-render.

- **Depth:** Intermediate
- **Prerequisites:** `REACT-JSX-01` Components and JSX
- **Demonstrated by:** Change the interface by changing state, not the DOM directly.

### `REACT-CTRL-01` — Controlled form inputs

Binding an input so state is the source of truth for its value.

- **Depth:** Intermediate
- **Prerequisites:** `REACT-STATE-01` State with useState · `FORM-INPUT-01` Forms and reading input values
- **Demonstrated by:** Bind an input to state and read the value on submit.

### `REACT-IMMUT-01` — Immutable state updates

Producing new values rather than mutating existing ones so React re-renders.

- **Depth:** Advanced
- **Prerequisites:** `REACT-STATE-01` State with useState · `DATA-ARR-01` Arrays and indexing
- **Demonstrated by:** Add to a list immutably and explain why mutation fails silently.

### `REACT-LISTSTATE-01` — Rendering a list from state

Driving a rendered list from state so it updates as state changes.

- **Depth:** Intermediate
- **Prerequisites:** `REACT-STATE-01` State with useState · `REACT-LIST-01` Rendering a list from an array
- **Demonstrated by:** Add an item and see the rendered list update immediately.

### `REACT-DERIVE-01` — Deriving values from state

Computing values from state rather than storing them separately.

- **Depth:** Intermediate
- **Prerequisites:** `REACT-STATE-01` State with useState
- **Demonstrated by:** Display a count derived from a list rather than tracked alongside it.


## Routing

### `ROUTE-CLIENT-01` — Client-side routing

Multiple screens in one application without full page loads.

- **Depth:** Intermediate
- **Prerequisites:** `REACT-COMPOSE-01` Component composition
- **Demonstrated by:** Open several routes in one app.

### `ROUTE-LINK-01` — Routes and navigation links

Declaring paths and moving between them.

- **Depth:** Intermediate
- **Prerequisites:** `ROUTE-CLIENT-01` Client-side routing
- **Demonstrated by:** Navigate between screens via links.

### `ROUTE-LAYOUT-01` — Shared layout components

One frame holding navigation while the active screen renders inside it.

- **Depth:** Intermediate
- **Prerequisites:** `ROUTE-CLIENT-01` Client-side routing
- **Demonstrated by:** Render several pages inside one shared layout.

### `ROUTE-ACTIVE-01` — Active navigation state

Showing the user which screen they are on.

- **Depth:** Intermediate
- **Prerequisites:** `ROUTE-LINK-01` Routes and navigation links
- **Demonstrated by:** Highlight the active route in the navigation.


## Node & Express backend

### `EXPRESS-SERVER-01` — Express server setup

Starting a server process that listens for requests.

- **Depth:** Intermediate
- **Prerequisites:** `NODE-NPM-01` npm and package installation
- **Demonstrated by:** Start a server and reach it in a browser.

### `EXPRESS-ROUTE-01` — Route handlers

Mapping a URL path to code that answers it.

- **Depth:** Intermediate
- **Prerequisites:** `EXPRESS-SERVER-01` Express server setup
- **Demonstrated by:** Add a route and get its response in a browser.

### `HTTP-MODEL-01` — The request/response cycle

What travels between a client and a server, and in what order.

- **Depth:** Intermediate
- **Prerequisites:** `EXPRESS-ROUTE-01` Route handlers
- **Demonstrated by:** Trace one request from client to handler and back.

### `EXPRESS-JSON-01` — Serving JSON responses

Returning structured data rather than markup.

- **Depth:** Intermediate
- **Prerequisites:** `EXPRESS-ROUTE-01` Route handlers · `JSON-FMT-01` JSON as a data format
- **Demonstrated by:** Return JSON from a route and read it in a browser.

### `HTTP-METHOD-01` — HTTP methods and REST semantics

Using GET, POST, PATCH and DELETE to mean distinct operations.

- **Depth:** Intermediate
- **Prerequisites:** `HTTP-MODEL-01` The request/response cycle
- **Demonstrated by:** Design routes whose methods match their intent.

### `HTTP-STATUS-01` — HTTP status codes

Communicating outcome through the response status.

- **Depth:** Intermediate
- **Prerequisites:** `HTTP-MODEL-01` The request/response cycle
- **Demonstrated by:** Return an appropriate status for success and for a rejected request.

### `API-BODY-01` — Parsing a JSON request body

Reading data a client sent in a request.

- **Depth:** Intermediate
- **Prerequisites:** `HTTP-METHOD-01` HTTP methods and REST semantics
- **Demonstrated by:** Accept posted JSON and use its contents.

### `API-PARAM-01` — Route parameters

Identifying a specific record from the URL path.

- **Depth:** Intermediate
- **Prerequisites:** `EXPRESS-ROUTE-01` Route handlers
- **Demonstrated by:** Target one item by id from its route.

### `API-CRUD-01` — Full CRUD route handlers

Create, read, update and delete over one resource.

- **Depth:** Advanced
- **Prerequisites:** `API-BODY-01` Parsing a JSON request body · `API-PARAM-01` Route parameters
- **Demonstrated by:** Exercise all four operations against one collection.

### `API-VALID-01` — Server-side request validation

Refusing bad input at the server rather than trusting the client.

- **Depth:** Advanced
- **Prerequisites:** `API-BODY-01` Parsing a JSON request body · `HTTP-STATUS-01` HTTP status codes
- **Demonstrated by:** Reject an invalid request with a clear status and message.

### `API-PERSIST-01` — File-based data persistence

Storing data so it survives a server restart.

- **Depth:** Intermediate
- **Prerequisites:** `API-CRUD-01` Full CRUD route handlers
- **Demonstrated by:** Restart the server and confirm data survived.

### `EXPRESS-MW-01` — Express middleware

Code that runs on every request before the handler.

- **Depth:** Advanced
- **Prerequisites:** `EXPRESS-ROUTE-01` Route handlers
- **Demonstrated by:** Add middleware and show it running on each request.


## Full-stack integration

### `FS-BOTH-01` — Running client and server together

Operating two processes on different ports simultaneously.

- **Depth:** Intermediate
- **Prerequisites:** `EXPRESS-SERVER-01` Express server setup · `REACT-VITE-01` Vite project structure
- **Demonstrated by:** Run both and confirm each is reachable.

### `FS-CORS-01` — Cross-origin requests and CORS

Why a browser blocks cross-origin calls and how to permit them deliberately.

- **Depth:** Advanced
- **Prerequisites:** `FS-BOTH-01` Running client and server together
- **Demonstrated by:** Diagnose a CORS block and resolve it at the server.

### `FS-FETCH-01` — Fetching backend data from React

Loading server data into component state.

- **Depth:** Advanced
- **Prerequisites:** `FS-CORS-01` Cross-origin requests and CORS · `FETCH-GET-01` The fetch API · `REACT-STATE-01` State with useState
- **Demonstrated by:** Render real server data in a React component.

### `FS-WRITE-01` — Sending data to an API from a form

Submitting user input to the server.

- **Depth:** Advanced
- **Prerequisites:** `FS-FETCH-01` Fetching backend data from React · `REACT-CTRL-01` Controlled form inputs
- **Demonstrated by:** Create a record from the interface and confirm it persisted.

### `FS-SYNC-01` — Keeping UI in sync after a write

Ensuring the display reflects the server rather than an assumption.

- **Depth:** Advanced
- **Prerequisites:** `FS-WRITE-01` Sending data to an API from a form
- **Demonstrated by:** Show the list updating correctly after a create and a delete.

### `FS-STATES-01` — Loading and error states across the stack

Handling a server that is slow, unreachable or erroring.

- **Depth:** Advanced
- **Prerequisites:** `FS-FETCH-01` Fetching backend data from React · `FETCH-STATES-01` Loading and error states · `DBG-ISOLATE-01` Isolating a failure to one layer
- **Demonstrated by:** Stop the server and show a clear, non-broken interface state.


## Reliability & validation UX

### `VAL-CLIENT-01` — Client-side validation

Checking input before it is accepted or sent.

- **Depth:** Intermediate
- **Prerequisites:** `REACT-CTRL-01` Controlled form inputs · `FORM-VALID-01` Rejecting empty or invalid input
- **Demonstrated by:** Block an invalid submission before it reaches storage.

### `VAL-ERRDISP-01` — Conditional error display

Showing a specific, actionable message only when something is wrong.

- **Depth:** Intermediate
- **Prerequisites:** `VAL-CLIENT-01` Client-side validation
- **Demonstrated by:** Display an error naming the actual problem, and clear it when resolved.

### `VAL-TRYCATCH-01` — Error handling with try/catch

Containing an operation that can throw so it does not crash the program.

- **Depth:** Intermediate
- **Prerequisites:** `JS-FUNC-03` Return values versus printing
- **Demonstrated by:** Contain a throwing operation and continue running.

### `VAL-PERSIST-01` — Persisting settings

Saving user preferences so they survive a reload.

- **Depth:** Intermediate
- **Prerequisites:** `STOR-LOCAL-01` localStorage get and set · `REACT-STATE-01` State with useState
- **Demonstrated by:** Save settings and confirm they reload correctly.

### `VAL-RECOVER-01` — Recovering from corrupted stored data

Falling back safely when persisted data cannot be parsed.

- **Depth:** Advanced
- **Prerequisites:** `VAL-TRYCATCH-01` Error handling with try/catch · `VAL-PERSIST-01` Persisting settings
- **Demonstrated by:** Corrupt stored data deliberately and show the app recovering.


## Progressive Web Apps

### `PWA-MANIFEST-01` — The web app manifest

The metadata file that describes an installable web app.

- **Depth:** Intermediate
- **Prerequisites:** `HTML-SEM-01` Semantic HTML structure · `JSON-FMT-01` JSON as a data format
- **Demonstrated by:** Write a manifest and confirm the browser parsed it.

### `PWA-LINK-01` — Linking a manifest

Connecting the manifest to the page, and why a wrong path fails silently.

- **Depth:** Intermediate
- **Prerequisites:** `PWA-MANIFEST-01` The web app manifest
- **Demonstrated by:** Verify the manifest was found, not merely that the file exists.

### `PWA-ICON-01` — App icons and theme colour

Supplying the icon sizes and colours an installed app needs.

- **Depth:** Intermediate
- **Prerequisites:** `PWA-MANIFEST-01` The web app manifest
- **Demonstrated by:** Provide required icon sizes with resolving paths.

### `PWA-VIEWPORT-01` — Mobile viewport behaviour

Ensuring the page renders correctly at real device widths.

- **Depth:** Intermediate
- **Prerequisites:** `CSS-RESP-01` Responsive layout at narrow viewports
- **Demonstrated by:** Verify layout at a real mobile viewport.

### `PWA-INSTALL-01` — Installability requirements

What a browser requires before offering to install a web app.

- **Depth:** Advanced
- **Prerequisites:** `PWA-LINK-01` Linking a manifest · `PWA-ICON-01` App icons and theme colour · `PWA-VIEWPORT-01` Mobile viewport behaviour
- **Demonstrated by:** Pass an installability check and document the install steps.

### `PWA-SW-01` — Service workers and offline caching &nbsp;·&nbsp; **stretch**

Caching an app shell so it loads without a network.

- **Depth:** Advanced
- **Prerequisites:** `PWA-INSTALL-01` Installability requirements
- **Demonstrated by:** Load the app shell with the network disabled.


## Product audit & external APIs

### `UX-AUDIT-01` — Mobile UX auditing

Examining an existing product and recording specific, actionable defects.

- **Depth:** Intermediate
- **Prerequisites:** `CSS-RESP-01` Responsive layout at narrow viewports
- **Demonstrated by:** Produce numbered findings naming element, width and failure.

### `UX-FLOW-01` — Mobile-first flow design

Designing a screen sequence around what the data can actually support.

- **Depth:** Advanced
- **Prerequisites:** `UX-AUDIT-01` Mobile UX auditing
- **Demonstrated by:** Propose a mobile flow grounded in available API content.

### `EXT-API-01` — Consuming an external REST API

Working against an API you do not control, including its constraints.

- **Depth:** Advanced
- **Prerequisites:** `FETCH-GET-01` The fetch API
- **Demonstrated by:** Query a third-party endpoint and render or document its response.

### `EXT-WP-01` — The WordPress REST API

The shape of WordPress content endpoints.

- **Depth:** Advanced
- **Prerequisites:** `EXT-API-01` Consuming an external REST API
- **Demonstrated by:** Retrieve posts from a WordPress site, or document why it is blocked.


## React Native & Expo

### `RN-EXPO-01` — Expo project setup

Creating and serving a React Native project without native tooling.

- **Depth:** Intermediate
- **Prerequisites:** `NODE-NPM-01` npm and package installation · `REACT-JSX-01` Components and JSX
- **Demonstrated by:** Create an Expo project and start its dev server.

### `RN-DEVICE-01` — Running on a physical device

Connecting a real phone to a development server and reloading live.

- **Depth:** Intermediate
- **Prerequisites:** `RN-EXPO-01` Expo project setup
- **Demonstrated by:** Run the app on a phone and see an edit appear live.

### `RN-CORE-01` — React Native core components

Building interface from View, Text and friends rather than HTML.

- **Depth:** Intermediate
- **Prerequisites:** `RN-EXPO-01` Expo project setup
- **Demonstrated by:** Build a screen using native components correctly.

### `RN-STYLE-01` — StyleSheet-based styling

Styling with style objects instead of CSS files.

- **Depth:** Intermediate
- **Prerequisites:** `RN-CORE-01` React Native core components
- **Demonstrated by:** Style a screen with StyleSheet and explain how it differs from CSS.

### `RN-SCREENS-01` — Multiple mobile screens

Structuring an app as several distinct screens.

- **Depth:** Intermediate
- **Prerequisites:** `RN-CORE-01` React Native core components
- **Demonstrated by:** Render three distinct screens.

### `RN-NAV-01` — Mobile screen navigation

Moving between screens, including registering them with a navigator.

- **Depth:** Advanced
- **Prerequisites:** `RN-SCREENS-01` Multiple mobile screens
- **Demonstrated by:** Navigate between screens in both directions on a device.

### `RN-STORE-01` — Asynchronous on-device storage

Persisting data on a phone, where reads and writes must be awaited.

- **Depth:** Advanced
- **Prerequisites:** `RN-EXPO-01` Expo project setup · `ASYNC-PROMISE-01` Promises and async/await
- **Demonstrated by:** Save and read device data correctly using await.

### `RN-PERSIST-01` — Persisting data between app launches

Data surviving a full app close and reopen.

- **Depth:** Advanced
- **Prerequisites:** `RN-STORE-01` Asynchronous on-device storage
- **Demonstrated by:** Force-close the app and confirm data survived.

### `RN-LIST-01` — Rendering a persisted list on mobile

Displaying stored records in a mobile interface.

- **Depth:** Advanced
- **Prerequisites:** `RN-PERSIST-01` Persisting data between app launches · `REACT-LISTSTATE-01` Rendering a list from state
- **Demonstrated by:** List saved notes on the device, including the empty state.

### `RN-DELETE-01` — Deleting a persisted item on mobile

Removing a record from device storage and the display together.

- **Depth:** Advanced
- **Prerequisites:** `RN-LIST-01` Rendering a persisted list on mobile
- **Demonstrated by:** Delete a note and confirm it stays deleted after relaunch.


## Assistant interface

### `CHAT-MODEL-01` — Modelling messages as structured data

Representing a conversation as records carrying identity, sender and text.

- **Depth:** Intermediate
- **Prerequisites:** `DATA-AOO-01` Arrays of objects
- **Demonstrated by:** Define a message shape and justify each field.

### `CHAT-LIST-01` — Rendering an ordered message list

Displaying a conversation in order with stable identity per message.

- **Depth:** Advanced
- **Prerequisites:** `CHAT-MODEL-01` Modelling messages as structured data · `REACT-KEY-01` Stable keys in rendered lists
- **Demonstrated by:** Render a conversation with no key warnings.

### `CHAT-INPUT-01` — Controlled chat input

A message box whose value is owned by state and clears after send.

- **Depth:** Intermediate
- **Prerequisites:** `REACT-CTRL-01` Controlled form inputs
- **Demonstrated by:** Send a message and see the input clear.

### `CHAT-ROLE-01` — Distinguishing sender roles

Making it visually obvious who said what.

- **Depth:** Intermediate
- **Prerequisites:** `CHAT-LIST-01` Rendering an ordered message list
- **Demonstrated by:** Show user and assistant messages as visually distinct.

### `CHAT-APPEND-01` — Appending to a conversation

Adding messages over time while keeping order and scroll position sensible.

- **Depth:** Advanced
- **Prerequisites:** `CHAT-INPUT-01` Controlled chat input · `CHAT-LIST-01` Rendering an ordered message list
- **Demonstrated by:** Append several messages with the newest always visible.

### `CHAT-MOCK-01` — Simulated assistant responses

Standing in for real logic honestly while the interface is built.

- **Depth:** Intermediate
- **Prerequisites:** `CHAT-APPEND-01` Appending to a conversation
- **Demonstrated by:** Return a clearly simulated reply on send.


## Knowledge & documents

### `KNOW-JSON-01` — Structuring knowledge as JSON

Shaping personal and project facts into searchable records.

- **Depth:** Intermediate
- **Prerequisites:** `JSON-FMT-01` JSON as a data format
- **Demonstrated by:** Define a knowledge structure and explain how it will be searched.

### `KNOW-SERVE-01` — Serving knowledge from an endpoint

Exposing stored knowledge over the API.

- **Depth:** Advanced
- **Prerequisites:** `EXPRESS-JSON-01` Serving JSON responses · `KNOW-JSON-01` Structuring knowledge as JSON
- **Demonstrated by:** Return knowledge data from a route as valid JSON.

### `KNOW-TEXT-01` — Accepting text input from a client

Receiving pasted or typed content at the server.

- **Depth:** Advanced
- **Prerequisites:** `FS-WRITE-01` Sending data to an API from a form
- **Demonstrated by:** Send text from the client and confirm the server received it.

### `KNOW-FILE-01` — Handling uploaded files

Receiving a file and extracting usable text from it.

- **Depth:** Advanced
- **Prerequisites:** `KNOW-TEXT-01` Accepting text input from a client
- **Demonstrated by:** Upload a file and display its extracted text.

### `KNOW-FILEVAL-01` — Validating untrusted file input

Rejecting unsupported or unsafe uploads without crashing.

- **Depth:** Advanced
- **Prerequisites:** `KNOW-FILE-01` Handling uploaded files · `API-VALID-01` Server-side request validation
- **Demonstrated by:** Submit an unsupported file type and get a clear rejection.

### `KNOW-SEARCH-01` — Keyword search over stored data

Matching a query against stored records honestly and simply.

- **Depth:** Advanced
- **Prerequisites:** `KNOW-JSON-01` Structuring knowledge as JSON
- **Demonstrated by:** Return correct matches for a keyword, and a clear no-match response.

### `KNOW-ANSWER-01` — Returning a rule-based answer

Composing a useful reply from matched records without a language model.

- **Depth:** Advanced
- **Prerequisites:** `KNOW-SEARCH-01` Keyword search over stored data
- **Demonstrated by:** Answer a question from stored knowledge and state the approach's limits.

### `KNOW-PDF-01` — Extracting text from PDFs &nbsp;·&nbsp; **stretch**

Reading text out of a PDF with a library, and its limitations.

- **Depth:** Advanced
- **Prerequisites:** `KNOW-FILE-01` Handling uploaded files
- **Demonstrated by:** Extract text from a small PDF and document what failed.


## Shipping

### `SHIP-SCOPE-01` — Scope definition and feature freeze

Deciding deliberately what ships and stopping additions.

- **Depth:** Advanced
- **Prerequisites:** `DOC-README-01` Technical documentation (README)
- **Demonstrated by:** Publish a frozen scope with a written deferral list.

### `SHIP-ACCEPT-01` — Measurable acceptance criteria

Stating done conditions that can be checked true or false.

- **Depth:** Advanced
- **Prerequisites:** `SHIP-SCOPE-01` Scope definition and feature freeze
- **Demonstrated by:** Write criteria a third party could verify without interpretation.

### `SHIP-DEFER-01` — Deferring work to a later version

Recording cut features so the decision is reversible and visible.

- **Depth:** Intermediate
- **Prerequisites:** `SHIP-SCOPE-01` Scope definition and feature freeze
- **Demonstrated by:** Produce a specific, credible next-version list.

### `SHIP-INTEGRATE-01` — Full-stack integration

Connecting interface, backend and data into one working product.

- **Depth:** Advanced
- **Prerequisites:** `FS-SYNC-01` Keeping UI in sync after a write · `FS-STATES-01` Loading and error states across the stack · `CHAT-APPEND-01` Appending to a conversation · `KNOW-ANSWER-01` Returning a rule-based answer
- **Demonstrated by:** Walk one continuous user journey across every layer.

### `SHIP-MOBILE-01` — Mobile app integration

Assembling mobile screens into one coherent, device-tested product.

- **Depth:** Advanced
- **Prerequisites:** `RN-NAV-01` Mobile screen navigation · `RN-PERSIST-01` Persisting data between app launches · `CHAT-APPEND-01` Appending to a conversation
- **Demonstrated by:** Run the full mobile flow on a physical device.

### `SHIP-XPLAT-01` — Cross-platform consistency

Keeping web and mobile behaviour coherent against shared data.

- **Depth:** Advanced
- **Prerequisites:** `SHIP-INTEGRATE-01` Full-stack integration · `SHIP-MOBILE-01` Mobile app integration
- **Demonstrated by:** Show the same data behaving consistently on both platforms.

### `SHIP-DEVICE-01` — On-device usability testing

Judging real usability on hardware rather than a desktop preview.

- **Depth:** Advanced
- **Prerequisites:** `SHIP-MOBILE-01` Mobile app integration
- **Demonstrated by:** Report usability findings from testing on the actual phone.

### `SHIP-DEPLOY-01` — Deployment

Publishing an application so others can reach it.

- **Depth:** Advanced
- **Prerequisites:** `SHIP-INTEGRATE-01` Full-stack integration · `GIT-REPO-01` Repository structure
- **Demonstrated by:** Deploy the app and verify it works at its public address.

### `SHIP-DOC-01` — Documentation for an unfamiliar reader

Writing for someone with no context, then testing it by following it.

- **Depth:** Advanced
- **Prerequisites:** `DOC-README-01` Technical documentation (README) · `SHIP-DEPLOY-01` Deployment
- **Demonstrated by:** Set the project up from your own README on a clean start.

### `SHIP-DEMO-01` — Demo preparation

Presenting a product truthfully and legibly to an evaluator.

- **Depth:** Advanced
- **Prerequisites:** `SHIP-DEPLOY-01` Deployment
- **Demonstrated by:** Produce a demo script or recording matching the real product state.

### `SHIP-ROADMAP-01` — Release notes and forward roadmap

Communicating what shipped and what comes next.

- **Depth:** Intermediate
- **Prerequisites:** `SHIP-DEFER-01` Deferring work to a later version
- **Demonstrated by:** Publish a credible, prioritised next-version roadmap.


## Deliberately out of scope

### `OOS-TS-01` — TypeScript &nbsp;·&nbsp; **out-of-scope**

Static typing over JavaScript. Industry-standard, and the natural next step after this track.

- **Depth:** Advanced
- **Prerequisites:** `JS-INTEGRATE-01` Integrating core JavaScript constructs
- **Demonstrated by:** Not demonstrated in this track.

### `OOS-DB-01` — Database-backed persistence &nbsp;·&nbsp; **out-of-scope**

Relational or document databases. This track deliberately stops at file/local storage.

- **Depth:** Advanced
- **Prerequisites:** `API-PERSIST-01` File-based data persistence
- **Demonstrated by:** Not demonstrated in this track.

### `OOS-AUTH-01` — Authentication and authorisation &nbsp;·&nbsp; **out-of-scope**

User accounts, sessions and access control. Excluded from Elliot V1 by design.

- **Depth:** Advanced
- **Prerequisites:** `API-VALID-01` Server-side request validation
- **Demonstrated by:** Not demonstrated in this track.

### `OOS-TEST-01` — Automated testing &nbsp;·&nbsp; **out-of-scope**

Unit and integration test frameworks. This track uses manual scenario testing only.

- **Depth:** Advanced
- **Prerequisites:** `JS-TEST-01` Scenario-based manual testing
- **Demonstrated by:** Not demonstrated in this track.

### `OOS-STORE-01` — App store publishing &nbsp;·&nbsp; **out-of-scope**

Releasing to Play Store or App Store. Explicitly deferred by the bootcamp's own lockdown list.

- **Depth:** Advanced
- **Prerequisites:** `SHIP-MOBILE-01` Mobile app integration
- **Demonstrated by:** Not demonstrated in this track.


---

## Dependency spine

The longest prerequisite chains in the graph — these are the paths that fix the curriculum's overall ordering.

**SHIP-DOC-01** (depth 15):

```
ENV-TERM-01
  → ENV-NODE-01
  → ENV-RUN-01
  → JS-LOG-01
  → JS-VAR-01
  → JS-FUNC-01
  → JS-FUNC-02
  → JS-FUNC-03
  → ASYNC-PROMISE-01
  → FETCH-GET-01
  → FS-FETCH-01
  → FS-WRITE-01
  → FS-SYNC-01
  → SHIP-INTEGRATE-01
  → SHIP-DEPLOY-01
  → SHIP-DOC-01
```

**SHIP-DEMO-01** (depth 15):

```
ENV-TERM-01
  → ENV-NODE-01
  → ENV-RUN-01
  → JS-LOG-01
  → JS-VAR-01
  → JS-FUNC-01
  → JS-FUNC-02
  → JS-FUNC-03
  → ASYNC-PROMISE-01
  → FETCH-GET-01
  → FS-FETCH-01
  → FS-WRITE-01
  → FS-SYNC-01
  → SHIP-INTEGRATE-01
  → SHIP-DEPLOY-01
  → SHIP-DEMO-01
```

**KNOW-FILEVAL-01** (depth 14):

```
ENV-TERM-01
  → ENV-NODE-01
  → ENV-RUN-01
  → JS-LOG-01
  → JS-VAR-01
  → JS-FUNC-01
  → JS-FUNC-02
  → JS-FUNC-03
  → ASYNC-PROMISE-01
  → FETCH-GET-01
  → FS-FETCH-01
  → FS-WRITE-01
  → KNOW-TEXT-01
  → KNOW-FILE-01
  → KNOW-FILEVAL-01
```

---

*Generated from `knowledge-map.js`, the machine-readable source of truth. The document and the data cannot drift: this file is produced from that one.*
