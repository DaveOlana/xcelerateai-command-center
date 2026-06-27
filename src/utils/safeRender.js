/**
 * Safe rendering utilities for XcelerateAI Command Center.
 * Prevents rendering crashes and removes "[object Object]" bugs.
 */

export const safeArray = (value) => Array.isArray(value) ? value : [];

export const safeText = (value, fallback = "Not specified") => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object") {
    return value.title || value.label || value.name || value.description || fallback;
  }
  return fallback;
};

export const getItemTitle = (item, fallback = "Untitled") => {
  if (!item) return fallback;
  if (typeof item === "string") return item;
  return item.title || item.label || item.name || item.task || item.missionTitle || fallback;
};

export const getItemDescription = (item, fallback = "") => {
  if (!item) return fallback;
  if (typeof item === "string") return item;
  return item.description || item.brief || item.summary || item.objective || fallback;
};

export const getItemStatus = (item) => {
  if (!item) return 'Unknown';
  if (typeof item === 'string') return item;
  return safeText(item.status || item.state, 'Unknown');
};

export const getWeekLabel = (week) => {
  if (!week) return 'Unknown Week';
  if (week.weekNumber) return `Week ${week.weekNumber}`;
  if (week.title) return week.title;
  if (week.id) return `Week ${week.id.replace(/\D/g, '') || '?'}`;
  return 'Unknown Week';
};

export const getMissionLabel = (mission) => {
  if (!mission) return 'Unknown Mission';
  if (mission.missionId) return `Mission ${mission.missionId.replace(/\D/g, '') || '?'}`;
  if (mission.id) return `Mission ${mission.id.replace(/\D/g, '') || '?'}`;
  if (mission.title) return mission.title;
  return 'Unknown Mission';
};

export const cleanDifficultyLabel = (difficulty) => {
  if (!difficulty) return 'Unknown';
  let str = String(difficulty);
  str = str.replace(/难度/g, '').trim();
  if (str === '1' || str.toLowerCase() === 'easy') return 'Beginner';
  if (str === '2' || str.toLowerCase() === 'medium') return 'Intermediate';
  if (str === '3' || str.toLowerCase() === 'hard') return 'Advanced';
  return str || 'Unknown';
};

export const formatDuration = (duration) => {
  if (!duration) return '';
  if (typeof duration === 'number') {
    const hrs = Math.floor(duration / 60);
    const mins = duration % 60;
    if (hrs > 0) return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
    return `${mins}m`;
  }
  return String(duration).replace(/分钟/g, 'm').replace(/小时/g, 'h').trim();
};

export const formatMissionType = (type) => {
  if (!type) return 'Mission';
  const str = String(type).toLowerCase();
  if (str.includes('core')) return 'Core Mission';
  if (str.includes('side') || str.includes('quest')) return 'Side Quest';
  if (str.includes('checkpoint')) return 'Checkpoint';
  return String(type);
};
