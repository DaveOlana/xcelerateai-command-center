import goldenRuntime from './published/goldenCurriculum.js';
import pythonAgentEngineeringRuntime from './published/pythonAgentEngineering.js';
import { createCatalogEntry, createCurriculumCatalog } from './publishCurriculum.js';

export const curriculumCatalog = createCurriculumCatalog([
  createCatalogEntry(goldenRuntime, 'draft'),
  createCatalogEntry(pythonAgentEngineeringRuntime, 'published'),
]);
