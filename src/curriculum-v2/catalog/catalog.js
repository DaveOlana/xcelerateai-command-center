import goldenRuntime from './published/goldenCurriculum.js';
import frontEndWebEngineeringRuntime from './published/frontEndWebEngineering.js';
import productDesignRuntime from './published/productDesign.js';
import pythonAgentEngineeringRuntime from './published/pythonAgentEngineering.js';
import cIntroductionRuntime from './published/cIntroduction.js';
import cppIntroductionRuntime from './published/cppIntroduction.js';
import javaIntroductionRuntime from './published/javaIntroduction.js';
import javascriptIntroductionRuntime from './published/javascriptIntroduction.js';
import pythonIntroductionRuntime from './published/pythonIntroduction.js';
import webDevelopmentIntroductionRuntime from './published/webDevelopmentIntroduction.js';
import { createCatalogEntry, createCurriculumCatalog } from './publishCurriculum.js';

export const curriculumCatalog = createCurriculumCatalog([
  createCatalogEntry(goldenRuntime, 'draft'),
  createCatalogEntry(frontEndWebEngineeringRuntime, 'published'),
  createCatalogEntry(productDesignRuntime, 'published'),
  createCatalogEntry(pythonAgentEngineeringRuntime, 'published'),
  createCatalogEntry(cIntroductionRuntime, 'published'),
  createCatalogEntry(cppIntroductionRuntime, 'published'),
  createCatalogEntry(javaIntroductionRuntime, 'published'),
  createCatalogEntry(javascriptIntroductionRuntime, 'published'),
  createCatalogEntry(pythonIntroductionRuntime, 'published'),
  createCatalogEntry(webDevelopmentIntroductionRuntime, 'published'),
]);
