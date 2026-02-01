// Quick test script to verify server is running
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/api';

async function testServer() {
  console.log('🧪 Testing server endpoints...\n');
  
  // Test health endpoint
  try {
    console.log('1. Testing /api/health...');
    const healthRes = await fetch(`${API_URL}/health`);
    const healthData = await healthRes.json();
    console.log('✅ Health check:', healthData);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    console.error('   Make sure the server is running: npm run server');
    process.exit(1);
  }
  
  // Test register endpoint (should return validation error, not HTML)
  try {
    console.log('\n2. Testing /api/auth/register (empty body)...');
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const registerText = await registerRes.text();
    
    if (registerText.trim().startsWith('<!') || registerText.includes('<html')) {
      console.error('❌ Register endpoint returned HTML instead of JSON!');
      console.error('   Response:', registerText.substring(0, 200));
      console.error('   This means the route is not registered correctly.');
      process.exit(1);
    }
    
    try {
      const registerData = JSON.parse(registerText);
      console.log('✅ Register endpoint returns JSON:', registerData);
    } catch (e) {
      console.error('❌ Register endpoint response is not valid JSON:', registerText.substring(0, 200));
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Register endpoint test failed:', error.message);
    process.exit(1);
  }
  
  console.log('\n✅ All tests passed! Server is configured correctly.');
  console.log('   You can now try registering from the frontend.');
}

testServer();
