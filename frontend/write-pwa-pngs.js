import fs from 'fs';
import path from 'path';

const pngHex = '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c63000100000500010d0a2db40000000049454e44ae426082';
const pngBuffer = Buffer.from(pngHex, 'hex');

const publicDir = './public';
const files = [
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-192.png',
  'icon-maskable-512.png'
];

files.forEach(file => {
  const filePath = path.join(publicDir, file);
  fs.writeFileSync(filePath, pngBuffer);
  console.log(`Successfully wrote ${file}`);
});
