const fs = require('fs');

const en = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));
const vi = JSON.parse(fs.readFileSync('messages/vi.json', 'utf8'));

function deepMergeAndValidate(source, target) {
  const result = Array.isArray(source) ? [] : {};

  for (const key of Object.keys(source)) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      result[key] = deepMergeAndValidate(source[key], (target && target[key]) ? target[key] : (Array.isArray(source[key]) ? [] : {}));
    } else {
      result[key] = (target && target[key] !== undefined) ? target[key] : source[key];
    }
  }

  return result;
}

const completeVi = deepMergeAndValidate(en, vi);

fs.writeFileSync('messages/vi.json', JSON.stringify(completeVi, null, 2), 'utf8');
console.log('Successfully validated and saved complete messages/vi.json');
