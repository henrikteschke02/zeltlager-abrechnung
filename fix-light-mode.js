const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'components');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace text-white
  content = content.replace(/\btext-white\b(?!\/)/g, 'text-[#4c503d] dark:text-white');
  
  // Replace text-white/XX
  content = content.replace(/\btext-white\/(\d+)\b/g, 'text-[#4c503d]/$1 dark:text-white/$1');

  // Replace text-[#E5E4DE]
  content = content.replace(/\btext-\[#E5E4DE\]\b(?!\/)/g, 'text-[#4c503d] dark:text-[#E5E4DE]');

  // Replace text-[#E5E4DE]/XX
  content = content.replace(/\btext-\[#E5E4DE\]\/(\d+)\b/g, 'text-[#4c503d]/$1 dark:text-[#E5E4DE]/$1');

  // Replace border-white/XX -> border-black/10 dark:border-white/XX
  content = content.replace(/\bborder-white\/(\d+)\b/g, 'border-black/10 dark:border-white/$1');

  // Specific fix for admin backgrounds which force dark mode:
  content = content.replace(/\bbg-\[#4c503d\]\s+(?:text-white|text-\[#4c503d\]\s+dark:text-white)\b/g, 'bg-background text-foreground dark:bg-[#4c503d] dark:text-white');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

walkDir(directoryPath);
