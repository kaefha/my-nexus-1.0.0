const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file));
    } else {
      if (file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = getFiles('src/app/(dashboard)');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  content = content.replace(/<TableHead(?: className="([^"]*)")?>([\s\S]*?)<\/TableHead>/g, (match, className, textContent) => {
    // If it already has a w- class (like w-[120px]), leave it
    if (className && className.includes('w-')) return match;
    
    let baseClass = className ? className : '';
    let widthClass = 'w-[150px]'; // default
    
    const text = textContent.trim().toLowerCase();
    
    // Check if there is an icon or extra element and extract the actual string for matching, 
    // or just rely on raw text which works fine for our simple matching.
    if (text.includes('action')) {
      widthClass = 'w-[80px]';
    } else if (text.includes('status')) {
      widthClass = 'w-[120px]';
    } else if (text.includes('name') || text.includes('description') || text.includes('notes') || text.includes('project') || text.includes('vendor') || text.includes('warehouse') || text.includes('material')) {
      widthClass = 'w-[250px]';
    } else if (text.includes('date') || text.includes('expected') || text.includes('updated')) {
      widthClass = 'w-[150px]';
    } else if (text.includes('qty') || text.includes('quantity') || text.includes('capacity') || text.includes('items')) {
      widthClass = 'w-[100px]';
    } else if (text.includes('region') || text.includes('origin') || text.includes('destination') || text.includes('customer') || text.includes('pic') || text.includes('email') || text.includes('contact') || text.includes('location')) {
      widthClass = 'w-[200px]';
    } else if (text.includes('id') || text.includes('number') || text.includes('code') || text.includes('sku') || text.includes('type')) {
      widthClass = 'w-[150px]';
    }

    const newClass = baseClass ? `${widthClass} ${baseClass}` : widthClass;
    changed = true;
    return `<TableHead className="${newClass}">${textContent}</TableHead>`;
  });

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
