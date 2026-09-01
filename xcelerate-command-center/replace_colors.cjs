const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('c:/Users/HP/Downloads/Xcelerate AI Command Bootcamp Centre/xcelerate-command-center/src', function(filePath) {
    if (filePath.endsWith('.jsx') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let initialContent = content;
        
        content = content.replace(/accent-green/g, 'accent-primary');
        content = content.replace(/green-glow/g, 'primary-glow');
        content = content.replace(/emerald-500/g, 'blue-500');
        content = content.replace(/emerald-400/g, 'blue-400');
        content = content.replace(/pulse-green/g, 'pulse-primary');
        content = content.replace(/rgba\(0, 255, 135/g, 'rgba(59, 130, 246');
        content = content.replace(/rgba\(0,255,135/g, 'rgba(59,130,246');
        content = content.replace(/#00ff87/g, '#3b82f6');
        
        if (content !== initialContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Updated', filePath);
        }
    }
});
