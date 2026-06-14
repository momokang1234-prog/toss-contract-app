const fs = require('fs');
const AdmZip = require('adm-zip');

try {
  const zip = new AdmZip('bossimclockedin.ait');
  zip.addLocalFile('app.json');
  zip.writeZip('bossimclockedin_fixed.ait');
  console.log('Fixed zip created.');
} catch (e) {
  console.error(e);
}
