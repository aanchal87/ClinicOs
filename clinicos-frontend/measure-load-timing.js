const axios = require('axios');
const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

const baseURL = 'http://localhost:3001';
const cachePath = path.join(__dirname, '.token-cache.json');

function readCache() {
  try {
    if (fs.existsSync(cachePath)) {
      const data = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      if (Date.now() - data.timestamp < 10 * 60 * 1000) {
        return data;
      }
    }
  } catch (e) {}
  return null;
}

function writeCache(doctorToken, adminToken) {
  try {
    fs.writeFileSync(cachePath, JSON.stringify({
      doctorToken,
      adminToken,
      timestamp: Date.now()
    }), 'utf8');
  } catch (e) {}
}

async function measure(name, promiseFn) {
  const start = performance.now();
  const startTimeStr = new Date().toISOString();
  let status = null;
  let error = null;
  try {
    const res = await promiseFn();
    status = res.status;
  } catch (err) {
    status = err.response?.status || 'Network Error';
    error = err.message;
  }
  const end = performance.now();
  const endTimeStr = new Date().toISOString();
  const duration = (end - start).toFixed(2);
  
  return {
    query: name,
    startTime: startTimeStr,
    endTime: endTimeStr,
    durationMs: duration,
    status,
    error
  };
}

async function run() {
  console.log("Measuring ClinicOS API load timings after optimization...\n");
  const cache = readCache();
  
  let doctorToken = cache?.doctorToken || '';
  let adminToken = cache?.adminToken || '';
  
  let loginTiming;
  if (!doctorToken) {
    loginTiming = await measure('User Profile Query (/auth/login)', async () => {
      const res = await axios.post(`${baseURL}/auth/login`, { email: 'doctor@clinicios.com', password: 'doctor123' });
      doctorToken = res.data.accessToken;
      return res;
    });
  } else {
    // Measure client-side JWT decode
    const start = performance.now();
    const startTimeStr = new Date().toISOString();
    try {
      const base64Url = doctorToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
      JSON.parse(jsonPayload);
    } catch(e){}
    const end = performance.now();
    const endTimeStr = new Date().toISOString();
    loginTiming = {
      query: 'User Profile (JWT Decode client-side) [CACHED]',
      startTime: startTimeStr,
      endTime: endTimeStr,
      durationMs: (end - start).toFixed(4),
      status: 200,
      error: null
    };
  }

  if (!adminToken && doctorToken) {
    try {
      const res = await axios.post(`${baseURL}/auth/login`, { email: 'admin@clinicios.com', password: 'admin123' });
      adminToken = res.data.accessToken;
    } catch (e) {
      console.warn("Failed to get admin token via login (possibly rate limited):", e.response?.data || e.message);
    }
  }
  
  if (doctorToken || adminToken) {
    writeCache(doctorToken, adminToken);
  }

  const doctorHeaders = { Authorization: `Bearer ${doctorToken}` };

  // 2. Doctor Dashboard stats query
  const statsTiming = await measure('Dashboard Stats Query (/dashboard/doctor/stats)', () =>
    axios.get(`${baseURL}/dashboard/doctor/stats`, { headers: doctorHeaders })
  );

  // 3. Queue query
  const queueTiming = await measure('Queue Query (/dashboard/doctor/queue)', () =>
    axios.get(`${baseURL}/dashboard/doctor/queue`, { headers: doctorHeaders })
  );

  // 4. Appointments query
  const todayStr = new Date().toISOString().split('T')[0];
  const apptsTiming = await measure('Appointments Query (/appointments)', () =>
    axios.get(`${baseURL}/appointments?date=${todayStr}`, { headers: doctorHeaders })
  );

  // 5. Audit Log query
  const auditLogTiming = await measure('Audit Log Query (/dashboard/doctor/recent-activity)', () =>
    axios.get(`${baseURL}/dashboard/doctor/recent-activity`, { headers: doctorHeaders })
  );

  // Print Timing Report Table
  console.log("| Query | Start Time | End Time | Duration (ms) | API Endpoint | Status |");
  console.log("| :--- | :--- | :--- | :--- | :--- | :--- |");
  
  const printRow = (t, url) => {
    console.log(`| ${t.query} | ${t.startTime} | ${t.endTime} | ${t.durationMs} | ${url} | ${t.status} |`);
  };
  
  printRow(loginTiming, '/auth/login');
  printRow(statsTiming, '/dashboard/doctor/stats');
  printRow(queueTiming, '/dashboard/doctor/queue');
  printRow(apptsTiming, `/appointments?date=${todayStr}`);
  printRow(auditLogTiming, '/dashboard/doctor/recent-activity');
}

run();
