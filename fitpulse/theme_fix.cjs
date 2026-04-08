const fs = require('fs');
const path = require('path');

const srcDir = 'c:\\Users\\profe\\OneDrive\\Desktop\\HawkAI\\fitpulse\\src';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

function processFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

    let original = fs.readFileSync(filePath, 'utf8');
    let content = original;

    // 1. Replace plain `text-white` with `text-theme-main`
    content = content.replace(/\btext-white\b/g, 'text-theme-main');
    
    // 2. Replace plain grayscale colors with `text-theme-muted`
    content = content.replace(/\btext-gray-[1-9]00\b/g, 'text-theme-muted');

    let lines = content.split('\n');
    lines = lines.map(line => {
        if (line.includes('bg-theme-primary') && line.includes('text-theme-main')) {
            return line.replace(/\btext-theme-main\b/g, 'text-on-primary');
        }
        return line;
    });
    content = lines.join('\n');

    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

walkDir(srcDir, processFile);

// Also Process index.css
const indexCssPath = path.join(srcDir, 'index.css');
if (fs.existsSync(indexCssPath)) {
    let css = fs.readFileSync(indexCssPath, 'utf8');
    
    // Add --on-primary variable
    if (!css.includes('--on-primary')) {
        css = css.replace(/--primary-glow: rgba\(255, 107, 0, 0\.3\);/g, '--primary-glow: rgba(255, 107, 0, 0.3);\n  --on-primary: #ffffff;');
        css = css.replace(/--primary-glow: rgba\(14, 165, 233, 0\.3\);/g, '--primary-glow: rgba(14, 165, 233, 0.3);\n  --on-primary: #ffffff;');
        css = css.replace(/--primary-glow: rgba\(255, 255, 255, 0\.1\);/g, '--primary-glow: rgba(255, 255, 255, 0.1);\n  --on-primary: #000000;');
    }

    if (!css.includes('.text-on-primary')) {
        css = css.replace(/\.text-theme-primary \{ color: var\(--primary\) !important; \}/g, '.text-theme-primary { color: var(--primary) !important; }\n  .text-on-primary { color: var(--on-primary) !important; }');
    }

    if (css !== fs.readFileSync(indexCssPath, 'utf8')) {
       fs.writeFileSync(indexCssPath, css, 'utf8');
       console.log('Updated index.css');
    }
}

console.log('Done mapping static colors to dynamic theme variables.');
