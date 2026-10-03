import goldenRuntime from './published/goldenCurriculum.js';
import frontEndWebEngineeringRuntime from './published/frontEndWebEngineering.js';
import productDesignRuntime from './published/productDesign.js';
import pythonAgentEngineeringRuntime from './published/pythonAgentEngineering.js';
import { createCatalogEntry, createCurriculumCatalog } from './publishCurriculum.js';

export const curriculumCatalog = createCurriculumCatalog([
  createCatalogEntry(goldenRuntime, 'draft'),
  createCatalogEntry(frontEndWebEngineeringRuntime, 'published'),
  createCatalogEntry(productDesignRuntime, 'published'),
  createCatalogEntry(pythonAgentEngineeringRuntime, 'published'),
]);
