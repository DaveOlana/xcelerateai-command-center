# XcelerateAI Command Center

Your personal learning and productivity mission control cockpit designed for completing the XcelerateAI JavaScript Mobile Ops Bootcamp and building Elliot V1.

---

## Quick Start

### Step 1 — Install Node.js (if not installed)

Download and install Node.js from: https://nodejs.org/
Choose the LTS version. After installing, close and reopen your terminal.

Verify it works:
```bash
node --version
npm --version
```

### Step 2 — Install Dependencies

Open a terminal in the project folder and run:
```bash
npm install
```

### Step 3 — Start the App

```bash
npm run dev
```

Then open your browser to: http://localhost:5173

---

## Project Structure

```
xcelerate-command-center/
├── public/
│   ├── roadmap-data.json        ← Edit this with your real roadmap
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── layout/              ← Sidebar, BottomNav, MobileHeader, Layout
│   │   ├── ui/                  ← Reusable UI components
│   │   └── features/            ← PomodoroTimer, StreakTracker
│   ├── context/
│   │   └── AppContext.jsx       ← Global state (roadmap, progress, notes)
│   ├── data/
│   │   └── sampleRoadmap.js     ← Built-in 6-month skeleton
│   ├── pages/                   ← App pages
│   ├── utils/                   ← Progress calc, JSON validator, date utils
│   ├── App.jsx                  ← Routes
│   └── main.jsx                 ← Entry point
├── package.json
├── tailwind.config.js
└── vercel.json
```

---

## App Pages

| Page | Route | Purpose |
|---|---|---|
| Dashboard | `/` | Overview, metrics, and progress tracking |
| Today's Focus | `/today` | Four-stage guided flow (Learn, Build, Prove, Reflect) with Pomodoro timer |
| Weekly Missions | `/missions` | Structured week-by-week curriculum module checklist |
| Progress | `/progress` | Comprehensive analytics and weighted progress charts |
| Timeline | `/timeline` | Complete 6-month roadmap timeline |
| Resource Vault | `/resources` | Filtered directory of all reference materials |
| Project Tracker | `/projects` | Milestone checklists and repository statuses |
| Notes Journal | `/notes` | Learning journal and blocker log |
| Checkpoints | `/checkpoints` | Skill-by-skill confidence level grids |
| Import Roadmap | `/import` | Upload utility for custom roadmap JSONs |
| Settings | `/settings` | Global configurations, data export/import, and theme reset |

---

## Data Integration (roadmap-data.json)

### Where is the file?
```
public/roadmap-data.json
```
This file contains the structural definition of your bootcamp curriculum. You can edit it inside your editor and then import it into the app via the Import Roadmap interface.

### How to customize
1. Open `public/roadmap-data.json` in your editor.
2. Replace the sample data with your actual curriculum content.
3. Remove the instructions fields before importing.
4. Save the file.

### How to import
1. Navigate to the application in your browser.
2. Go to the Import Roadmap page via the navigation sidebar.
3. Upload your customized JSON file. The system will run schema validations.
4. Click Confirm Import to activate your personalized dashboard.

### JSON Structure Requirements
Your JSON file must conform to the following schema:
```json
{
  "bootcampTitle": "string",
  "learner": "string",
  "duration": "string",
  "weeklyHours": "string",
  "months": [
    {
      "monthNumber": 1,
      "title": "string",
      "objective": "string",
      "weeks": [
        {
          "weekNumber": 1,
          "title": "string",
          "briefing": "string",
          "minimumMission": ["string"],
          "fullMission": ["string"],
          "resources": [
            {
              "title": "string",
              "url": "string",
              "type": "Docs | Tutorial | Video | Tool | Course",
              "difficulty": "Beginner | Intermediate | Advanced",
              "whatToExpect": "string",
              "missionObjective": "string"
            }
          ],
          "tasks": ["string"],
          "checkpoint": "string",
          "deliverable": "string"
        }
      ]
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "milestones": ["string"]
    }
  ],
  "checkpoints": [
    {
      "skill": "string",
      "question": "string",
      "statusOptions": ["Not yet", "Learning", "Confident"]
    }
  ]
}
```

---

## State Management and Persistence

All data is stored directly in the browser's localStorage. No external database or network request is used for tracking.

| Storage Key | Purpose |
|---|---|
| `xca_roadmap` | Active curriculum roadmap structure |
| `xca_progress` | Tracked tasks, completed weeks, and project milestones |
| `xca_notes` | User-written journal entries and logs |
| `xca_checkpoints` | Confidence rankings per checkpoint |
| `xca_settings` | Profile info, custom targets, start date, and active week |
| `xca_streak` | Consecutively logged study days |

To safeguard your progress, backup and recovery utilities are available in the Settings page.

---

## Verification and Deployment

### Vercel Deployment
Deploy this cockpit configuration using Vercel CLI or via Git integration:
```bash
npm install -g vercel
npm run build
vercel --prod
```

### Routing Support
The `vercel.json` file is configured with routing rewrites to support smooth React Router single-page navigation.

---

*Built with React, Vite, and Tailwind CSS.*
