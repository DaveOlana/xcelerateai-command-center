import goldenRuntime from './published/goldenCurriculum.js';
import frontEndWebEngineeringRuntime from './published/frontEndWebEngineering.js';
import javascriptProgrammingFoundationsRuntime from './published/javascriptProgrammingFoundations.js';
import productDesignRuntime from './published/productDesign.js';
import pythonAgentEngineeringRuntime from './published/pythonAgentEngineering.js';
import pythonProgrammingFoundationsRuntime from './published/pythonProgrammingFoundations.js';
import { createCatalogEntry, createCurriculumCatalog } from './publishCurriculum.js';

export const curriculumCatalog = createCurriculumCatalog([
  createCatalogEntry(goldenRuntime, 'draft'),
  createCatalogEntry(frontEndWebEngineeringRuntime, 'published'),
  createCatalogEntry(javascriptProgrammingFoundationsRuntime, 'published'),
  createCatalogEntry(productDesignRuntime, 'published'),
  createCatalogEntry(pythonAgentEngineeringRuntime, 'published'),
  createCatalogEntry(pythonProgrammingFoundationsRuntime, 'published'),
]);
