const fs = require('fs');
const path = require('path');

const filesToModify = [
  "src/app/(dashboard)/projects/requirements/page.tsx",
  "src/app/(dashboard)/procurement/page.tsx",
  "src/app/(dashboard)/transfer/page.tsx",
  "src/app/(dashboard)/logistics/page.tsx",
  "src/app/(dashboard)/projects/page.tsx",
  "src/app/(dashboard)/rfc/page.tsx",
  "src/app/(dashboard)/rfc/approval/page.tsx",
  "src/app/(dashboard)/master-data/users/page.tsx",
  "src/app/(dashboard)/master-data/warehouses/page.tsx",
  "src/app/(dashboard)/master-data/materials/page.tsx",
  "src/app/(dashboard)/master-data/vendors/page.tsx"
];

filesToModify.forEach(relPath => {
  const file = path.join(__dirname, '../', relPath);
  let content = fs.readFileSync(file, 'utf8');

  // We want to match:
  // <div className="flex items-center justify-between animate-fade-in">
  //   <div>
  //     <h1 ...>...</h1>
  //     <p ...>...</p>
  //   </div>
  //   {BUTTON_BLOCK}
  // </div>
  // 
  // <div className="relative max-w-md animate-fade-in" style={{ animationDelay: '100ms' }}>
  //   <Search ... />
  //   <Input ... />
  // </div>

  // It's a bit hard to parse with regex perfectly due to nested tags. Let's use a robust regex.
  // We can look for the title block and the search block.
  
  const regex = /<div className="flex items-center justify-between animate-fade-in">\s*<div>([\s\S]*?)<\/div>\s*([\s\S]*?)\s*<\/div>\s*<div className="relative max-w-md animate-fade-in" style={{ animationDelay: '100ms' }}>\s*([\s\S]*?)\s*<\/div>/;

  const match = content.match(regex);
  
  if (match) {
    const titleBlock = match[1].trim(); // <h1> and <p>
    const buttonBlock = match[2].trim(); // <Button> or <Link> or <DialogTrigger>
    const searchBlock = match[3].trim(); // <Search> and <Input>

    const newLayout = `<div className="animate-fade-in">\n        ${titleBlock}\n      </div>\n\n      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-fade-in" style={{ animationDelay: '100ms' }}>\n        <div className="relative w-full max-w-md">\n          ${searchBlock}\n        </div>\n        ${buttonBlock}\n      </div>`;
    
    content = content.replace(regex, newLayout);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated layout in:', relPath);
  } else {
    // If it didn't match the standard search bar format, try a slightly different one
    // Some might have empty search bar or missing style, let's check.
    const regex2 = /<div className="flex items-center justify-between animate-fade-in">\s*<div>([\s\S]*?)<\/div>\s*([\s\S]*?)\s*<\/div>/;
    const match2 = content.match(regex2);
    if(match2 && !content.includes("max-w-md animate-fade-in")) {
       console.log('Skipping (no search bar adjacent found):', relPath);
    } else {
       console.log('Failed to match structure in:', relPath);
    }
  }
});
