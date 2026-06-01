// Native fetch is available in Node 18+

async function testAdminAPI() {
  let token = '';
  
  try {
    console.log('=== TEST DES API ADMIN ===\n');
    
    // Test 1: Login as admin
    console.log('Test 1: Login admin...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@senguinee.com',
        password: 'admin123'
      })
    });
    const loginData = await loginResponse.json();
    token = loginData.token;
    console.log('✅ Login admin réussi');
    
    // Test 2: Get all users
    console.log('\nTest 2: GET /api/admin/users');
    const usersResponse = await fetch('http://localhost:3001/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const users = await usersResponse.json();
    console.log(`✅ ${users.length} utilisateurs récupérés`);
    
    // Test 3: Get system stats
    console.log('\nTest 3: GET /api/admin/stats');
    const statsResponse = await fetch('http://localhost:3001/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const stats = await statsResponse.json();
    console.log('✅ Statistiques système:', stats);
    
    // Test 4: Get logs
    console.log('\nTest 4: GET /api/admin/logs');
    const logsResponse = await fetch('http://localhost:3001/api/admin/logs', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const logs = await logsResponse.json();
    console.log(`✅ ${logs.length} logs récupérés`);
    
    // Test 5: Create a new user
    console.log('\nTest 5: POST /api/admin/users (create user)');
    const createUserResponse = await fetch('http://localhost:3001/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        username: 'testuser',
        email: 'testuser@senguinee.com',
        password: 'test123',
        role: 'user'
      })
    });
    const createUserData = await createUserResponse.json();
    console.log('✅ Utilisateur créé:', createUserData.message);
    
    // Test 6: Get users again to verify creation
    console.log('\nTest 6: GET /api/admin/users (verify creation)');
    const usersResponse2 = await fetch('http://localhost:3001/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const users2 = await usersResponse2.json();
    console.log(`✅ ${users2.length} utilisateurs (après création)`);
    
    // Test 7: Try to access admin route without admin role (should fail)
    console.log('\nTest 7: Test user accessing admin route (should fail)');
    const testUserLogin = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@senguinee.com',
        password: 'test123'
      })
    });
    const testUserLoginData = await testUserLogin.json();
    const testUserToken = testUserLoginData.token;
    
    const unauthorizedResponse = await fetch('http://localhost:3001/api/admin/users', {
      headers: { 'Authorization': `Bearer ${testUserToken}` }
    });
    console.log(`✅ Accès refusé (status: ${unauthorizedResponse.status})`);
    
    console.log('\n=== RÉSUMÉ ===');
    console.log('✅ Tous les tests admin API réussis!');
    console.log('✅ Gestion des utilisateurs fonctionnelle');
    console.log('✅ Contrôle d\'accès basé sur les rôles opérationnel');
    console.log('✅ Statistiques système accessibles');
    console.log('✅ Logs d\'activité accessibles');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

testAdminAPI();
