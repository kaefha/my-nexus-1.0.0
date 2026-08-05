const fs = require('fs');

const schemaPath = './prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

// Replace @default(VALUE) with @default("VALUE") if VALUE is all caps and letters/underscores
schema = schema.replace(/@default\(([A-Z_]+)\)/g, '@default("$1")');

fs.writeFileSync('./prisma/schema.prisma', schema);
console.log('Successfully quoted defaults!');
