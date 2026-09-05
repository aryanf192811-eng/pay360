const http = require('http');

const token = process.argv[2];
const payslipId = '83972324-7e6d-4540-8b04-c9d38222785b';
const payrunId = 'e250cfa3-6403-4f12-b8ee-47470b348352';

function testPdf() {
  return new Promise((resolve) => {
    http.get(`http://localhost:4000/api/payslips/${payslipId}/pdf`, { headers: { 'Authorization': `Bearer ${token}` } }, (res) => {
      console.log('PDF Status:', res.statusCode);
      console.log('Content-Type:', res.headers['content-type']);
      let size = 0;
      res.on('data', c => size += c.length);
      res.on('end', () => {
        console.log('PDF Size (bytes):', size);
        resolve();
      });
    });
  });
}

function testSendEmails() {
  return new Promise((resolve) => {
    const req = http.request(`http://localhost:4000/api/payruns/${payrunId}/send-payslips`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }, (res) => {
      console.log('Send-Emails Status:', res.statusCode);
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        console.log('Send-Emails Response:', data);
        resolve();
      });
    });
    req.end();
  });
}

async function run() {
  await testPdf();
  await testSendEmails();
}

run();
