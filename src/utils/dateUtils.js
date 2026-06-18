// =============================================
// DATE UTILITIES
// =============================================

/**
 * Calculate "Day X of 180" from a start date
 */
export function getBootcampDay(startDateStr) {
  if (!startDateStr) return null;
  const start = new Date(startDateStr);
  const now = new Date();
  const diffMs = now - start;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays + 1); // Day 1 on start date
}

/**
 * Get days remaining in the bootcamp
 */
export function getDaysRemaining(startDateStr, totalDays = 180) {
  const currentDay = getBootcampDay(startDateStr);
  if (currentDay === null) return null;
  return Math.max(0, totalDays - currentDay + 1);
}

/**
 * Get bootcamp duration progress percent
 */
export function getBootcampDurationPercent(startDateStr, totalDays = 180) {
  const currentDay = getBootcampDay(startDateStr);
  if (currentDay === null) return 0;
  return Math.min(100, Math.round((currentDay / totalDays) * 100));
}

/**
 * Format a date string to readable format
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Get greeting based on time of day
 */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Get today's date string (used for streak tracking)
 */
export function getTodayString() {
  return new Date().toDateString();
}

/**
 * Get yesterday's date string
 */
export function getYesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toDateString();
}

/**
 * Format a note date for display
 */
export function formatNoteDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Get current date in ISO format for input[type="date"]
 */
export function getTodayISO() {
  return new Date().toISOString().split('T')[0];
}
