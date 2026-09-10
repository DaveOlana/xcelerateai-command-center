function firstValue(...values) {
  const value = values.find((candidate) => candidate !== undefined && candidate !== null && String(candidate).trim() !== '');
  return value ?? '';
}

function normalizeNoteType(note) {
  if (note.noteType) return note.noteType;
  const value = String(note.type || '').toLowerCase();
  if (value.includes('reflection')) return 'daily_reflection';
  if (value.includes('resource')) return 'resource_summary';
  if (value.includes('project')) return 'project_note';
  if (value.includes('bug')) return 'bug_note';
  return 'session_note';
}

export function normalizeWorkspaceNote(note, index = 0) {
  const createdAt = firstValue(note.createdAt, note.date, note.timestamp);
  const linkedWeek = firstValue(note.linkedWeek, note.weekNumber, note.week);
  const linkedMission = firstValue(note.linkedMission, note.missionId, note.missionTitle);
  const linkedResource = firstValue(note.linkedResource, note.resourceTitle, note.resourceId);
  const linkedProject = firstValue(note.linkedProject, note.projectId, note.projectIndex);
  const focusStage = firstValue(note.focusStage, note.stageLabel, note.stage, note.skillArea);
  const focusSessionId = firstValue(note.focusSessionId, note.sessionId, note.selectedFocusBlock);
  const whatLearned = firstValue(note.whatLearned, note.whatILearned, note.content, note.body, note.text);

  return {
    ...note,
    id: note.id || `legacy-note-${index}`,
    title: firstValue(note.title, note.name, note.subject, whatLearned ? 'Learning note' : 'Untitled note'),
    noteType: normalizeNoteType(note),
    createdAt,
    date: note.date || '',
    linkedWeek,
    linkedMission,
    linkedResource,
    linkedProject,
    linkedBlocker: firstValue(note.linkedBlocker, note.blockerId, note.problemId),
    focusStage,
    focusSessionId,
    whatLearned,
    whatConfused: firstValue(note.whatConfused, note.whatConfusedMe),
    whatBuilt: firstValue(note.whatBuilt, note.buildNotes),
    questionsForMentor: firstValue(note.questionsForMentor, note.mentorQuestion),
    nextAction: firstValue(note.nextAction, note.nextStep),
  };
}

export function normalizeWorkspaceProblem(problem, index = 0) {
  const isResolved = ['solved', 'resolved', 'closed'].includes(String(problem.status || '').toLowerCase());
  return {
    ...problem,
    id: problem.id || `legacy-problem-${index}`,
    title: firstValue(problem.title, problem.whatWentWrong, problem.errorMessage, 'Untitled problem'),
    workspaceStatus: isResolved ? 'Resolved' : 'Open',
    dateCreated: firstValue(problem.dateCreated, problem.createdAt, problem.date, problem.timestamp),
    dateResolved: firstValue(problem.dateSolved, problem.resolvedAt, problem.closedAt),
    weekNumber: firstValue(problem.weekNumber, problem.linkedWeek, problem.week),
    stage: firstValue(problem.focusStage, problem.stage, problem.skillArea),
    missionTitle: firstValue(problem.missionTitle, problem.missionId, problem.linkedMission),
    resourceTitle: firstValue(problem.resourceTitle, problem.linkedResource),
    projectTitle: firstValue(problem.projectTitle, problem.projectId, problem.linkedProject),
    whatTryingToDo: firstValue(problem.whatTryingToDo, problem.taskTitle, problem.currentTask),
    whatWentWrong: firstValue(problem.whatWentWrong, problem.description, problem.errorMessage),
    whatAlreadyTried: firstValue(problem.whatAlreadyTried, problem.whatTried, problem.attempts),
    solutionNotes: firstValue(problem.solutionNotes, problem.resolution, problem.solution, problem.whatFixedIt),
  };
}

function hasEvidence(proof) {
  if (!proof || typeof proof !== 'object') return false;
  return Object.entries(proof).some(([, value]) => value === true || (typeof value === 'string' && value.trim()));
}

