import goldenRuntime from './published/goldenCurriculum.js';
import cProgrammingFoundationsRuntime from './published/cProgrammingFoundations.js';
import cppProgrammingFoundationsRuntime from './published/cppProgrammingFoundations.js';
import frontEndWebEngineeringRuntime from './published/frontEndWebEngineering.js';
import javaProgrammingFoundationsRuntime from './published/javaProgrammingFoundations.js';
import javascriptProgrammingFoundationsRuntime from './published/javascriptProgrammingFoundations.js';
import productDesignRuntime from './published/productDesign.js';
import pythonAgentEngineeringRuntime from './published/pythonAgentEngineering.js';
import pythonProgrammingFoundationsRuntime from './published/pythonProgrammingFoundations.js';
import webDevelopmentFoundationsRuntime from './published/webDevelopmentFoundations.js';
import { createCatalogEntry, createCurriculumCatalog } from './publishCurriculum.js';

export const curriculumCatalog = createCurriculumCatalog([
  createCatalogEntry(goldenRuntime, 'draft'),
  createCatalogEntry(cProgrammingFoundationsRuntime, 'published'),
  createCatalogEntry(cppProgrammingFoundationsRuntime, 'published'),
  createCatalogEntry(frontEndWebEngineeringRuntime, 'published'),
  createCatalogEntry(javaProgrammingFoundationsRuntime, 'published'),
  createCatalogEntry(javascriptProgrammingFoundationsRuntime, 'published'),
  createCatalogEntry(productDesignRuntime, 'published'),
  createCatalogEntry(pythonAgentEngineeringRuntime, 'published'),
  createCatalogEntry(pythonProgrammingFoundationsRuntime, 'published'),
  createCatalogEntry(webDevelopmentFoundationsRuntime, 'published'),
]);
