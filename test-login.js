/**
 * Simple Test Script for FastAPI Backend
 * Open browser console and run: testLogin()
 */

console.log('🧪 Test Script Loaded');

window.testLogin = async function() {
  console.log('🧪 Testing login...');
  
  try {
    const testEmail = 'admin@college.edu';
    const testPassword = 'admin123';
    
    console.log('📝 Credentials:');
    console.log('  Email:', testEmail);
    console.log('  Password:', testPassword);
    
    const apiUrl = `${window.location.origin}/login`;
    console.log('🔗 API URL:', apiUrl);
    
    const requestBody = {
      email: testEmail,
      password: testPassword
    };
    console.log('📤 Request body:', requestBody);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📥 Response received:');
    console.log('  Status:', response.status, response.statusText);
    console.log('  Content-Type:', response.headers.get('content-type'));
    
    const data = await response.json();
    console.log('📦 Response data:', data);
    
    if (response.ok) {
      console.log('✅ SUCCESS! User:', data.name, 'Role:', data.role);
    } else {
      console.log('❌ FAILED! Error:', data.detail);
    }
    
    return data;
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
    console.error('Stack:', error.stack);
    return null;
  }
};

console.log('✅ Test commands available:');
console.log('   testLogin() - Test admin login');

// Also add test for database
window.testDatabase = async function() {
  console.log('🧪 Checking backend health...');
  
  try {
    const response = await fetch(`${window.location.origin}/`);
    const data = await response.json();
    console.log('✅ Backend response:', data);
    return data;
  } catch (error) {
    console.error('❌ Backend error:', error.message);
    return null;
  }
};

console.log('   testDatabase() - Check backend health');
