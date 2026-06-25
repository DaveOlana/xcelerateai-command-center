// =============================================
// PROGRESS CALCULATOR
// Weighted progress: Tasks 50% | Checkpoints 30% | Projects 20%
// =============================================

/**
 * Calculate the overall weighted progress percentage.
 * @param {Object} roadmap - The full roadmap data
 * @param {Object} progress - Progress state from AppContext
 * @param {Object} checkpointStatuses - { [skill]: 'Not yet' | 'Learning' | 'Confident' }
 * @returns {Object} { overall, tasks, checkpoints, projects, breakdown }
 */
export function calculateOverallProgress(roadmap, progress, checkpointStatuses) {
  // ── Task Progress (50%) ───────────────────
  let totalTasks = 0;
  let completedTasks = 0;

  if (roadmap?.months) {
    roadmap.months.forEach((month) => {
      month.weeks?.forEach((week) => {
        const tasks = Array.isArray(week.tasks) ? week.tasks : [];
        totalTasks += tasks.length;
        const key = `m${month.monthNumber}_w${week.weekNumber}`;
        const done = Array.isArray(progress?.completedTasks?.[key]) ? progress.completedTasks[key] : [];
        completedTasks += done.length;
      });
    });
  }

  const taskPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // ── Checkpoint Progress (30%) ─────────────
  const allCheckpoints = Array.isArray(roadmap?.checkpoints) ? roadmap.checkpoints : [];
  const totalCheckpoints = allCheckpoints.length;
  let confidentCount = 0;
  let learningCount = 0;

  allCheckpoints.forEach((cp) => {
    const status = checkpointStatuses?.[cp.skill];
    if (status === 'Confident') confidentCount++;
    if (status === 'Learning') learningCount++;
  });

  // Confident = full point, Learning = half point
  const checkpointScore = totalCheckpoints > 0
    ? ((confidentCount + learningCount * 0.5) / totalCheckpoints) * 100
    : 0;

  // ── Project Progress (20%) ────────────────
  let totalMilestones = 0;
  let completedMilestones = 0;

  if (roadmap?.projects) {
    roadmap.projects.forEach((project, pi) => {
      const milestones = Array.isArray(project.milestones) ? project.milestones : [];
      totalMilestones += milestones.length;
      const doneMilestones = Array.isArray(progress?.completedProjectMilestones?.[pi]) ? progress.completedProjectMilestones[pi] : [];
      completedMilestones += doneMilestones.length;
    });
  }

  const projectPercent = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  // ── Weighted Overall ──────────────────────
  const overall = (taskPercent * 0.5) + (checkpointScore * 0.3) + (projectPercent * 0.2);

  return {
    overall: Math.round(overall),
    tasks: {
      percent: Math.round(taskPercent),
      completed: completedTasks,
      total: totalTasks,
    },
    checkpoints: {
      percent: Math.round(checkpointScore),
      confident: confidentCount,
      learning: learningCount,
      total: totalCheckpoints,
    },
    projects: {
      percent: Math.round(projectPercent),
      completed: completedMilestones,
      total: totalMilestones,
    },
  };
}

/**
 * Get progress for a specific month
 */
export function getMonthProgress(month, progress) {
  let totalTasks = 0;
  let completedTasks = 0;
  let completedWeeks = 0;

  month.weeks?.forEach((week) => {
    const tasks = Array.isArray(week.tasks) ? week.tasks : [];
    totalTasks += tasks.length;
    const key = `m${month.monthNumber}_w${week.weekNumber}`;
    const done = Array.isArray(progress?.completedTasks?.[key]) ? progress.completedTasks[key] : [];
    completedTasks += done.length;
    if (Array.isArray(progress?.completedWeeks) && progress.completedWeeks.includes(week.weekNumber)) {
      completedWeeks++;
    }
  });

  const totalWeeks = Array.isArray(month.weeks) ? month.weeks.length : 0;
  const taskPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const weekPercent = totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0;

  return { taskPercent, weekPercent, completedTasks, totalTasks, completedWeeks, totalWeeks };
}

/**
 * Get the current active week data from the roadmap
 */
