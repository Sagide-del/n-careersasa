const { execSync } = require('child_process');
console.log('?? Building TypeScript...');
try {
  execSync('npx tsc -p tsconfig.json', { stdio: 'inherit' });
  console.log('? Build complete!');
} catch (error) {
  console.error('? Build failed:', error);
  process.exit(1);
}
