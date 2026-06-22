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
        let newContent = content.replace(/<div class="page-header">\s*<h1 class="page-title">.*?<\/h1>\s*<\/div>/g, '');
        newContent = newContent.replace(/<h1 class="page-title">.*?<\/h1>/g, '');
        
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf-8');
            console.log('Updated', filePath);
        }
    }
});
