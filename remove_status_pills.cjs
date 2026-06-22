const fs = require('fs');
const path = require('path');

const viewsDir = 'c:/Users/bleu/kp/frontend-reimburseku/src/views';

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

walk(viewsDir, (filePath) => {
    if (filePath.endsWith('.vue')) {
        let content = fs.readFileSync(filePath, 'utf-8');
        let lines = content.split('\n');
        let newLines = [];
        let inStatusPillBlock = false;
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            
            // If line contains .status-pill and is a single line CSS rule
            if (line.includes('.status-pill') && line.includes('{') && line.includes('}')) {
                continue;
            }
            
            // If line starts a multi-line rule
            if (line.includes('.status-pill') && line.includes('{') && !line.includes('}')) {
                inStatusPillBlock = true;
                continue;
            }
            
            if (inStatusPillBlock) {
                if (line.includes('}')) {
                    inStatusPillBlock = false;
                }
                continue;
            }
            
            // If line just has .status-pill without braces (like a selector group), skip it
            if (line.trim().startsWith('.status-pill')) {
                 if (line.includes('{')) {
                     inStatusPillBlock = true;
                 }
                 continue;
            }
            
            newLines.push(line);
        }
        
        let newContent = newLines.join('\n');
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf-8');
            console.log('Updated', filePath);
        }
    }
});
