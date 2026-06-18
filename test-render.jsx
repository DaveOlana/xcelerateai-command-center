import React from 'react';
import { renderToString } from 'react-dom/server';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './src/context/AppContext';
import ProgressOverview from './src/pages/ProgressOverview';

try {
  const html = renderToString(
    <BrowserRouter>
      <AppProvider>
        <ProgressOverview />
      </AppProvider>
    </BrowserRouter>
  );
  console.log('RENDER SUCCESS');
} catch (e) {
  console.error('RENDER FAILED:', e);
}
