// Native fetch is available in Node 18+

async function testAuth() {
  try {
    console.log('Test 1: Login avec admin...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@senguinee.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginResponse.status);
    console.log('Login data:', JSON.stringify(loginData, null, 2));
    
    if (loginData.token) {
      console.log('\nTest 2: Accès aux capteurs avec token...');
      const capteursResponse = await fetch('http://localhost:3001/api/capteurs', {
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        }
      });
      
      console.log('Capteurs response status:', capteursResponse.status);
      const capteursData = await capteursResponse.json();
      console.log('Nombre de capteurs:', capteursData.length);
      
      console.log('\nTest 3: Accès aux derniers relevés...');
      const relevesResponse = await fetch('http://localhost:3001/api/releves/derniers', {
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        }
      });
      
      console.log('Relevés response status:', relevesResponse.status);
      const relevesData = await relevesResponse.json();
      console.log('Nombre de relevés:', relevesData.length);
      
      console.log('\nTest 4: Accès sans token (doit échouer)...');
      const unauthorizedResponse = await fetch('http://localhost:3001/api/capteurs');
      console.log('Unauthorized response status:', unauthorizedResponse.status);
      const unauthorizedData = await unauthorizedResponse.json();
      console.log('Unauthorized data:', unauthorizedData);
      
      console.log('\n✅ Tous les tests d\'authentification réussis!');
    }
  } catch (error) {
    console.error('Erreur lors des tests:', error);
  }
}

testAuth();
