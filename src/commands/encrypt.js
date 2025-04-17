const { encryptFile } = require('../utils/crypto');
const chalk = require('chalk');
const path = require('path');
const readline = require('readline');

/**
 * Prompt for encryption key
 * @returns {Promise<string>} - Entered key
 */
function promptForKey() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question('Enter encryption key: ', (key) => {
      rl.close();
      resolve(key);
    });
  });
}

/**
 * Encrypt an environment file
 * @param {string} file - Environment file to encrypt
 * @param {Object} options - Command options
 */
async function encrypt(file, options) {
  try {
    // Get encryption key
    const key = options.key || await promptForKey();
    
    if (!key || key.length < 8) {
      console.error(chalk.red('Error: Encryption key must be at least 8 characters long'));
      process.exit(1);
    }
    
    // Determine output path
    const outputPath = options.output || `${file}.enc`;
    
    // Encrypt the file
    console.log(chalk.blue(`Encrypting file: ${file}`));
    const outPath = encryptFile(file, key, outputPath);
    
    console.log(chalk.green(`✓ File encrypted successfully: ${outPath}`));
    console.log(chalk.blue('To decrypt this file, use:'));
    console.log(chalk.blue(`  env-check decrypt ${outPath}`));
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

module.exports = encrypt; 