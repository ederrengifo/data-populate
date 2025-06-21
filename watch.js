const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('👀 Watching for file changes...');
console.log('📁 Watching: src/ui.html, src/ui.js');
console.log('🎯 Copying to: dist/');
console.log('Press Ctrl+C to stop\n');

// Watch UI files and copy them when they change
const watchFiles = ['src/ui.html', 'src/ui.js'];

watchFiles.forEach(file => {
  fs.watchFile(file, (curr, prev) => {
    console.log(`📝 ${file} changed, copying to dist/...`);
    try {
      execSync(`cp ${file} dist/`);
      console.log(`✅ ${file} copied successfully`);
    } catch (error) {
      console.error(`❌ Error copying ${file}:`, error.message);
    }
  });
});

// Keep the process running
process.on('SIGINT', () => {
  console.log('\n👋 Stopping file watcher...');
  process.exit(0);
}); 