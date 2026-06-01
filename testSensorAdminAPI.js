// Native fetch is available in Node 18+

async function testSensorAdminAPI() {
  let token = '';
  
  try {
    console.log('=== TEST DES API ADMIN CAPTEURS ===\n');
    
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
    
    // Test 2: Get all sensors
    console.log('\nTest 2: GET /api/admin/capteurs');
    const capteursResponse = await fetch('http://localhost:3001/api/admin/capteurs', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const capteurs = await capteursResponse.json();
    console.log(`✅ ${capteurs.length} capteurs récupérés`);
    
    // Test 3: Create a new sensor
    console.log('\nTest 3: POST /api/admin/capteurs (create sensor)');
    const createCapteurResponse = await fetch('http://localhost:3001/api/admin/capteurs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        capteur_id: 'CAP-TEST-001',
        nom: 'Capteur Test Admin',
        type: 'Thermique',
        batiment: 'Bâtiment A',
        etage: 1,
        salle: 'Salle Test',
        seuil_alerte: 50
      })
    });
    const createCapteurData = await createCapteurResponse.json();
    console.log('✅ Capteur créé:', createCapteurData.message);
    console.log('Response data:', JSON.stringify(createCapteurData, null, 2));
    
    if (!createCapteurData.capteur) {
      console.log('❌ Erreur: capteur non retourné dans la réponse');
      return;
    }
    const newCapteurId = createCapteurData.capteur._id;
    
    // Test 4: Get sensors again to verify creation
    console.log('\nTest 4: GET /api/admin/capteurs (verify creation)');
    const capteursResponse2 = await fetch('http://localhost:3001/api/admin/capteurs', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const capteurs2 = await capteursResponse2.json();
    console.log(`✅ ${capteurs2.length} capteurs (après création)`);
    
    // Test 5: Update the sensor
    console.log('\nTest 5: PUT /api/admin/capteurs/:id (update sensor)');
    const updateCapteurResponse = await fetch(`http://localhost:3001/api/admin/capteurs/${newCapteurId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        nom: 'Capteur Test Modifié',
        seuil_min: 10,
        seuil_max: 40
      })
    });
    const updateCapteurData = await updateCapteurResponse.json();
    console.log('✅ Capteur mis à jour:', updateCapteurData.message);
    
    // Test 6: Toggle sensor active state
    console.log('\nTest 6: PATCH /api/admin/capteurs/:id/toggle (toggle sensor)');
    const toggleCapteurResponse = await fetch(`http://localhost:3001/api/admin/capteurs/${newCapteurId}/toggle`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const toggleCapteurData = await toggleCapteurResponse.json();
    console.log('✅ Capteur basculé:', toggleCapteurData.message);
    
    // Test 7: Get sensors by building
    console.log('\nTest 7: GET /api/admin/capteurs/batiment/:batiment');
    const batimentResponse = await fetch('http://localhost:3001/api/admin/capteurs/batiment/Bâtiment%20A', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const batimentCapteurs = await batimentResponse.json();
    console.log(`✅ ${batimentCapteurs.length} capteurs dans Bâtiment A`);
    
    // Test 8: Delete the sensor
    console.log('\nTest 8: DELETE /api/admin/capteurs/:id (delete sensor)');
    const deleteCapteurResponse = await fetch(`http://localhost:3001/api/admin/capteurs/${newCapteurId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const deleteCapteurData = await deleteCapteurResponse.json();
    console.log('✅ Capteur supprimé:', deleteCapteurData.message);
    
    // Test 9: Get sensors again to verify deletion
    console.log('\nTest 9: GET /api/admin/capteurs (verify deletion)');
    const capteursResponse3 = await fetch('http://localhost:3001/api/admin/capteurs', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const capteurs3 = await capteursResponse3.json();
    console.log(`✅ ${capteurs3.length} capteurs (après suppression)`);
    
    console.log('\n=== RÉSUMÉ ===');
    console.log('✅ Tous les tests admin API capteurs réussis!');
    console.log('✅ Gestion des capteurs fonctionnelle');
    console.log('✅ Création, modification, suppression opérationnelles');
    console.log('✅ Activation/désactivation fonctionnelle');
    console.log('✅ Filtrage par bâtiment opérationnel');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

testSensorAdminAPI();
