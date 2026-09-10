import React from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';
import DataGuard from './components/layout/DataGuard';

// Pages
import Dashboard from './pages/DashboardNew';
import ImportRoadmap from './pages/ImportRoadmap';
import WeeklyMissions from './pages/WeeklyMissions';
import ProjectsWorkbench from './pages/workspace/ProjectsWorkbench';
import NotesWorkbench from './pages/workspace/NotesWorkbench';
import Checkpoints from './pages/Checkpoints';
import ProgressOverview from './pages/ProgressOverview';
import Settings from './pages/Settings';
import ProblemsWorkbench from './pages/workspace/ProblemsWorkbench';
import ProofLibrary from './pages/workspace/ProofLibrary';
import PracticalMissionView from './pages/PracticalMissionView';
import Workspace from './pages/Workspace';
import CurriculumCatalog from './pages/v2/CurriculumCatalog';
import V2Dashboard from './pages/v2/V2Dashboard';
import V2Missions from './pages/v2/V2Missions';
import V2Progress from './pages/v2/V2Progress';
import V2Projects from './pages/v2/V2Projects';
import V2ProofLibrary from './pages/v2/V2ProofLibrary';
import { useApp } from './context/AppContext';

function CurriculumAware({ legacy: Legacy, v2: V2 }) {
  const { curriculumMode } = useApp();
  if (curriculumMode === 'v2') return <V2 />;
  if (curriculumMode === 'legacy') return <Legacy />;
  return <Navigate to="/curricula" replace />;
}

const ActiveDashboard = () => <CurriculumAware legacy={Dashboard} v2={V2Dashboard} />;
const ActiveMissions = () => <CurriculumAware legacy={WeeklyMissions} v2={V2Missions} />;
const ActiveProgress = () => <CurriculumAware legacy={ProgressOverview} v2={V2Progress} />;
const ActiveProjects = () => <CurriculumAware legacy={ProjectsWorkbench} v2={V2Projects} />;
const ActiveProof = () => <CurriculumAware legacy={ProofLibrary} v2={V2ProofLibrary} />;

// 404
function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-navy-800/50 border border-navy-500/30 flex items-center justify-center mb-6 shadow-card">
        <img src="/xcelerate-icon.png" alt="Xcelerate" className="w-8 h-8 object-contain opacity-50 grayscale" />
      </div>
      <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-2">Error 404</p>
      <p className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-3">Page not found</p>
      <p className="text-[15px] text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
        The page you requested does not exist or has moved.
      </p>
      <a href="/" className="btn-primary py-3 px-6 text-[14px]">
        Return to Dashboard
      </a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route element={<DataGuard />}>
              <Route index element={<ActiveDashboard />} />
              <Route path="today" element={<Navigate to="/missions?view=current" replace />} />
              <Route path="missions" element={<ActiveMissions />} />
              <Route path="progress" element={<ActiveProgress />} />
              <Route path="timeline" element={<Navigate to="/missions?view=path" replace />} />
              <Route path="resources" element={<Navigate to="/missions?view=resources" replace />} />
              <Route path="projects" element={<Navigate to="/workspace/projects" replace />} />
              <Route path="notes" element={<Navigate to="/workspace/notes" replace />} />
              <Route path="checkpoints" element={<Checkpoints />} />
              <Route path="blockers" element={<Navigate to="/workspace/problems" replace />} />
              <Route path="proof" element={<Navigate to="/workspace/proof" replace />} />
              <Route path="side-quests" element={<Navigate to="/missions?view=side-quests" replace />} />
              <Route path="mission/:missionId" element={<PracticalMissionView />} />
              <Route path="workspace" element={<Workspace />}>
                <Route index element={<Navigate to="projects" replace />} />
                <Route path="projects" element={<ActiveProjects />} />
                <Route path="notes" element={<NotesWorkbench />} />
                <Route path="problems" element={<ProblemsWorkbench />} />
                <Route path="proof" element={<ActiveProof />} />
              </Route>
            </Route>

            {/* Unprotected Routes */}
            <Route path="import" element={<ImportRoadmap />} />
            <Route path="curricula" element={<CurriculumCatalog />} />
            <Route path="settings" element={<Settings />} />
            <Route path="more" element={<Navigate to="/settings" replace />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
