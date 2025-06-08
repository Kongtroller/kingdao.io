const fs = require('fs');
const path = require('path');

const sourcePath = path.join(process.cwd(), 'public', 'collections', 'wilder-world', '36073522002736318236441335305922097439592256555061637376927927329956085869960.png');
const targetPath = path.join(process.cwd(), 'public', 'collections', 'wilder-world', '37263806078148289478045292319502245359893571831903681984357324168914675299015.png');

// Create the directory if it doesn't exist
const dir = path.dirname(targetPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Delete target file if it exists
if (fs.existsSync(targetPath)) {
  fs.unlinkSync(targetPath);
}

// Copy the file
try {
  fs.copyFileSync(sourcePath, targetPath);
  console.log('Successfully copied placeholder image');
} catch (error) {
  console.error('Error copying file:', error);
} 