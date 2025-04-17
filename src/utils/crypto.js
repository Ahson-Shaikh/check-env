const CryptoJS = require('crypto-js');
const fs = require('fs-extra');
const { parseEnvFile, saveEnvFile } = require('./parser');
const path = require('path');

/**
 * Encrypt environment file
 * @param {string} filePath - Path to environment file
 * @param {string} key - Encryption key
 * @param {string} outputPath - Path to save encrypted file
 * @returns {string} - Output file path
 */
function encryptFile(filePath, key, outputPath = null) {
  // Parse the environment file
  const envVars = parseEnvFile(filePath);
  
  // Convert to JSON
  const jsonString = JSON.stringify(envVars);
  
  // Encrypt
  const encrypted = CryptoJS.AES.encrypt(jsonString, key).toString();
  
  // Determine output path
  const outPath = outputPath || `${filePath}.enc`;
  
  // Save encrypted file
  fs.writeFileSync(outPath, encrypted);
  
  return outPath;
}

/**
 * Decrypt environment file
 * @param {string} filePath - Path to encrypted file
 * @param {string} key - Decryption key
 * @param {string} outputPath - Path to save decrypted file
 * @param {string} format - Output format (env, json, yaml)
 * @returns {string} - Output file path
 */
function decryptFile(filePath, key, outputPath = null, format = 'env') {
  // Read encrypted file
  const encrypted = fs.readFileSync(filePath, 'utf8');
  
  try {
    // Decrypt
    const bytes = CryptoJS.AES.decrypt(encrypted, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      throw new Error('Decryption failed. Invalid key or corrupted file.');
    }
    
    // Parse JSON
    const envVars = JSON.parse(decrypted);
    
    // Determine output path
    const outPath = outputPath || path.join(
      path.dirname(filePath),
      path.basename(filePath, path.extname(filePath))
    );
    
    // Save decrypted file
    return saveEnvFile(envVars, outPath, format);
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

module.exports = {
  encryptFile,
  decryptFile
}; 