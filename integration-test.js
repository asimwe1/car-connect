#!/usr/bin/env node

// Production Backend Integration Test
// This script tests the CarHub frontend integration with the production backend

const API_BASE = 'https://carhubconnect.onrender.com/api';
const WS_URL = 'wss://carhubconnect.onrender.com/messages';

console.log('🚀 Testing CarHub Production Backend Integration\n');

async function testAPI() {
  console.log('📡 Testing API Endpoints...');
  
  const tests = [
    {
      name: 'Health Check',
      url: `${API_BASE.replace('/api', '')}/health`,
      method: 'GET'
    },
    {
      name: 'Cars List (Page 1)',
      url: `${API_BASE}/cars?page=1&limit=5`,
      method: 'GET'
    },
    {
      name: 'Cars Search',
      url: `${API_BASE}/cars?q=toyota&page=1&limit=3`,
      method: 'GET'
    },
    {
      name: 'Cars Filter by Make',
      url: `${API_BASE}/cars?make=toyota&page=1&limit=3`,
      method: 'GET'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`  ⏳ ${test.name}...`);
      const response = await fetch(test.url, { method: test.method });
      const data = await response.json();
      
      if (response.ok) {
        console.log(`  ✅ ${test.name} - OK (${response.status})`);
        
        // Show data structure for cars endpoints
        if (test.name.includes('Cars') && data.data && data.data.items) {
          console.log(`     📊 Found ${data.data.total} cars, showing ${data.data.items.length} items`);
          console.log(`     📄 Page ${data.data.page} of ${data.data.totalPages}`);
        } else if (data.status) {
          console.log(`     📊 Status: ${data.status}`);
        }
      } else {
        console.log(`  ❌ ${test.name} - Failed (${response.status}): ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`  ❌ ${test.name} - Network Error: ${error.message}`);
    }
  }
}

async function testWebSocket() {
  console.log('\n🔌 Testing WebSocket Connection...');
  
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(WS_URL);
      let connected = false;
      
      const timeout = setTimeout(() => {
        if (!connected) {
          console.log('  ⏰ WebSocket connection timeout');
          ws.close();
          resolve(false);
        }
      }, 10000);
      
      ws.onopen = () => {
        connected = true;
        clearTimeout(timeout);
        console.log('  ✅ WebSocket Connected Successfully');
        
        // Send test authentication
        ws.send(JSON.stringify({
          type: 'auth',
          userId: 'test-user',
          token: 'test-token'
        }));
        
        setTimeout(() => {
          ws.close();
          resolve(true);
        }, 2000);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log(`  📨 Received notification: ${data.type} - ${data.title}`);
        } catch (e) {
          console.log(`  📨 Received message: ${event.data}`);
        }
      };
      
      ws.onclose = () => {
        console.log('  🔌 WebSocket connection closed');
        if (connected) {
          resolve(true);
        }
      };
      
      ws.onerror = (error) => {
        console.log(`  ❌ WebSocket Error: ${error.message || 'Connection failed'}`);
        clearTimeout(timeout);
        resolve(false);
      };
      
    } catch (error) {
      console.log(`  ❌ WebSocket Setup Error: ${error.message}`);
      resolve(false);
    }
  });
}

async function testAuthentication() {
  console.log('\n🔐 Testing Authentication Endpoints...');
  
  // Test with demo credentials from backend
  const loginTest = {
    phone: '+250793373953',
    password: 'carhub@1050'
  };
  
  try {
    console.log('  ⏳ Testing login with demo credentials...');
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginTest)
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`  ✅ Authentication - Login successful`);
      console.log(`     👤 User: ${data.user?.fullname} (${data.user?.role})`);
      return data.user;
    } else {
      console.log(`  ❌ Authentication - Login failed: ${data.message}`);
      return null;
    }
  } catch (error) {
    console.log(`  ❌ Authentication - Network error: ${error.message}`);
    return null;
  }
}

async function runTests() {
  const startTime = Date.now();
  
  // Test API endpoints
  await testAPI();
  
  // Test Authentication
  const user = await testAuthentication();
  
  // Test WebSocket
  const wsConnected = await testWebSocket();
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n📊 Integration Test Summary:');
  console.log(`   ⏱️  Duration: ${duration}s`);
  console.log(`   🌐 API Base: ${API_BASE}`);
  console.log(`   🔌 WebSocket: ${WS_URL}`);
  console.log(`   🔐 Auth Test: ${user ? '✅ Passed' : '❌ Failed'}`);
  console.log(`   🔌 WebSocket: ${wsConnected ? '✅ Connected' : '❌ Failed'}`);
  
  if (user && wsConnected) {
    console.log('\n🎉 All systems ready for production deployment!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Deploy to Vercel with production environment variables');
    console.log('   2. Set VITE_API_URL=https://carhubconnect.onrender.com/api');
    console.log('   3. Set VITE_WS_URL=wss://carhubconnect.onrender.com/notifications');
    console.log('   4. Verify deployment with real user testing');
  } else {
    console.log('\n⚠️  Some issues detected - check backend services');
  }
}

// Handle Node.js vs Browser environment
async function setupNodeEnvironment() {
  if (typeof window === 'undefined') {
    // Node.js environment - use dynamic imports for ES modules
    try {
      const { WebSocket } = await import('ws');
      global.WebSocket = WebSocket;
    } catch (e) {
      console.log('⚠️  WebSocket module not available, WebSocket tests will be skipped');
    }
    
    // Add fetch if not available
    if (typeof fetch === 'undefined') {
      try {
        const fetch = await import('node-fetch');
        global.fetch = fetch.default;
      } catch (e) {
        console.log('⚠️  node-fetch not available, using native fetch');
      }
    }
  }
}

setupNodeEnvironment().then(() => runTests()).catch(console.error);