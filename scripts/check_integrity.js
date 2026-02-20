const fs = require('fs');
const path = require('path');

const etymologies = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/etymologies.json'), 'utf-8'));
const words = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/words.json'), 'utf-8'));

const etymologyIds = new Set(etymologies.map(e => e.id));
const errors = [];

words.forEach(word => {
    if (!etymologyIds.has(word.etymology_id)) {
        errors.push(`Invalid etymology_id: ${word.etymology_id} in word: ${word.id} (${word.word})`);
    }
});

fs.writeFileSync('integrity_errors.txt', errors.join('\n'));
console.log(`Found ${errors.length} errors. written to integrity_errors.txt`);