export function getActiveWeekData(roadmap, activeWeek) {
  if (!roadmap) return null;

  const targetNum = Number(activeWeek);
  if (isNaN(targetNum)) return null;

  // 1. Search months[].weeks first (works for Elliot, One Piece, Cloud Engineering after normalization)
  if (Array.isArray(roadmap.months)) {
    for (const month of roadmap.months) {
      for (const week of month.weeks || []) {
        if (Number(week.weekNumber) === targetNum) {
          return { week, month };
        }
      }
    }
  }

  // 2. Fallback: search the top-level weeks[] array (flat schemas)
  if (Array.isArray(roadmap.weeks)) {
    for (const week of roadmap.weeks) {
      if (Number(week.weekNumber) === targetNum) {
        // Try to find the matching month for context
        const monthNum = week.monthNumber || (typeof week.month === 'number' ? week.month : null);
        const month = monthNum && Array.isArray(roadmap.months)
          ? (roadmap.months.find(m => m.monthNumber === monthNum) || { monthNumber: monthNum, title: `Month ${monthNum}`, weeks: [] })
          : { monthNumber: 1, title: 'Month 1', weeks: [] };
        return { week, month };
      }
    }
  }

  // 3. If activeWeek is 1 and no match found, return the very first week
  if (targetNum === 1) {
    const firstWeek = roadmap.weeks?.[0] || roadmap.months?.[0]?.weeks?.[0];
    if (firstWeek) {
      const monthNum = firstWeek.monthNumber || 1;
      const month = Array.isArray(roadmap.months)
        ? (roadmap.months.find(m => m.monthNumber === monthNum) || roadmap.months[0])
        : { monthNumber: 1, title: 'Month 1', weeks: [] };
      return { week: firstWeek, month: month || { monthNumber: 1, title: 'Month 1', weeks: [] } };
    }
  }

  return null;
}

/**
 * Get motivational message based on progress
 */
export function getMotivationalMessage(overallPercent, streak) {
  if (overallPercent === 0) {
    return "Every expert was once a beginner. Your mission starts now.";
  }
  if (overallPercent < 10) {
    return "You've taken the first step. That's harder than it sounds. Keep going.";
  }
  if (overallPercent < 25) {
    return "You're building momentum. The compound effect of daily learning is real.";
  }
  if (overallPercent < 50) {
    return "You're past the beginner's wall. This is where real developers are made.";
  }
  if (overallPercent < 75) {
    return "Over halfway. You've already learned what most people never start.";
  }
  if (overallPercent < 90) {
    return "Almost there. The final stretch is where champions separate themselves.";
  }
  return "You are the mission. Launch is imminent.";
}

/**
 * Calculate readiness scores for the Command Center dashboard and Progress overview
 */
/**
 * Calculate readiness scores for the Command Center dashboard and Progress overview
 */
