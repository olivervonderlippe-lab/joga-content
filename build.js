// Baut index.html: Tailwind-CSS + Babel-kompiliertes JSX + Seed-Moves + Font in eine Datei.
const fs = require('fs'), { execSync } = require('child_process');
execSync('npx tailwindcss -i src/input.css -o build/app.css --minify', { stdio: 'inherit' });
execSync('npx babel src/app.jsx -o build/app.js', { stdio: 'inherit' });
const tpl = fs.readFileSync('src/template.html', 'utf8');
const out = tpl
  .replace('__FONT__', fs.readFileSync('src/font.txt', 'utf8').trim())
  .replace('__CSS__', fs.readFileSync('build/app.css', 'utf8'))
  .replace('__SEED__', fs.readFileSync('src/seed_moves.json', 'utf8').trim())
  .replace('__REACT__', () => fs.readFileSync('node_modules/react/umd/react.production.min.js', 'utf8'))
  .replace('__REACTDOM__', () => fs.readFileSync('node_modules/react-dom/umd/react-dom.production.min.js', 'utf8'))
  .replace('__JS__', () => fs.readFileSync('build/app.js', 'utf8'));
fs.writeFileSync('index.html', out);
console.log('index.html', (out.length / 1024).toFixed(0) + ' KB');
