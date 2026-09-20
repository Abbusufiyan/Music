const fs = require('fs');

const content = fs.readFileSync('drive_dump.html', 'utf8');

console.log('Dump size:', content.length);

// Search for any string ending in .mp3, .wav, .m4a, .ogg, .mp4, .webm, .flac, .aac
const matches = [...content.matchAll(/([a-zA-Z0-9_\-\.\s()]+\.(?:mp3|wav|m4a|ogg|mp4|webm|flac|aac))/gi)];
console.log('Filename matches found:', matches.length);
matches.slice(0, 30).forEach(m => console.log(' ->', m[1]));

// Search for 33-char drive IDs in Javascript arrays
const driveIdMatches = [...content.matchAll(/["']([a-zA-Z0-9_-]{28,35})["']/g)];
const uniqueIds = new Set(driveIdMatches.map(m => m[1]));
console.log('Unique Drive IDs candidate count:', uniqueIds.size);
console.log('Sample IDs:', Array.from(uniqueIds).slice(0, 15));