export function aggregateWorkspaceProof({ roadmap, weekProofs, practicalMissions, progress }) {
  const weeksByNumber = new Map();
  const missionsById = new Map();
  for (const month of roadmap?.months || []) {
    for (const week of month.weeks || []) {
      weeksByNumber.set(String(week.weekNumber), week);
      for (const mission of week.practicalMissions || []) {
        if (mission?.missionId) missionsById.set(String(mission.missionId), { mission, week });
      }
    }
  }

  const items = [];
  Object.entries(weekProofs || {}).forEach(([weekNumber, proof]) => {
    if (!hasEvidence(proof)) return;
    const week = weeksByNumber.get(String(weekNumber));
    items.push({
      id: `week-${weekNumber}`,
      source: 'Weekly Proof',
      title: week?.title || `Week ${weekNumber}`,
      weekNumber,
      date: firstValue(proof.submittedDate, proof.createdAt, proof.date),
      status: proof.githubRepoLink && proof.githubCommitLink && proof.readmeCompleted ? 'Complete' : 'Partial',
      repository: firstValue(proof.githubRepoLink, proof.repositoryUrl, proof.repoUrl),
      commit: firstValue(proof.githubCommitLink, proof.commitUrl),
      demo: firstValue(proof.demoVideoLink, proof.demoUrl, proof.liveDemoLink),
      screenshot: firstValue(proof.screenshotNote, proof.screenshot, proof.image),
      reflection: firstValue(proof.reflectionWritten, proof.reflection),
      readmeCompleted: proof.readmeCompleted,
      testsPassed: firstValue(proof.testCasesPassed, proof.testsPassed),
    });
  });

  Object.entries(practicalMissions || {}).forEach(([missionId, record]) => {
    if (!hasEvidence(record?.proof)) return;
    const metadata = missionsById.get(String(missionId));
    const proof = record.proof;
    items.push({
      id: `mission-${missionId}`,
      source: 'Practical Mission',
      title: metadata?.mission?.title || missionId,
      missionId,
      weekNumber: metadata?.week?.weekNumber || '',
      date: firstValue(record.completedAt, record.submittedAt, record.startedAt),
      status: record.status === 'Completed' ? 'Complete' : 'Recorded',
      repository: firstValue(proof.githubRepoLink, proof.repositoryUrl, proof.repoUrl),
      commit: firstValue(proof.githubCommitLink, proof.commitUrl),
      demo: firstValue(proof.demoVideoLink, proof.demoUrl, proof.liveDemoLink),
      screenshot: firstValue(proof.screenshotNote, proof.screenshot, proof.image),
      reflection: firstValue(proof.reflectionWritten, proof.reflection),
      readmeCompleted: proof.readmeCompleted,
      testsPassed: firstValue(proof.testCasesPassed, proof.testsPassed),
    });
  });

  (roadmap?.projects || []).forEach((project, projectIndex) => {
    const repository = progress?.projectGithubLinks?.[projectIndex] || '';
    const demo = progress?.projectLiveDemoLinks?.[projectIndex] || '';
    if (!repository && !demo) return;
    const milestones = Array.isArray(project.milestones) ? project.milestones : [];
    const completed = progress?.completedProjectMilestones?.[projectIndex] || [];
    items.push({
      id: `project-${projectIndex}`,
      source: 'Project',
      title: project.name || project.title || `Project ${projectIndex + 1}`,
      projectIndex,
      date: '',
      status: milestones.length > 0 && completed.length === milestones.length ? 'Complete' : 'Recorded',
      repository,
      commit: '',
      demo,
      screenshot: '',
      reflection: progress?.projectNotes?.[projectIndex] || '',
      readmeCompleted: undefined,
      testsPassed: '',
    });
  });

  return items.sort((a, b) => {
    if (a.date && b.date) return new Date(b.date) - new Date(a.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return a.source.localeCompare(b.source);
  });
}
