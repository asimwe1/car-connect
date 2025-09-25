// Production Integration Test
// Run this to verify backend connectivity

const API_BASE = 'https://carhubconnect.onrender.com/api';
const WS_URL = 'wss://carhubconnect.onrender.com/notifications';

async function testAPI() {
  console.log('🧪 Testing API Integration...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing API Health...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    if (healthResponse.ok) {
      console.log('✅ API Health: OK');
    } else {
      console.log('❌ API Health: Failed');
    }
  } catch (error) {
    console.log('❌ API Health: Connection failed');
  }

  try {
    // Test cars endpoint
    console.log('2. Testing Cars Endpoint...');
    const carsResponse = await fetch(`${API_BASE}/cars`);
    if (carsResponse.ok) {
      const carsData = await carsResponse.json();
      console.log(`✅ Cars Endpoint: OK (${carsData.data?.items?.length || 0} cars found)`);
    } else {
      console.log('❌ Cars Endpoint: Failed');
    }
  } catch (error) {
    console.log('❌ Cars Endpoint: Connection failed');
  }

  try {
    // Test authentication
    console.log('3. Testing Authentication...');
    const authResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '+250788881400',
        password: 'carhub@1050'
      })
    });
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log(`✅ Authentication: OK (User: ${authData.user?.fullname})`);
    } else {
      console.log('❌ Authentication: Failed');
    }
  } catch (error) {
    console.log('❌ Authentication: Connection failed');
  }
}

function testWebSocket() {
  console.log('\n🔌 Testing WebSocket Integration...\n');
  
  try {
    const ws = new WebSocket(WS_URL);
    
    ws.onopen = () => {
      console.log('✅ WebSocket: Connected successfully');
      setTimeout(() => ws.close(), 2000);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(`✅ WebSocket Message: ${data.title || 'Notification received'}`);
      } catch (error) {
        console.log('✅ WebSocket Message: Received (parsing failed)');
      }
    };
    
    ws.onerror = (error) => {
      console.log('❌ WebSocket: Connection failed');
    };
    
    ws.onclose = () => {
      console.log('🔌 WebSocket: Connection closed');
    };
    
  } catch (error) {
    console.log('❌ WebSocket: Failed to initialize');
  }
}

// Run tests
console.log('🚀 CarHub Production Integration Test\n');
console.log(`API Base: ${API_BASE}`);
console.log(`WebSocket: ${WS_URL}\n`);

testAPI().then(() => {
  testWebSocket();
  
  setTimeout(() => {
    console.log('\n✅ Integration test completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Deploy frontend with production environment variables');
    console.log('2. Update CLIENT_URL in backend to your domain');
    console.log('3. Test authentication and WebSocket in browser');
    console.log('4. Monitor logs for any issues');
  }, 5000);
}).catch(console.error);
