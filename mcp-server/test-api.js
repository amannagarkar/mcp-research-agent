require('dotenv').config();

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

console.log('API Key present:', !!apiKey);
console.log('API Key length:', apiKey?.length);
console.log('Model:', model);

const body = {
  model,
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Say hello' }
  ],
  max_tokens: 100,
  temperature: 0.0,
};

fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  body: JSON.stringify(body),
})
.then(res => {
  console.log('Response status:', res.status);
  console.log('Response headers:', Object.fromEntries(res.headers));
  return res.json();
})
.then(data => {
  console.log('Response data:', JSON.stringify(data, null, 2));
})
.catch(err => {
  console.error('Error:', err.message);
});
