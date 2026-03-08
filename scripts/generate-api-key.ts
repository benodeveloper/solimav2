import { ApiKeyService } from '../src/services/api-key.service';

/**
 * Script to generate a new Public API Key.
 * Usage: npx tsx --env-file=.env scripts/generate-api-key.ts "Key Name"
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
async function main() {
  const name = process.argv[2] || 'Default API Key';
  
  console.log(`--- Generating API Key: "${name}" ---`);
  
  try {
    const apiKey = await ApiKeyService.createApiKey(name);
    
    console.log('API Key created successfully:');
    console.log('--------------------------------------------------');
    console.log(`ID:      ${apiKey.id}`);
    console.log(`Name:    ${apiKey.name}`);
    console.log(`Key:     ${apiKey.key}`);
    console.log('--------------------------------------------------');
    console.log('CRITICAL: Copy this key now, it cannot be recovered if lost.');
  } catch (error) {
    console.error('Error generating API key:', error);
    process.exit(1);
  }

  process.exit(0);
}

main();
