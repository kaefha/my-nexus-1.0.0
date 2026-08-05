const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, '../src'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Regex to match shadow classes: shadow, shadow-sm, shadow-md, shadow-lg, shadow-xl, shadow-none, shadow-[...], shadow-primary/20
  // It handles boundaries to not match something like "box-shadow" but tailwind classes are spaced.
  const regex = /\bshadow(?:-[a-zA-Z0-9\/\[\]_\-\(\)]+)?\b/g;
  
  if (regex.test(content)) {
    const newContent = content.replace(regex, '');
    
    // Also clean up double spaces that might be left behind
    const cleanContent = newContent.replace(/  +/g, ' ');
    
    fs.writeFileSync(file, cleanContent, 'utf8');
    console.log('Removed shadows in:', file);
  }
});
