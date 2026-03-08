import { CredentialsService } from '../src/services/credentials.service';

/**
 * Script to refresh credentials by validating them against the streaming API.
 * This can be run via cronjob.
 * 
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
async function main() {
  console.log('--- Starting Credential Refresh ---');
  
  try {
    const statusBefore = await CredentialsService.getCredentialsStatus();
    console.log(`Current Credentials: ${statusBefore.host || 'None'}`);
    console.log(`Expires At: ${statusBefore.expiresAt || 'N/A'}`);

    if (await CredentialsService.needsRefresh()) {
      console.log('Credentials need refresh. Fetching latest from API...');
      await CredentialsService.refreshCredentials();
      
      const statusAfter = await CredentialsService.getCredentialsStatus();
      console.log('Refresh successful.');
      console.log(`New Expiry: ${statusAfter.expiresAt}`);
    } else {
      console.log('Credentials are still valid and not near expiry. Skipping refresh.');
    }
  } catch (error) {
    console.error('Error during credential refresh:', error);
    process.exit(1);
  }

  console.log('--- Credential Refresh Finished ---');
  process.exit(0);
}

main();
