import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';
import DataGuard from './components/layout/DataGuard';

// Pages
import Dashboard from './pages/DashboardNew';
import ImportRoadmap from './pages/ImportRoadmap';
import BootcampTimeline from './pages/BootcampTimeline';
import WeeklyMissions from './pages/WeeklyMissions';
import TodaysFocus from './pages/TodaysFocus';
import ResourceVault from './pages/ResourceVault';
import ProjectTracker from './pages/ProjectTracker';
import NotesJournal from './pages/NotesJournal';
import Checkpoints from './pages/Checkpoints';
import ProgressOverview from './pages/ProgressOverview';
import Settings from './pages/Settings';
import Blockers from './pages/Blockers';
import ProofOfWork from './pages/ProofOfWork';
import SideQuestLock from './pages/SideQuestLock';
import PracticalMissionView from './pages/PracticalMissionView';

// 404
function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-navy-800/50 border border-navy-500/30 flex items-center justify-center mb-6 shadow-card">
        <img src="/xcelerate-icon.png" alt="Xcelerate" className="w-8 h-8 object-contain opacity-50 grayscale" />
      </div>
      <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-2">Error 404</p>
      <p className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-3">Command Route Not Found</p>
      <p className="text-[15px] text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
        The requested module or workspace path does not exist in the current operation deployment.
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
              <Route index element={<Dashboard />} />
              <Route path="today" element={<TodaysFocus />} />
              <Route path="missions" element={<WeeklyMissions />} />
              <Route path="progress" element={<ProgressOverview />} />
              <Route path="timeline" element={<BootcampTimeline />} />
              <Route path="resources" element={<ResourceVault />} />
              <Route path="projects" element={<ProjectTracker />} />
              <Route path="notes" element={<NotesJournal />} />
              <Route path="checkpoints" element={<Checkpoints />} />
              <Route path="blockers" element={<Blockers />} />
              <Route path="proof" element={<ProofOfWork />} />
              <Route path="side-quests" element={<SideQuestLock />} />
              <Route path="mission/:missionId" element={<PracticalMissionView />} />
            </Route>

            {/* Unprotected Routes */}
            <Route path="import" element={<ImportRoadmap />} />
            <Route path="settings" element={<Settings />} />
            <Route path="more" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
