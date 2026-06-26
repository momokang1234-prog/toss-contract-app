const https = require('https');
https.get('https://assets3.lottiefiles.com/packages/lf20_t24tpvcu.json', (res) => {
  console.log(res.statusCode);
});
