const fs = require('fs');
let code = fs.readFileSync('./src/pages/employer/ContractFormPage.tsx', 'utf8');
code = code.replace('<Top title="근로계약서 작성" />', '<Top title="" />');
fs.writeFileSync('./src/pages/employer/ContractFormPage.tsx', code);
