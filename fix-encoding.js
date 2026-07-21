const fs = require('fs');

function processFile(source, dest, isAdmin) {
  let content = fs.readFileSync(source, 'utf8');
  content = content.replace(/GrillItem/g, 'BroetchenItem')
                   .replace(/GrillOrder/g, 'BroetchenOrder')
                   .replace(/grill_orders/g, 'broetchen_buchungen')
                   .replace(/grill_item_id/g, 'item_id')
                   .replace(/grill_items/g, 'broetchen_items')
                   .replace(/Grillfleisch Verwaltung/g, 'Brötchen Verwaltung')
                   .replace(/AdminGrillDashboard/g, 'AdminBroetchenDashboard')
                   .replace(/CamperGrillDashboard/g, 'CamperBroetchenDashboard')
                   .replace(/Grill-Deckel/g, 'Brötchen-Deckel')
                   .replace(/\/images\/grill\//g, '/images/broetchen/')
                   .replace(/Was grillst du\?/g, 'Welche Brötchen möchtest du?')
                   .replace(/\/images\/steak\.png/g, '/images/broetchen/default.png');
  
  if (isAdmin) {
    content = content.replace(/Fleisch/g, 'Brötchen');
    content = content.replace(/const AVAILABLE_IMAGES = \[[\s\S]*?\]/, 'const AVAILABLE_IMAGES = [\n  "default.png"\n]');
    content = content.replace(/🥩/g, '🥯');
  } else {
    content = content.replace(/🔥/g, '🥯');
    content = content.replace(/<Flame/g, '<Croissant');
    content = content.replace(/import \{ Flame,/g, 'import { Croissant,');
  }

  fs.writeFileSync(dest, content, 'utf8');
}

processFile('components/admin-grill-dashboard.tsx', 'components/admin-broetchen-dashboard.tsx', true);
processFile('components/camper-grill-dashboard.tsx', 'components/camper-broetchen-dashboard.tsx', false);