export function calculateReadinessScores(roadmap, progress, checkpointStatuses, streak, resourcesStatus, practicalMissions) {
  let items = [];

  // Gather tasks, resources, and practical missions
  if (roadmap?.months) {
    roadmap.months.forEach((m) => {
      m.weeks?.forEach((w) => {
        // Study Resources — support both studyResources (new) and resources (legacy)
        const weekResources =
          Array.isArray(w.studyResources) ? w.studyResources :
          Array.isArray(w.resources)      ? w.resources :
          [];

        weekResources.forEach((res) => {
          const status = resourcesStatus?.[res.title] || 'Not Started';
          items.push({
            type: 'resource',
            item: res,
            week: w,
            month: m,
            weight: 1,
            completed: status === 'Studied'
          });
        });

        // Tasks
        (w.tasks || []).forEach((task, idx) => {
          const taskKey = `m${m.monthNumber}_w${w.weekNumber}`;
          const doneList = progress?.completedTasks?.[taskKey] || [];
          items.push({
            type: 'task',
            item: task,
            week: w,
            month: m,
            weight: 1,
            completed: (Array.isArray(doneList) ? doneList : []).includes(idx)
          });
        });

        // Practical Missions
        (w.practicalMissions || []).forEach((pm) => {
          const pmRecord = practicalMissions?.[pm.missionId || pm.id];
          items.push({
            type: 'practical',
            item: pm,
            week: w,
            month: m,
            weight: 3,
            completed: pmRecord?.status === 'Completed'
          });
        });
      });
    });
  }

  // Checkpoints
  if (roadmap?.checkpoints) {
    roadmap.checkpoints.forEach((cp) => {
      const status = checkpointStatuses?.[cp.skill] || 'Not yet';
      let compFraction = 0;
      if (status === 'Confident') compFraction = 1;
      else if (status === 'Learning') compFraction = 0.5;
      items.push({
        type: 'checkpoint',
        item: cp,
        weight: 3,
        completedFraction: compFraction
      });
    });
  }

  // Projects
  if (roadmap?.projects) {
    roadmap.projects.forEach((proj, pi) => {
      const milestones = proj.milestones || [];
      const completedMilestones = progress?.completedProjectMilestones?.[pi] || [];
      milestones.forEach((ms, mi) => {
        items.push({
          type: 'project_milestone',
          item: ms,
          weight: 2,
          completed: (Array.isArray(completedMilestones) ? completedMilestones : []).includes(mi)
        });
      });
    });
  }

  // Helper to check if item matches category/tag
  const matchesCategory = (item, catName, parentWeek, parentMonth) => {
    if (!item) return false;
    const normCat = String(catName).toLowerCase();

    // 1. Direct readinessImpact match
    if (item.readinessImpact && typeof item.readinessImpact === 'object') {
      const keys = Object.keys(item.readinessImpact).map(k => k.toLowerCase());
      if (keys.includes(normCat)) return true;
    }

    // 2. Direct category / tag match
    const itemCat = String(item.category || item.tag || '').toLowerCase();
    if (itemCat === normCat || itemCat.includes(normCat)) return true;

    const tags = Array.isArray(item.tags) ? item.tags : [];
    if (tags.some(t => String(t).toLowerCase() === normCat || String(t).toLowerCase().includes(normCat))) return true;

    // 3. Text content matching
    const text = typeof item === 'string'
      ? item
      : String(item.title || item.label || item.text || item.description || '');
    if (text.toLowerCase().includes(normCat)) return true;

    // 4. Fallback to parent week/month categories
    if (parentWeek && matchesCategory(parentWeek, catName)) return true;
    if (parentMonth && matchesCategory(parentMonth, catName)) return true;

    return false;
  };

  // Helper to map a category string to one of the 6 dashboard tracks
  const getTrackKey = (catName) => {
    const name = String(catName).toLowerCase();
    if (name.includes('elliot') || name.includes('assembly') || name.includes('integration')) return 'elliot';
    if (name.includes('javascript') || name.includes('js') || name.includes('foundations')) return 'javascript';
    if (name.includes('react native') || name.includes('mobile') || name.includes('native') || name.includes('ios') || name.includes('android')) return 'mobile';
    if (name.includes('react')) return 'react';
    if (name.includes('backend') || name.includes('database') || name.includes('firebase') || name.includes('auth') || name.includes('server')) return 'backend';
    if (name.includes('product') || name.includes('capstone') || name.includes('builder')) return 'product';
    return null;
  };

  // Month-based fallback calculation
  const getMonthFallbackScore = (startWeek, endWeek) => {
    let total = 0;
    let done = 0;
    if (roadmap?.months) {
      roadmap.months.forEach((m) => {
        m.weeks?.forEach((w) => {
          if (w.weekNumber >= startWeek && w.weekNumber <= endWeek) {
            const taskCount = Array.isArray(w.tasks) ? w.tasks.length : 0;
            const key = `m${m.monthNumber}_w${w.weekNumber}`;
            const completedTasksArr = progress?.completedTasks?.[key];
            const completedCount = Array.isArray(completedTasksArr) ? completedTasksArr.length : 0;
            total += taskCount;
            done += completedCount;
          }
        });
      });
    }
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  const tracks = ['javascript', 'react', 'mobile', 'backend', 'product', 'elliot'];
  const trackScores = {};

  tracks.forEach(trackKey => {
    let matchingCats = [];
    if (Array.isArray(roadmap?.readinessCategories)) {
      matchingCats = roadmap.readinessCategories.filter(cat => getTrackKey(cat) === trackKey);
    }

    const catsToSearch = matchingCats.length > 0 ? matchingCats : [trackKey];
    let totalWeight = 0;
    let completedWeight = 0;

    items.forEach(collected => {
      let matches = false;
      for (const cat of catsToSearch) {
        if (matchesCategory(collected.item, cat, collected.week, collected.month)) {
          matches = true;
          break;
        }
      }

      if (matches) {
        totalWeight += collected.weight;
        const fraction = collected.completedFraction !== undefined
          ? collected.completedFraction
          : (collected.completed ? 1 : 0);
        completedWeight += collected.weight * fraction;
      }
    });

    if (totalWeight > 0) {
      trackScores[trackKey] = Math.round((completedWeight / totalWeight) * 100);
    } else {
      trackScores[trackKey] = null;
    }
  });

  // Apply fallback where needed
  const jsPercent = trackScores.javascript ?? getMonthFallbackScore(1, 8);
  const reactPercent = trackScores.react ?? getMonthFallbackScore(9, 12);
  const mobilePercent = trackScores.mobile ?? getMonthFallbackScore(13, 16);
  const backendPercent = trackScores.backend ?? getMonthFallbackScore(17, 20);
  const productPercent = trackScores.product ?? getMonthFallbackScore(21, 24);

  // Elliot Assembly
  const elliotPercent = trackScores.elliot ?? Math.round(
    (jsPercent * 0.25) +
    (reactPercent * 0.2) +
    (mobilePercent * 0.2) +
    (backendPercent * 0.2) +
    (productPercent * 0.15)
  );

  // Consistency Score
  const currentStreak = streak?.currentStreak || 0;
  const totalDays = streak?.totalStudyDays || 0;
  const consistencyPercent = Math.min(100, (currentStreak * 5) + (totalDays * 2));

  return {
    javascript: jsPercent,
    react: reactPercent,
    mobile: mobilePercent,
    backend: backendPercent,
    product: productPercent,
    elliot: elliotPercent,
    consistency: consistencyPercent,
  };
}

// ─── Color palette for dynamic readiness categories ──────────────────────────
const CATEGORY_COLORS = [
  'from-blue-500 to-accent-primary',
  'from-purple-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
  'from-cyan-500 to-blue-500',
  'from-rose-500 to-red-500',
  'from-indigo-500 to-purple-500',
  'from-yellow-500 to-amber-500',
  'from-teal-500 to-emerald-500',
  'from-fuchsia-500 to-pink-500',
];

/**
 * Calculate dynamic readiness scores driven by activeRoadmap.readinessCategories.
 * Works with any imported JSON — not hardcoded to Elliot tracks.
 *
 * Priority for each category:
 *  1. If category has relatedWeeks, calculate from those specific weeks.
 *  2. If items have matching tags/IDs/readinessImpact, use them.
 *  3. Keyword match on category title/id vs item text.
 *  4. Fallback: return 0% (not invented progress).
 *
 * @param {object} roadmap        - Normalized roadmap object
 * @param {object} progress       - Progress state
 * @param {object} resourcesStatus
 * @param {object} practicalMissions
 * @returns {Array<{id, title, description, percent, color, weekCount}>}
 */
export function calculateDynamicReadiness(roadmap, progress, resourcesStatus, practicalMissions) {
  const categories = Array.isArray(roadmap?.readinessCategories)
    ? roadmap.readinessCategories
    : [];

  if (categories.length === 0) return [];

  // Flatten all weeks from the roadmap
  const allWeeks = [];
  if (Array.isArray(roadmap?.weeks) && roadmap.weeks.length > 0) {
    allWeeks.push(...roadmap.weeks);
  } else if (Array.isArray(roadmap?.months)) {
    roadmap.months.forEach((m) => {
      (m.weeks || []).forEach((w) => allWeeks.push({ ...w, monthNumber: m.monthNumber }));
    });
  }

  const norm = (s) => String(s || '').toLowerCase();

  // Score a single week's completion
  const scoreWeek = (week) => {
    let total = 0;
    let done = 0;

    const monthNum = week.monthNumber || 1;
    const taskKey = `m${monthNum}_w${week.weekNumber}`;

    // Study resources
    const resources =
      Array.isArray(week.studyResources) ? week.studyResources :
      Array.isArray(week.resources)      ? week.resources : [];
    resources.forEach((r) => {
      total++;
      if (resourcesStatus?.[r.title] === 'Studied') done++;
    });

    // Tasks
    const tasks = Array.isArray(week.tasks) ? week.tasks : [];
    const doneTasks = progress?.completedTasks?.[taskKey] || [];
    tasks.forEach((_, idx) => {
      total++;
      if ((Array.isArray(doneTasks) ? doneTasks : []).includes(idx)) done++;
    });

    // Practical missions
    const missions = Array.isArray(week.practicalMissions) ? week.practicalMissions : [];
    missions.forEach((pm) => {
      total += 3; // weight 3
      const pmId = pm.missionId || pm.id;
      const record = practicalMissions?.[pmId];
      if (record?.status === 'Completed') done += 3;
    });

    return { total, done };
  };

  return categories.map((cat, idx) => {
    const catId = cat.id || `cat-${idx}`;
    const catTitle = cat.title || `Category ${idx + 1}`;
    const catDescription = cat.description || '';
    const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

    // 1. If category specifies relatedWeeks
    let relatedWeeks = [];
    if (Array.isArray(cat.relatedWeeks) && cat.relatedWeeks.length > 0) {
      relatedWeeks = allWeeks.filter((w) =>
        cat.relatedWeeks.includes(w.weekNumber) ||
        cat.relatedWeeks.includes(w.weekId)
      );
    }

    // 2. Keyword / ID match if no explicit relatedWeeks
    if (relatedWeeks.length === 0) {
      const keywords = [
        norm(catId),
        norm(catTitle),
        ...(Array.isArray(cat.tags) ? cat.tags.map(norm) : []),
      ].filter(Boolean);

      relatedWeeks = allWeeks.filter((w) => {
        const weekText = [
          norm(w.title), norm(w.goal), norm(w.objective), norm(w.briefing),
          norm(w.weekId), norm(w.track),
        ].join(' ');
        return keywords.some((kw) => weekText.includes(kw));
      });
    }

    if (relatedWeeks.length === 0) {
      // No match — show 0% but still render the category
      return { id: catId, title: catTitle, description: catDescription, percent: 0, color, weekCount: 0 };
    }

    let total = 0;
    let done = 0;
    relatedWeeks.forEach((w) => {
      const s = scoreWeek(w);
      total += s.total;
      done += s.done;
    });

    const percent = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;

    return {
      id: catId,
      title: catTitle,
      description: catDescription,
      percent,
      color,
      weekCount: relatedWeeks.length,
    };
  });
}

