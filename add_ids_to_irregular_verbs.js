// Node.js script to add unique ids to every entry in the irregularVerbs array in verbs_00/index.html
// Usage: node add_ids_to_irregular_verbs.js
// This will overwrite verbs_00/index.html and create a backup as index.html.bak

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'verbs_00', 'index.html');
const BACKUP = path.join(__dirname, 'verbs_00', 'index.html.bak');

// Read the file
let content = fs.readFileSync(FILE, 'utf8');

// Backup the original file
fs.writeFileSync(BACKUP, content);

// Regex to find the irregularVerbs array
const arrayStart = content.indexOf('const irregularVerbs = [');
if (arrayStart === -1) {
  console.error('Could not find irregularVerbs array.');
  process.exit(1);
}
const arrayEnd = content.indexOf('];', arrayStart);
if (arrayEnd === -1) {
  console.error('Could not find end of irregularVerbs array.');
  process.exit(1);
}

const before = content.slice(0, arrayStart);
const arrayBody = content.slice(arrayStart, arrayEnd + 2); // include '];'
const after = content.slice(arrayEnd + 2);

// Match all objects in the array (assumes each starts with { and ends with },)
let idx = 1;
const updatedArrayBody = arrayBody.replace(/\{\s*([^}]*?)\}/gs, (match, inner) => {
  // If already has id: 'irr-...', replace it
  let newInner = inner.replace(/id:\s*'irr-\d+',?\s*/g, '');
  // Insert id as first property
  newInner = `id: 'irr-${idx++}',\n` + newInner.trim();
  return '{\n' + newInner + '\n}';
});

// Write the updated file
const newContent = before + updatedArrayBody + after;
fs.writeFileSync(FILE, newContent, 'utf8');

console.log('Added unique ids to all irregularVerbs entries. Backup saved as index.html.bak'); 