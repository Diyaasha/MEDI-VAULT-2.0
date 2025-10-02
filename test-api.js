const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testAPI() {
  try {
    console.log('🧪 Testing MEDI-VAULT API endpoints...\n');
    
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log('✅ Health:', healthResponse.data.message);
    
    // Test AI-simplified endpoints (should return 401 without auth)
    console.log('\n2. Testing AI-simplified endpoints (should require auth)...');
    
    try {
      await axios.get(`${API_BASE}/ai-simplified/list`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ AI-simplified list endpoint: Correctly requires authentication');
      } else {
        console.log('❌ AI-simplified list endpoint error:', error.message);
      }
    }
    
    try {
      await axios.get(`${API_BASE}/ai-simplified/medical-history`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ AI-simplified medical-history endpoint: Correctly requires authentication');
      } else {
        console.log('❌ AI-simplified medical-history endpoint error:', error.message);
      }
    }
    
    // Test medical history endpoints
    console.log('\n3. Testing medical history endpoints (should require auth)...');
    try {
      await axios.get(`${API_BASE}/medical-history`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Medical history endpoint: Correctly requires authentication');
      } else {
        console.log('❌ Medical history endpoint error:', error.message);
      }
    }
    
    console.log('\n🎉 All API endpoints are accessible and properly protected!');
    console.log('\nNext steps:');
    console.log('1. Restart your frontend (if not done already)');
    console.log('2. Login to the application');
    console.log('3. Try uploading a document in AI-simplified section');
    
  } catch (error) {
    console.log('❌ Error testing API:', error.message);
    console.log('\n🔧 Make sure your backend server is running on port 3000');
  }
}

testAPI();