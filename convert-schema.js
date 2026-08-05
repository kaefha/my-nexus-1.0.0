const fs = require('fs');

const schemaPath = './prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

// 1. Change provider to sqlite
schema = schema.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
schema = schema.replace(/url\s*=\s*env\("DATABASE_URL"\)/g, 'url      = "file:./dev.db"');

// 2. Extract all enum names and values
const enumRegex = /enum\s+([A-Za-z0-9_]+)\s*{([^}]+)}/g;
let match;
const enums = {};

while ((match = enumRegex.exec(schema)) !== null) {
  const enumName = match[1];
  const enumValues = match[2].split('\n').map(v => v.trim()).filter(v => v.length > 0);
  enums[enumName] = enumValues;
}

// 3. Remove all enum definitions
schema = schema.replace(enumRegex, '');

// 4. Replace enum types with String in models
for (const enumName of Object.keys(enums)) {
  const typeRegex = new RegExp(`\\b${enumName}\\b`, 'g');
  schema = schema.replace(typeRegex, 'String');
}

// 5. Fix SQLite unsupported array scalars
schema = schema.replace(/String\[\]/g, 'String'); 

fs.writeFileSync('./prisma/schema.prisma', schema);
console.log('Successfully converted schema to SQLite!');
