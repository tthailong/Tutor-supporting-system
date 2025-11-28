// Test login API voi password sai
const testLoginFail = async () => {
  console.log('Test 1: Password sai');
  try {
    const response = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user001@hcmut.edu.vn',
        password: 'wrongpassword'
      })
    });

    const data = await response.json();
    console.log('Response:', data);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\nTest 2: Email khong ton tai');
  try {
    const response = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'notexist@hcmut.edu.vn',
        password: '123456'
      })
    });

    const data = await response.json();
    console.log('Response:', data);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testLoginFail();
