const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\truongg\\.gemini\\antigravity\\brain\\8cdc4185-e3a7-4bc1-9c4d-e5f98e035770\\.system_generated\\steps\\1223\\output.txt', 'utf8');

const lines = content.split('\n');
let foundPrompt = false;
let responseLines = [];

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('phông chữ thì xấu màu sắc thì lòe loẹt')) {
    foundPrompt = true;
  }
  if (foundPrompt) {
    responseLines.push(lines[i]);
  }
}

console.log(responseLines.slice(0, 160).join('\n'));
