import { createFinding, createValidationReport, SEVERITIES } from './findings.js';

const asArray=value=>Array.isArray(value)?value:[];
const text=value=>typeof value==='string'?value.trim():'';
const normalize=value=>text(value).toLowerCase().replace(/[“”]/g,'"').replace(/[^a-z0-9]+/g,' ').trim();
const policyLeak=/\b(?:xcelerateai|this curriculum|provider cap|paid dev mode|free figma plan|validator behavior|learning path)\b/i;

export function validateSkillCheckAuthoring(audit,source){
  const findings=[];
  const add=(code,message,ids=[])=>findings.push(createFinding(code,SEVERITIES.BLOCKER,message,ids));
  const warn=(code,message,ids=[])=>findings.push(createFinding(code,SEVERITIES.WARNING,message,ids));
  const questions=asArray(source?.weeks).flatMap(week=>asArray(week?.skillCheck?.questions).map(question=>({week,question})));
  const entries=asArray(audit?.assessmentCoverageMap?.entries);
  const mapByQuestion=new Map();
  const targetIds=new Set();
  entries.forEach(entry=>{
    if(mapByQuestion.has(entry?.questionId)) add('V022-B001',`Duplicate assessment-map entry for ${entry?.questionId}.`,[entry?.questionId]);
    mapByQuestion.set(entry?.questionId,entry);
    if(!text(entry?.targetId)||targetIds.has(entry.targetId)) add('V022-B002',`Assessment target IDs must be present and unique: ${entry?.targetId||'(missing)'}.`,[entry?.questionId]);
    targetIds.add(entry?.targetId);
    if(!text(entry?.learningTarget)||!text(entry?.assessmentType)||!text(entry?.quizAppropriate)||!entry?.whereTaught||asArray(entry.whereTaught.resourceIds).length===0) add('V022-B003',`Assessment-map evidence is incomplete for ${entry?.questionId}.`,[entry?.questionId]);
  });
  if(entries.length!==questions.length) add('V022-B004',`Assessment-map count ${entries.length} must equal question count ${questions.length}.`);

  asArray(source?.weeks).forEach(week=>{
    const seenPrompts=new Set();
    const seenScenarioOpenings=new Set();
    const positions=new Set();
    const weekQuestions=asArray(week?.skillCheck?.questions);
    if(weekQuestions.length<6||weekQuestions.length>10) add('V022-B005',`${week.id} must contain 6–10 meaningful questions.`,[week.id]);
    weekQuestions.forEach(question=>{
      const prompt=normalize(question?.prompt);
      if(seenPrompts.has(prompt)) add('V022-B006',`${week.id} contains an exact or normalized duplicate prompt.`,[week.id,question?.id]);
      seenPrompts.add(prompt);
      const opening=normalize(text(question?.prompt).split(/[.?!]/)[0]);
      if(opening&&seenScenarioOpenings.has(opening)) add('V022-B007',`${week.id} repeats a scenario opening across questions.`,[week.id,question?.id]);
      seenScenarioOpenings.add(opening);
      const labels=asArray(question?.options).map(option=>normalize(option?.label));
      if(labels.length!==4||new Set(labels).size!==4) add('V022-B008',`${question?.id} must have four distinct options.`,[question?.id]);
      const learnerText=[question?.prompt,...asArray(question?.options).map(option=>option?.label),question?.explanation].join(' ');
      if(policyLeak.test(learnerText)) add('V022-B009',`${question?.id} leaks platform or curriculum policy.`,[question?.id]);
      if(normalize(learnerText).includes(normalize(week.title))) add('V022-B010',`${question?.id} contains suspicious Week-title metadata injection.`,[question?.id]);
      if(!text(question?.explanation)||/^(?:correct|incorrect)\.?$/i.test(text(question.explanation))) add('V022-B011',`${question?.id} requires substantive explanatory feedback.`,[question?.id]);
      if(!mapByQuestion.has(question?.id)) add('V022-B012',`${question?.id} is missing assessment-map evidence.`,[question?.id]);
      positions.add(question?.correctOptionId);
      const correct=asArray(question?.options).find(option=>option?.id===question?.correctOptionId);
      const otherLengths=asArray(question?.options).filter(option=>option!==correct).map(option=>text(option?.label).length);
      if(correct&&otherLengths.length&&text(correct.label).length>Math.max(...otherLengths)*1.8) warn('V022-W001',`${question.id} correct answer is substantially longer than every distractor.`,[question.id]);
    });
    if(positions.size<3) add('V022-B013',`${week.id} correct answers use fewer than three option positions.`,[week.id]);
  });
  questions.forEach(({question})=>{if(!mapByQuestion.has(question.id)) add('V022-B014',`${question.id} has no authored assessment target.`,[question.id]);});
  return createValidationReport(source,findings,{summary:{questions:questions.length,coverageEntries:entries.length,distinctTargets:targetIds.size}});
}
