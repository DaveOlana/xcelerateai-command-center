import assert from 'node:assert/strict';
import test from 'node:test';
import { validateSkillCheckAuthoring } from './validateSkillCheckAuthoring.js';

const fixture=()=>{
  const questions=Array.from({length:6},(_,index)=>({id:`Q${index+1}`,prompt:`Scenario ${index+1} has a bounded decision. Which response fits?`,options:['a','b','c','d'].map((id,j)=>({id,label:`Option ${index+1}-${j+1} with plausible reasoning`})),correctOptionId:['a','b','c','d','a','b'][index],explanation:'The selected response addresses the stated condition; the alternatives solve different problems.'}));
  const source={curriculumId:'TEST',weeks:[{id:'W1',title:'A Week Title',skillCheck:{questions}}]};
  const audit={assessmentCoverageMap:{entries:questions.map((q,index)=>({weekId:'W1',questionId:q.id,targetId:`T${index+1}`,learningTarget:`Target ${index+1}`,whereTaught:{resourceIds:['R1']},assessmentType:'scenario reasoning',quizAppropriate:'Reasoning can be assessed without claiming execution.'}))}};
  return {source,audit};
};
test('complete distinct assessment map passes',()=>{const x=fixture();assert.equal(validateSkillCheckAuthoring(x.audit,x.source).status,'PASS')});
test('missing coverage entry fails',()=>{const x=fixture();x.audit.assessmentCoverageMap.entries.pop();assert.equal(validateSkillCheckAuthoring(x.audit,x.source).status,'FAIL')});
test('duplicate target ID fails',()=>{const x=fixture();x.audit.assessmentCoverageMap.entries[1].targetId='T1';assert.equal(validateSkillCheckAuthoring(x.audit,x.source).status,'FAIL')});
test('duplicate prompt fails',()=>{const x=fixture();x.source.weeks[0].skillCheck.questions[1].prompt=x.source.weeks[0].skillCheck.questions[0].prompt;assert.equal(validateSkillCheckAuthoring(x.audit,x.source).status,'FAIL')});
test('repeated scenario opening fails',()=>{const x=fixture();x.source.weeks[0].skillCheck.questions[1].prompt='Scenario 1 has a bounded decision. What principle applies?';assert.equal(validateSkillCheckAuthoring(x.audit,x.source).status,'FAIL')});
test('duplicate options fail',()=>{const x=fixture();x.source.weeks[0].skillCheck.questions[0].options[1].label=x.source.weeks[0].skillCheck.questions[0].options[0].label;assert.equal(validateSkillCheckAuthoring(x.audit,x.source).status,'FAIL')});
test('distinct programming operators remain distinct option labels',()=>{const x=fixture();x.source.weeks[0].skillCheck.questions[0].options=['&&','||','!','==='].map((label,index)=>({id:['a','b','c','d'][index],label:`\`${label}\``}));assert.equal(validateSkillCheckAuthoring(x.audit,x.source).status,'PASS')});
test('platform-policy leakage fails',()=>{const x=fixture();x.source.weeks[0].skillCheck.questions[0].prompt='Why does this curriculum avoid paid Dev Mode?';assert.equal(validateSkillCheckAuthoring(x.audit,x.source).status,'FAIL')});
test('week-title injection fails',()=>{const x=fixture();x.source.weeks[0].skillCheck.questions[0].options[0].label='Continue after A Week Title';assert.equal(validateSkillCheckAuthoring(x.audit,x.source).status,'FAIL')});
test('feedback must explain reasoning',()=>{const x=fixture();x.source.weeks[0].skillCheck.questions[0].explanation='Correct.';assert.equal(validateSkillCheckAuthoring(x.audit,x.source).status,'FAIL')});
test('question count outside six to ten fails',()=>{const x=fixture();x.source.weeks[0].skillCheck.questions.pop();x.audit.assessmentCoverageMap.entries.pop();assert.equal(validateSkillCheckAuthoring(x.audit,x.source).status,'FAIL')});
test('answer positions must not collapse into a detectable single key',()=>{const x=fixture();x.source.weeks[0].skillCheck.questions.forEach(q=>q.correctOptionId='a');assert.equal(validateSkillCheckAuthoring(x.audit,x.source).status,'FAIL')});
