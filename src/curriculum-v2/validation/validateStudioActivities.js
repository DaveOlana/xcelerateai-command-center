import { createFinding, createValidationReport, SEVERITIES } from './findings.js';

const asArray = (value) => Array.isArray(value) ? value : [];
const text = (value) => typeof value === 'string' ? value.trim() : '';
const vagueOutput = /^(?:an?|the)?\s*(?:inspectable\s+)?(?:artifact|design work|professional evidence)\.?$/i;

export function validateStudioActivities(studio, source) {
  const findings = [];
  const add = (code, message, ids = []) => findings.push(createFinding(code, SEVERITIES.BLOCKER, message, ids));
  const activities = asArray(studio?.activities);
  const buildIntegrated = studio?.schemaVersion === '1.1';
  const byWeek = new Map();
  activities.forEach((activity) => {
    if (byWeek.has(activity?.weekId)) add('V021-B001', `Duplicate Studio activity for ${activity?.weekId}.`, [activity?.weekId]);
    byWeek.set(activity?.weekId, activity);
  });
  asArray(source?.weeks).forEach((week) => {
    const activity = byWeek.get(week.id);
    if (!activity) return add('V021-B002', `${week.id} requires exactly one Studio activity.`, [week.id]);
    const contract = activity.contract;
    ['doing', 'why', 'output', 'tools', 'estimatedMinutes', 'prerequisites', 'finished', 'submission'].forEach((field) => {
      if ((field === 'estimatedMinutes' && !(Number(contract?.[field]) > 0)) || (field !== 'estimatedMinutes' && !text(contract?.[field]))) {
        add('V021-B003', `${week.id} Studio contract lacks ${field}.`, [week.id, field]);
      }
    });
    if (vagueOutput.test(text(contract?.output))) add('V021-B004', `${week.id} Studio output is vague rather than concrete.`, [week.id]);
    if (asArray(activity.steps).length === 0 || asArray(activity.steps).some((step) => !text(step))) add('V021-B005', `${week.id} requires clear Studio steps.`, [week.id]);
    if (asArray(activity.checklist).length === 0 || asArray(activity.checklist).some((item) => !text(item))) add('V021-B006', `${week.id} requires a finished-work checklist.`, [week.id]);
    if (!text(activity.stuck)) add('V021-B007', `${week.id} requires recovery guidance.`, [week.id]);
    if (asArray(activity?.prerequisiteReview?.unresolvedTerms).length > 0) add('V021-B008', `${week.id} Studio retains untaught prerequisite terms.`, [week.id, ...activity.prerequisiteReview.unresolvedTerms]);
    if (buildIntegrated) {
      const build = asArray(week?.builds).find((item) => item?.required && item?.id === activity?.placement?.buildId);
      if (activity?.placement?.stage !== 'build' || !build) add('V021-B010', `${week.id} guided activity must be placed inside its required Build.`, [week.id, activity?.placement?.buildId]);
      const buildSteps = asArray(build?.steps).map((step) => text(step?.text));
      if (asArray(activity.steps).length !== buildSteps.length || asArray(activity.steps).some((step, index) => text(step) !== buildSteps[index])) {
        add('V021-B011', `${week.id} guided activity steps must match the visible required Build steps.`, [week.id, build?.id]);
      }
      const hasStudyStudioLink = asArray(week?.study?.resources).some((assignment) => {
        const resource = asArray(source?.resources).find((item) => item?.id === assignment?.resourceId);
        const resourceUrl = text(resource?.url);
        const isCourseOwnedStudioUrl = /^\/curriculum\/[^?#]*studio(?:\.html|\/|$)/i.test(resourceUrl);
        return isCourseOwnedStudioUrl || (text(resource?.provider).toLowerCase() === 'xcelerateai' && resource?.format === 'lab');
      });
      if (hasStudyStudioLink) add('V021-B012', `${week.id} exposes a curriculum Build task as a Study resource.`, [week.id]);
    }
  });
  if (activities.length !== asArray(source?.weeks).length) add('V021-B009', 'Studio activity count must equal Week count.');
  return createValidationReport(source, findings);
}
