const fs = require('fs');

(async () => {
  try {
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@lovelace.edu', password: 'SuperAdmin2026!' }),
    });
    if (!loginRes.ok) {
      const txt = await loginRes.text();
      throw new Error('Login failed: ' + loginRes.status + ' ' + txt);
    }
    const loginJson = await loginRes.json();
    const token = loginJson.accessToken;

    const fd = new FormData();
    fd.append('file', fs.createReadStream('scripts/test/import_sample.csv'));

    const previewRes = await fetch('http://localhost:3000/api/products/import/preview', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
      body: fd,
    });
    const previewJson = await previewRes.json();
    console.log(JSON.stringify(previewJson, null, 2));
  } catch (e) {
    console.error('Error:', e && e.message ? e.message : e);
    process.exit(1);
  }
})();
