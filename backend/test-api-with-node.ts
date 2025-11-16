#!/usr/bin/env tsx
/**
 * Test API with Node.js https module to handle SSL issues
 */

import https from 'https';

const PBS_API_BASE_URL = 'https://data-api.health.gov.au/pbs/api/v3';
const PBS_API_SUBSCRIPTION_KEY = '2384af7c667342ceb5a736fe29f1dc6b';

// For testing only - allow self-signed certificates
// In production, ensure proper SSL certificates are configured
const agent = new https.Agent({
  rejectUnauthorized: false // Only for testing - NOT for production!
});

const testWithHttps = async () => {
  const endpoint = '/schedules';
  const fullUrl = `${PBS_API_BASE_URL}${endpoint}?limit=2`;
  
  console.log('Testing API with Node.js https module...');
  console.log('URL:', fullUrl);
  
  return new Promise<void>((resolve, reject) => {
    const urlObj = new URL(fullUrl);
    const req = https.request(
      {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'Subscription-Key': PBS_API_SUBSCRIPTION_KEY,
          'Accept': 'application/json'
        },
        agent
      },
      (res) => {
        console.log('\nResponse Status:', res.statusCode, res.statusMessage);
        console.log('Response Headers:');
        Object.entries(res.headers).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log('\nResponse Body (first 1000 chars):');
          console.log(data.substring(0, 1000));
          
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const json = JSON.parse(data);
              console.log('\n✓ Successfully parsed JSON');
              if (Array.isArray(json)) {
                console.log(`✓ Array with ${json.length} items`);
                if (json.length > 0) {
                  console.log('First item keys:', Object.keys(json[0]));
                  console.log('\nFirst item sample:');
                  console.log(JSON.stringify(json[0], null, 2).substring(0, 500));
                }
              } else {
                console.log('Response keys:', Object.keys(json));
              }
              resolve();
            } catch (e) {
              console.error('Failed to parse JSON:', e);
              reject(e);
            }
          } else {
            console.error('Request failed with status:', res.statusCode);
            reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          }
        });
      }
    );
    
    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });
    
    req.end();
  });
};

void testWithHttps().catch(console.error);

