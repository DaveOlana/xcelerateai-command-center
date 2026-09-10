export const SEMANTIC_REVIEW_VALIDATORS = Object.freeze([
  { validator: 'V004', name: 'Competency quality', expectedInput: ['profession', 'competencies'], expectedOutput: 'structured findings' },
  { validator: 'V006', name: 'Assessment quality', expectedInput: ['curriculumSource'], expectedOutput: 'structured findings' },
  { validator: 'V007', name: 'Build quality', expectedInput: ['curriculumSource', 'learningDesign'], expectedOutput: 'structured findings' },
  { validator: 'V012', name: 'Resource Auditor', expectedInput: ['resources', 'curriculumSource'], expectedOutput: 'structured findings' },
  { validator: 'V013', name: 'Hidden-prerequisite review', expectedInput: ['competencies', 'curriculumSource'], expectedOutput: 'structured findings' },
  { validator: 'V015', name: 'Curriculum Critic', expectedInput: ['curriculumSource', 'coverage'], expectedOutput: 'structured findings' },
  { validator: 'V016', name: 'Professional Capability Auditor', expectedInput: ['profession', 'competencies', 'curriculumSource', 'coverage'], expectedOutput: 'structured findings' },
]);

export function isSemanticReviewFinding(value) {
  return Boolean(value) && typeof value.code === 'string' && ['BLOCKER', 'WARNING', 'NOTE'].includes(value.severity) && typeof value.message === 'string' && Array.isArray(value.affectedIds);
}
