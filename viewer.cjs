const fs = require('fs');
let html = '<html><body style="display:flex; flex-wrap:wrap; gap:16px;">';
for(let i=1; i<=7; i++) {
  const b64 = fs.readFileSync(`public/screenshots/real-step${i}.png`).toString('base64');
  html += `<div><h3>Step ${i}</h3><img src="data:image/png;base64,${b64}" width="195" style="border:1px solid #ccc"/></div>`;
}
html += '</body></html>';
fs.writeFileSync('public/screenshots/viewer.html', html);
