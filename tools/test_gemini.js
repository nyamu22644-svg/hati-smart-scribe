import 'dotenv/config';
import fetch from 'node-fetch';

const key = process.env.GEMINI_API_KEY;
console.log('Masked GEMINI key:', key ? `${key.slice(0,6)}...` : 'MISSING');
if (!key) process.exit(1);

const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${key}`;

(async function(){
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents:[{ parts:[{ text: 'Health API key test' }] }] })
    });

    console.log('HTTP Status:', res.status);
    const text = await res.text();
    console.log('Response body:', text);
  } catch (err) {
    console.error('Request error:', err);
    process.exit(2);
  }
})();
