const fs = require('fs');
const files = [
  'src/pages/WeeklyMissions.jsx',
  'src/pages/PracticalMissionView.jsx',
  'src/pages/ImportRoadmap.jsx',
  'src/components/common/UIComponents.jsx',
  'src/pages/Dashboard.jsx',
  'src/pages/ProjectTracker.jsx',
  'src/pages/Blockers.jsx'
];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    const original = content;
    content = content.replace(/badge-green/g, 'badge-blue');
    content = content.replace(/status-dot-green/g, 'status-dot-blue');
    content = content.replace(/accentColor="green"/g, 'accentColor="blue"');
    content = content.replace(/bg-glow-green/g, 'bg-glow-blue');
    if (content !== original) {
      fs.writeFileSync(f, content, 'utf8');
      console.log('Fixed ' + f);
    }
  }
});
