async function testAuth() {
  console.log('🧪 Starting Authentication API Tests...');

  const signupBody = {
    email: 'new-mp-' + Math.random().toString(36).substring(7) + '@assembly.gov',
    password: 'securePassword123',
    name: 'Honorable Representative Test',
    role: 'MP',
    districtId: '74-C'
  };

  try {
    // Test 1: Signup
    console.log('\nTesting Signup Endpoint...');
    const signupRes = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupBody)
    });
    
    const signupData = await signupRes.json();
    console.log('Signup Response Status:', signupRes.status);
    console.log('Signup Response Data:', JSON.stringify(signupData, null, 2));

    if (signupRes.status !== 201) {
      throw new Error('Signup failed');
    }

    // Test 2: Login with new credentials
    console.log('\nTesting Login with newly created user...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: signupBody.email,
        password: signupBody.password
      })
    });
    const loginData = await loginRes.json();
    console.log('Login Response Status:', loginRes.status);
    console.log('Login Response Data:', JSON.stringify(loginData, null, 2));

    if (loginRes.status !== 200) {
      throw new Error('Login with new user failed');
    }

    // Test 3: Login with wrong password
    console.log('\nTesting Login with wrong password...');
    const wrongLoginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: signupBody.email,
        password: 'wrongPassword'
      })
    });
    const wrongLoginData = await wrongLoginRes.json();
    console.log('Wrong Login Response Status:', wrongLoginRes.status);
    console.log('Wrong Login Response Data:', JSON.stringify(wrongLoginData, null, 2));

    if (wrongLoginRes.status !== 401) {
      throw new Error('Wrong password login did not return 401');
    }

    // Test 4: Seed MP login
    console.log('\nTesting Login with Seed MP account...');
    const seedMpLoginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mp@assembly.gov',
        password: 'password123'
      })
    });
    const seedMpLoginData = await seedMpLoginRes.json();
    console.log('Seed MP Login Response Status:', seedMpLoginRes.status);
    console.log('Seed MP Login Response Data:', JSON.stringify(seedMpLoginData, null, 2));

    if (seedMpLoginRes.status !== 200) {
      throw new Error('Seed MP login failed');
    }

    // Test 5: Seed Admin login
    console.log('\nTesting Login with Seed Admin account...');
    const seedAdminLoginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@assembly.gov',
        password: 'password123'
      })
    });
    const seedAdminLoginData = await seedAdminLoginRes.json();
    console.log('Seed Admin Login Response Status:', seedAdminLoginRes.status);
    console.log('Seed Admin Login Response Data:', JSON.stringify(seedAdminLoginData, null, 2));

    if (seedAdminLoginRes.status !== 200) {
      throw new Error('Seed Admin login failed');
    }

    console.log('\n🎉 All authentication tests passed successfully!');
  } catch (err) {
    console.error('\n❌ Authentication tests failed:', err.message);
  }
}

testAuth();
