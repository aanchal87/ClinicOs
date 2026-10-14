const axios = require('axios');

const baseURL = 'http://localhost:3001';

async function testRole(email, password, dashboardPath, expectSuccess = true) {
  console.log(`\n--- Testing credentials: ${email} -> ${dashboardPath} ---`);
  
  // 1. Login
  let accessToken = '';
  let cookies = [];
  try {
    const loginRes = await axios.post(`${baseURL}/auth/login`, { email, password });
    accessToken = loginRes.data.accessToken;
    console.log(`[OK] Login succeeded for ${email}. Resolved role in token payload:`, loginRes.data.user.role);
    if (loginRes.headers['set-cookie']) {
      cookies = loginRes.headers['set-cookie'];
      console.log(`[OK] Received set-cookie headers.`);
    }
  } catch (err) {
    console.error(`[FAIL] Login failed for ${email}:`, err.response?.data || err.message);
    return;
  }

  // 2. Fetch Dashboard
  try {
    const dashRes = await axios.get(`${baseURL}${dashboardPath}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    if (expectSuccess) {
      console.log(`[PASS] Fetch ${dashboardPath} succeeded with 200.`);
      console.log(`Stats returned:`, JSON.stringify(dashRes.data.stats || dashRes.data.systemHealth || {}));
    } else {
      console.error(`[FAIL] Fetch ${dashboardPath} succeeded but expected it to fail!`);
    }
  } catch (err) {
    const status = err.response?.status;
    const body = err.response?.data;
    if (!expectSuccess && (status === 403 || status === 401)) {
      console.log(`[PASS] Fetch ${dashboardPath} blocked with status ${status} as expected. Message:`, body?.message);
    } else {
      console.error(`[FAIL] Fetch ${dashboardPath} failed. Status: ${status}. Response:`, JSON.stringify(body || err.message));
    }
  }
}

async function run() {
  // Test Doctor
  await testRole('doctor@clinicios.com', 'doctor123', '/dashboard/doctor', true);
  
  // Test Receptionist
  await testRole('receptionist@clinicios.com', 'receptionist123', '/dashboard/receptionist', true);
  
  // Test Super Admin
  await testRole('admin@clinicios.com', 'admin123', '/dashboard/superadmin', true);
  
  // Test Unauthorized Access (Receptionist hitting doctor dashboard)
  await testRole('receptionist@clinicios.com', 'receptionist123', '/dashboard/doctor', false);
}

run();
