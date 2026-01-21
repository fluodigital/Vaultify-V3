const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src', 'alfred', 'prompts');
const destDir = path.join(__dirname, '..', 'lib', 'alfred', 'prompts');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    const stat = fs.statSync(s);
    if (stat.isDirectory()) {
      copyRecursive(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

copyRecursive(srcDir, destDir);
console.log('Prompts copied to lib/alfred/prompts');
