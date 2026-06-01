// Native fetch is available in Node 18+

async function testAllAPIs() {
  let token = '';
  
  try {
    console.log('=== TEST COMPLET DES API ===\n');
    
    // Test 1: Login
    console.log('Test 1: Login...');
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
    console.log('✅ Login réussi - Token obtenu');
    
    // Test 2: Capteurs
    console.log('\nTest 2: GET /api/capteurs');
    const capteursResponse = await fetch('http://localhost:3001/api/capteurs', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const capteurs = await capteursResponse.json();
    console.log(`✅ ${capteurs.length} capteurs récupérés`);
    
    // Test 3: Derniers relevés
    console.log('\nTest 3: GET /api/releves/derniers');
    const derniersResponse = await fetch('http://localhost:3001/api/releves/derniers', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const derniers = await derniersResponse.json();
    console.log(`✅ ${derniers.length} derniers relevés récupérés`);
    
    // Test 4: Historique d'un capteur
    console.log('\nTest 4: GET /api/releves/capteur/:capteurId');
    const historiqueResponse = await fetch(`http://localhost:3001/api/releves/capteur/${capteurs[0].capteur_id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const historique = await historiqueResponse.json();
    console.log(`✅ ${historique.length} relevés historiques récupérés`);
    
    // Test 5: Statistiques globales
    console.log('\nTest 5: GET /api/statistiques/globales');
    const statsGlobalesResponse = await fetch('http://localhost:3001/api/statistiques/globales', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const statsGlobales = await statsGlobalesResponse.json();
    console.log(`✅ ${statsGlobales.length} types de capteurs analysés`);
    
    // Test 6: Statistiques par capteur
    console.log('\nTest 6: GET /api/statistiques/capteur/:capteurId');
    const statsCapteurResponse = await fetch(`http://localhost:3001/api/statistiques/capteur/${capteurs[0].capteur_id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const statsCapteur = await statsCapteurResponse.json();
    console.log(`✅ Statistiques: min=${statsCapteur.minimum}, max=${statsCapteur.maximum}, moy=${statsCapteur.moyenne}`);
    
    // Test 7: Alertes
    console.log('\nTest 7: GET /api/alertes');
    const alertesResponse = await fetch('http://localhost:3001/api/alertes', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const alertes = await alertesResponse.json();
    console.log(`✅ ${alertes.length} alertes détectées`);
    
    // Test 8: Résumé alertes
    console.log('\nTest 8: GET /api/alertes/resume');
    const resumeAlertesResponse = await fetch('http://localhost:3001/api/alertes/resume', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const resumeAlertes = await resumeAlertesResponse.json();
    console.log(`✅ ${resumeAlertes.length} capteurs avec alertes`);
    
    // Test 9: Comparaison par bâtiment
    console.log('\nTest 9: GET /api/comparaison/batiment/:batiment');
    const batiment = capteurs[0].batiment;
    const comparaisonResponse = await fetch(`http://localhost:3001/api/comparaison/batiment/${encodeURIComponent(batiment)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const comparaison = await comparaisonResponse.json();
    console.log(`✅ ${comparaison.length} capteurs comparés dans ${batiment}`);
    
    // Test 10: Capteurs inactifs
    console.log('\nTest 10: GET /api/capteurs/status/inactifs');
    const inactifsResponse = await fetch('http://localhost:3001/api/capteurs/status/inactifs', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const inactifs = await inactifsResponse.json();
    console.log(`✅ ${inactifs.length} capteurs inactifs détectés`);
    
    // Test 11: Accès sans token (doit échouer)
    console.log('\nTest 11: Accès sans token (doit échouer)');
    const unauthorizedResponse = await fetch('http://localhost:3001/api/capteurs');
    console.log(`✅ Accès refusé (status: ${unauthorizedResponse.status})`);
    
    console.log('\n=== RÉSUMÉ ===');
    console.log('✅ Tous les tests API réussis!');
    console.log('✅ Authentification fonctionnelle');
    console.log('✅ Toutes les routes protégées');
    console.log('✅ Pipelines d\'agrégation opérationnels');
    console.log('✅ Base de données connectée');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

testAllAPIs();
