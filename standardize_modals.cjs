const fs = require('fs');

const files = [
  'c:/Users/bleu/kp/frontend-reimburseku/src/views/finance/ReimbursementView.vue',
  'c:/Users/bleu/kp/frontend-reimburseku/src/views/finance/KaryawanView.vue',
  'c:/Users/bleu/kp/frontend-reimburseku/src/views/admin/MetodeBayarView.vue',
  'c:/Users/bleu/kp/frontend-reimburseku/src/views/admin/KategoriView.vue',
  'c:/Users/bleu/kp/frontend-reimburseku/src/views/admin/KaryawanView.vue',
  'c:/Users/bleu/kp/frontend-reimburseku/src/views/admin/HakAksesView.vue',
  'c:/Users/bleu/kp/frontend-reimburseku/src/views/admin/DashboardView.vue'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf-8');
  
  // Replace HTML classes
  content = content.replace(/class="modal-content"/g, 'class="modal-panel"');
  content = content.replace(/class="modal-header"/g, 'class="modal-panel-header"');
  content = content.replace(/class="modal-body-scroll"/g, 'class="modal-panel-body"');
  content = content.replace(/class="modal-actions"/g, 'class="modal-panel-footer"');
  
  // Special cases for DashboardView (notif-modal)
  content = content.replace(/class="modal notif-modal"/g, 'class="modal-panel"');
  content = content.replace(/class="modal-header-notif"/g, 'class="modal-panel-header"');
  content = content.replace(/class="modal-body-notif"/g, 'class="modal-panel-body"');
  content = content.replace(/class="modal-footer-notif"/g, 'class="modal-panel-footer"');
  
  // Also strip the local CSS definitions for these
  let lines = content.split('\n');
  let newLines = [];
  let inModalCssBlock = false;
  
  for (let line of lines) {
    if (line.includes('.modal-overlay') || 
        line.includes('.modal-content') || 
        line.includes('.modal-header') ||
        line.includes('.modal-body-scroll') ||
        line.includes('.modal-actions') ||
        line.includes('.modal-header-icon') ||
        line.includes('.modal-header-sub') ||
        line.includes('.notif-modal') ||
        line.includes('.modal-header-notif') ||
        line.includes('.modal-body-notif') ||
        line.includes('.modal-footer-notif')) {
      
      if (line.includes('{') && line.includes('}')) {
        continue; // skip single line css
      }
      
      if (line.includes('{') && !line.includes('}')) {
        inModalCssBlock = true;
        continue;
      }
      
      if (line.trim().startsWith('.')) {
        if (line.includes('{')) inModalCssBlock = true;
        continue;
      }
    }
    
    if (inModalCssBlock) {
      if (line.includes('}')) {
        inModalCssBlock = false;
      }
      continue;
    }
    
    newLines.push(line);
  }
  
  fs.writeFileSync(file, newLines.join('\n'), 'utf-8');
  console.log('Standardized', file);
});
