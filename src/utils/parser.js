const fs = require('fs-extra');
const dotenv = require('dotenv');
const yaml = require('js-yaml');
const path = require('path');

/**
 * Parse an environment file based on its extension
 * @param {string} filePath - Path to the environment file
 * @returns {Object} - Object containing environment variables
 */
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case '.env':
      return dotenv.parse(fileContent);
    case '.json':
      return JSON.parse(fileContent);
    case '.yaml':
    case '.yml':
      return yaml.load(fileContent);
    default:
      // Default to dotenv parser
      return dotenv.parse(fileContent);
  }
}

/**
 * Save environment variables to a file
 * @param {Object} envVars - Environment variables object
 * @param {string} filePath - Output file path
 * @param {string} format - Output format (env, json, yaml)
 */
function saveEnvFile(envVars, filePath, format = 'env') {
  let content;

  switch (format.toLowerCase()) {
    case 'json':
      content = JSON.stringify(envVars, null, 2);
      break;
    case 'yaml':
    case 'yml':
      content = yaml.dump(envVars);
      break;
    case 'env':
    default:
      content = Object.entries(envVars)
        .map(([key, value]) => `${key}=${formatEnvValue(value)}`)
        .join('\n');
      break;
  }

  fs.outputFileSync(filePath, content);
  return filePath;
}

/**
 * Format value for .env file
 * @param {*} value - The value to format
 * @returns {string} - Formatted value
 */
function formatEnvValue(value) {
  if (typeof value === 'string') {
    // Add quotes if the value contains spaces or special characters
    if (/[\s"'\\,;]/g.test(value)) {
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    return value;
  }
  return String(value);
}

module.exports = {
  parseEnvFile,
  saveEnvFile,
  formatEnvValue
}; 