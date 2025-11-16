#!/usr/bin/env tsx
/**
 * Test API connection to diagnose issues
 */

const PBS_API_BASE_URL = 'https://data-api.health.gov.au/pbs/api/v3';
const PBS_API_SUBSCRIPTION_KEY = '2384af7c667342ceb5a736fe29f1dc6b';

const testConnection = async () => {
  const endpoint = '/schedules';
  const url = `${PBS_API_BASE_URL}${endpoint}?limit=1`;
  
  console.log('Testing API connection...');
  console.log('URL:', url);
  console.log('Subscription Key:', PBS_API_SUBSCRIPTION_KEY);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Ocp-Apim-Subscription-Key': PBS_API_SUBSCRIPTION_KEY,
        'Accept': 'application/json'
      }
    });
    
    console.log('\nResponse Status:', response.status, response.statusText);
    console.log('Response Headers:');
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });
    
    const text = await response.text();
    console.log('\nResponse Body (first 1000 chars):');
    console.log(text.substring(0, 1000));
    
    if (response.ok) {
      try {
        const json = JSON.parse(text);
        console.log('\nParsed JSON structure:');
        if (Array.isArray(json)) {
          console.log(`Array with ${json.length} items`);
          if (json.length > 0) {
            console.log('First item keys:', Object.keys(json[0]));
          }
        } else {
          console.log('Response keys:', Object.keys(json));
        }
      } catch (e) {
        console.log('Could not parse as JSON');
      }
    }
  } catch (error) {
    console.error('\nError details:');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    
    // Try to get more details about the network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('\nThis appears to be a network/DNS issue.');
      console.error('Possible causes:');
      console.error('  - DNS resolution failure');
      console.error('  - Network connectivity issue');
      console.error('  - SSL/TLS certificate issue');
      console.error('  - Firewall blocking the connection');
    }
  }
};

void testConnection();

