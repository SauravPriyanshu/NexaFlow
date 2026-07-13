require('dotenv').config();
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { userId: '6a4f5822a547c589a4a97c58', email: 'sauravpriyanshu21@gmail.com' },
  process.env.ACCESS_TOKEN_SECRET,
  { expiresIn: '1y' }
);

async function test() {
  const fetch = (await import('node-fetch')).default;
  const res = await fetch('http://localhost:5000/api/orgs', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  console.log('Orgs response:', JSON.stringify(data, null, 2));

  const projectsRes = await fetch('http://localhost:5000/api/projects/org/some-id', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const projectsData = await projectsRes.json();
  console.log('Projects response:', JSON.stringify(projectsData, null, 2));
}

test().catch(console.error);
