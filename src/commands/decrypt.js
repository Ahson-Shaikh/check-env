const { decryptFile } = require('../utils/crypto');
const chalk = require('chalk');
const path = require('path');
const readline = require('readline');

/**
 * Prompt for decryption key
 * @returns {Promise<string>} - Entered key
 */
function promptForKey() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question('Enter decryption key: ', (key) => {
      rl.close();
      resolve(key);
    });
  });
}

/**
 * Decrypt an encrypted environment file
 * @param {string} file - Encrypted file to decrypt
 * @param {Object} options - Command options
 */
async function decrypt(file, options) {
  try {
    // Get decryption key
    const key = options.key || await promptForKey();
    
    if (!key) {
      console.error(chalk.red('Error: Decryption key is required'));
      process.exit(1);
    }
    
    // Determine output path (default is the filename without .enc extension)
    let outputPath = options.output;
    if (!outputPath) {
      const basename = path.basename(file, '.enc');
      const dirname = path.dirname(file);
      outputPath = path.join(dirname, basename);
    }
    
    // Decrypt the file
    console.log(chalk.blue(`Decrypting file: ${file}`));
    try {
      const outPath = decryptFile(file, key, outputPath);
      console.log(chalk.green(`✓ File decrypted successfully: ${outPath}`));
    } catch (error) {
      console.error(chalk.red(`Decryption failed: ${error.message}`));
      console.error(chalk.yellow('This may be due to an incorrect key or corrupted file.'));
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

module.exports = decrypt; 