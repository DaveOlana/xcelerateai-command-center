import http from 'http';

http.get('http://localhost:5173/', (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('BODY LENGTH:', data.length);
  });
}).on('error', (err) => {
  console.error('ERROR OBJECT:', err);
});
