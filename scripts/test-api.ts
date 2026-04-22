
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/api';
const ADMIN_TOKEN = 'mock-admin-token';

async function runTest() {
  console.log('🧪 Starting API Verification Test...');

  try {
    // 1. Check Health
    console.log('\n--- 1. Health Check ---');
    try {
      const healthRes = await fetch(`${API_URL}/layout/home`); // Using home as a proxy for health
      if (healthRes.ok) {
        console.log('✅ Server is reachable (Status: ' + healthRes.status + ')');
      } else {
        console.error('❌ Server returned error: ' + healthRes.status);
      }
    } catch (e) {
      console.error('❌ Failed to connect to server:', e.message);
      process.exit(1);
    }

    // 2. Create a Question
    console.log('\n--- 2. Create Question (Admin) ---');
    const newQuestion = {
      category: 'Test Category',
      question_text: 'This is a test question from script ' + Date.now(),
      options: ['A', 'B', 'C', 'D'],
      correct_option_index: 0,
      explanation: 'Test explanation',
      is_free: true
    };

    const createRes = await fetch(`${API_URL}/practice/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      },
      body: JSON.stringify(newQuestion)
    });

    const createData = await createRes.json();
    if (createRes.ok && createData.success) {
      console.log('✅ Question created successfully!');
      console.log('   ID:', createData.data.id);
    } else {
      console.error('❌ Failed to create question:', createData);
    }

    // 3. Fetch Questions
    console.log('\n--- 3. Fetch Questions ---');
    const fetchRes = await fetch(`${API_URL}/practice/questions?admin=true`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });
    const fetchData = await fetchRes.json();
    
    if (fetchRes.ok && fetchData.success) {
      console.log(`✅ Fetched ${fetchData.data.length} questions successfully.`);
    } else {
      console.error('❌ Failed to fetch questions:', fetchData);
    }

  } catch (err) {
    console.error('❌ Unexpected error during test:', err);
  }
}

runTest();
