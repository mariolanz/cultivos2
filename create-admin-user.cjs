const bcrypt = require('bcryptjs');
const https = require('https');

const SUPABASE_URL = 'https://operacion-supabase-torus.nxfws2.easypanel.host';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

async function createAdminUser() {
  // Generar hash para la contraseña 'admin123'
  const passwordHash = await bcrypt.hash('admin123', 10);
  
  const newUser = {
    id: '00000000-0000-0000-0000-000000000001',
    username: 'ADMIN',
    password_hash: passwordHash,
    roles: ['ADMINISTRADOR'],
    location_id: null,
    maintenance_location_ids: [],
    permissions: {
      log: true,
      setup: true,
      archive: true,
      batches: true,
      harvest: true,
      reports: true,
      expenses: true,
      schedule: true,
      settings: true,
      trimming: true,
      dashboard: true,
      pnoLibrary: true,
      aiDiagnosis: true,
      infographics: true,
      motherPlants: true,
      notifications: true,
      maintenanceReports: true,
      maintenanceCalendar: true
    }
  };

  const data = JSON.stringify(newUser);
  const url = new URL('/rest/v1/users', SUPABASE_URL);

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Prefer': 'return=representation'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Usuario ADMIN creado exitosamente');
          console.log('   Username: ADMIN');
          console.log('   Password: admin123');
          resolve(body);
        } else {
          console.error('❌ Error:', res.statusCode, body);
          reject(new Error(body));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

createAdminUser().catch(console.error);
