# XcelerateAI Bootcamp Command Center

> Your personal ops mission-control dashboard for completing the 6-Month JavaScript Mobile Ops Bootcamp.

---

## 🚀 Quick Start

### Step 1 — Install Node.js (if not installed)

Download and install Node.js from: https://nodejs.org/

Choose the **LTS version**. After installing, close and reopen your terminal.

Verify it works:
```
node --version
npm --version
```

### Step 2 — Install dependencies

Open a terminal in the project folder and run:
```
npm install
```

### Step 3 — Start the app

```
npm run dev
```

Then open your browser to: **http://localhost:5173**

---

## 📁 Project Structure

```
xcelerate-command-center/
├── public/
│   ├── roadmap-data.json        ← EDIT THIS with your real roadmap
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
│   ├── pages/                   ← All 11 pages
│   ├── utils/                   ← Progress calc, JSON validator, date utils
│   ├── App.jsx                  ← Routes
│   └── main.jsx                 ← Entry point
├── package.json
├── tailwind.config.js
└── vercel.json
```

---

## 📋 App Pages

| Page | Route | Purpose |
|---|---|---|
| Dashboard | `/` | Overview, stats, quick actions |
| Today's Focus | `/today` | 3 tasks + Pomodoro timer |
| Weekly Missions | `/missions` | Full week checklist |
| Progress | `/progress` | Weighted progress breakdown |
| Timeline | `/timeline` | All 6 months overview |
| Resource Vault | `/resources` | Filtered resource library |
| Project Tracker | `/projects` | Build milestones |
| Notes Journal | `/notes` | Learning journal |
| Checkpoints | `/checkpoints` | Skill confidence tracker |
| Import Roadmap | `/import` | Upload roadmap-data.json |
| Settings | `/settings` | Configure everything |

---

## 📂 roadmap-data.json — How It Works

### Where is the file?
```
public/roadmap-data.json
```

This file is a **starter template**. Edit it in VS Code, then import it into the app.

### How to edit it

1. Open `public/roadmap-data.json` in VS Code
2. Replace the placeholder content with your real bootcamp content
3. Delete the `"_instructions"` field at the top before importing
4. Save the file

### How to import it into the app

1. Open the app at `http://localhost:5173`
2. Go to **Import Roadmap** (sidebar or More menu)
3. Click the upload zone or drag your JSON file onto it
4. The app will validate the file and show a summary:
   - ✅ Found X months
   - ✅ Found X weeks
   - ✅ Found X resources
   - etc.
5. Click **Confirm Import** to activate it
6. Your dashboard is now powered by your real roadmap

### How it connects to the dashboard

Once imported, every page reads from your roadmap:

- **Dashboard** — shows current week, month, progress
- **Weekly Missions** — shows tasks, resources, checkpoint from your JSON
- **Resource Vault** — shows all resources from all weeks
- **Project Tracker** — shows all projects and milestones
- **Checkpoints** — shows all checkpoint questions

### Required JSON structure

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

## 💾 Progress Storage

All progress is saved in your browser's **localStorage**. Nothing is sent to any server.

| Key | What it stores |
|---|---|
| `xca_roadmap` | Your imported roadmap JSON |
| `xca_progress` | Task completions, week completions, project milestones |
| `xca_notes` | All journal notes |
| `xca_checkpoints` | Checkpoint confidence levels |
| `xca_settings` | Start date, mentor name, active week |
| `xca_streak` | Study streak data |

### Export progress

Go to **Settings → Export Progress** to download a JSON backup of everything.

### Import progress

Go to **Settings → Import Progress** to restore from a backup file.

---

## 🚢 Deploy to Vercel

### Method 1 — Vercel CLI

```
npm install -g vercel
npm run build
vercel --prod
```

### Method 2 — GitHub + Vercel Dashboard

1. Push your project to GitHub:
```
git init
git add .
git commit -m "Initial commit: XcelerateAI Command Center"
git remote add origin https://github.com/yourusername/xcelerate-command-center.git
git push -u origin main
```

2. Go to https://vercel.com and sign in
3. Click **Add New Project**
4. Import your GitHub repository
5. Vercel will auto-detect Vite and configure the build
6. Click **Deploy**
7. Your app is live at a `.vercel.app` URL

The `vercel.json` file is already included and configured for React Router.

---

## 🎯 Progress Calculation

Overall progress uses a weighted blend:

| Component | Weight | How calculated |
|---|---|---|
| Tasks | 50% | Completed tasks ÷ total tasks |
| Checkpoints | 30% | Confident = 1pt, Learning = 0.5pt |
| Projects | 20% | Completed milestones ÷ total milestones |

---

## ⏱️ Pomodoro Timer

The Today's Focus page includes a built-in focus timer:

- **25 minutes** — Focus session
- **5 minutes** — Break
- Auto-switches between modes
- Browser notification when session ends (if permission granted)
- Tracks sessions completed today

---

## 🔥 Study Streak

The streak counter tracks consecutive days of study. A day is counted when you:
- Check off a task
- Mark a week complete
- Update a checkpoint
- Write a note

---

## 🗂️ Version 2 Plans

The following features are planned for Version 2:

1. **AI PDF Import** — Upload a PDF syllabus and use AI to auto-generate the roadmap JSON
2. **Cloud sync** — Optional sync across devices
3. **AI daily coach** — Personalized study recommendations
4. **Calendar integration** — Block study time automatically
5. **Progress sharing** — Share weekly reports with your mentor

---

## 📞 Support

This app was built as part of the XcelerateAI Bootcamp experience.
Questions? Reach out to your mentor.

---

*Built with React + Vite + Tailwind CSS v3 — No backend, no login, no subscription.*
