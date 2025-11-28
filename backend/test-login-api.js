// Test login API
const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user001@hcmut.edu.vn',
        password: '123456'
      })
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\nTest THANH CONG!');
      console.log('Token:', data.token);
      console.log('User:', data.user);
    } else {
      console.log('\nTest THAT BAI!');
      console.log('Message:', data.message);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testLogin();
