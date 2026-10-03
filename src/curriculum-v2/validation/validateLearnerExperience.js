import { createFinding, createValidationReport, SEVERITIES } from './findings.js';

const asArray = (value) => Array.isArray(value) ? value : [];
const text = (value) => typeof value === 'string' ? value.trim() : '';
const vagueScope = /\b(relevant sections?|what is useful|as needed|where relevant|explore|browse|when (?:it|the page) becomes? (?:advanced|unrelated)|related to this week)\b/i;
const vagueOutput = /^(?:an?|the)?\s*(?:inspectable\s+)?(?:artifact|design work|professional evidence)\.?$/i;
const abstractBeginnerAction = /\b(restate (?:the )?outcome|user-visible success condition|inspectable artifact|acceptance boundary|implementation boundary|delivery condition)\b/i;

export function validateLearnerExperience(audit, source) {
  const findings = [];
  const add = (code, message, ids = []) => findings.push(createFinding(code, SEVERITIES.BLOCKER, message, ids));
  const focusVendor = text(audit?.focusVendor?.name).toLowerCase();
  const aliases = new Set([focusVendor, ...asArray(audit?.focusVendor?.aliases).map((item) => text(item).toLowerCase())].filter(Boolean));
  const resources = new Map(asArray(source?.resources).map((resource) => [resource.id, resource]));
  const resourceAudits = new Map(asArray(audit?.resourceAudits).map((record) => [record.resourceId, record]));

  asArray(source?.weeks).forEach((week) => {
    const assignments = asArray(week?.study?.resources);
    if (aliases.size > 0) {
      const vendorResources = assignments.filter((assignment) => aliases.has(text(resources.get(assignment.resourceId)?.provider).toLowerCase()));
      if (vendorResources.length > 1) add('V020-B076', `${week.id} has ${vendorResources.length} focus-vendor Study cards; the maximum is one.`, [week.id, ...vendorResources.map((item) => item.resourceId)]);
    }

    assignments.forEach((assignment) => {
      const record = resourceAudits.get(assignment.resourceId);
      const learner = record?.learnerAssignment;
      const requiredLearning = assignment?.role === 'core' && ['learn', 'practice'].includes(assignment?.learningRole);
      if (!learner || ['start', 'consume', 'stop', 'accountRequirement', 'expectedOutcome', 'nextAction'].some((field) => !text(learner[field]))) {
        add('V020-B077', `Resource ${assignment.resourceId} lacks explicit entry, scope, exit, account, outcome, or next-action instructions.`, [week.id, assignment.resourceId]);
        return;
      }
      if (vagueScope.test([learner.start, learner.consume, learner.stop].join(' '))) {
        add('V020-B078', `Resource ${assignment.resourceId} delegates assignment scoping to the learner.`, [week.id, assignment.resourceId]);
      }
      if (requiredLearning && learner.destinationType === 'hub' && !text(learner.deterministicPath)) {
        add('V020-B079', `Required ${assignment.learningRole} resource ${assignment.resourceId} is an unresolved hub or directory.`, [week.id, assignment.resourceId]);
      }
      if (requiredLearning && !['direct', 'hub'].includes(learner.destinationType)) {
        add('V020-B080', `Required resource ${assignment.resourceId} must classify its landing destination.`, [week.id, assignment.resourceId]);
      }
    });

    asArray(week?.builds).filter((build) => build?.required).forEach((build) => {
      const output = text(build?.learnerGuide?.finishedResult);
      if (!output || vagueOutput.test(output)) add('V020-B081', `Required Build ${build.id} lacks a concrete named output.`, [week.id, build.id]);
      const evidence = asArray(week?.proof?.evidence);
      if (evidence.length === 0 || evidence.some((item) => !text(item?.label))) {
        add('V020-B082', `Required Build ${build.id} lacks a clear proof/submission expectation.`, [week.id, build.id]);
      }
      if (week?.sequence <= 6 && abstractBeginnerAction.test([
        week?.study?.objective,
        build?.brief,
        build?.learnerGuide?.summary,
        ...asArray(build?.steps).map((step) => step?.text),
      ].join(' '))) {
        add('V020-B091', `${week.id} uses abstract curriculum-author language where a beginner needs a concrete action.`, [week.id, build.id]);
      }
    });
  });

  return createValidationReport(source, findings);
}
