const fs = require('fs-extra');
const path = require('path');
const { parseEnvFile } = require('./parser');
const chalk = require('chalk');
const { glob } = require('glob');

/**
 * Validate environment variables against a schema
 * @param {Object} envVars - Environment variables
 * @param {string} schemaPath - Path to schema file
 * @returns {Object} - Validation results
 */
async function validateWithSchema(envVars, schemaPath) {
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found: ${schemaPath}`);
  }

  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const results = {
    valid: true,
    errors: [],
    warnings: []
  };

  // Check for required variables
  for (const [key, def] of Object.entries(schema)) {
    if (def.required && !(key in envVars)) {
      results.valid = false;
      results.errors.push({
        key,
        message: `Required variable ${key} is missing`
      });
      continue;
    }

    if (!(key in envVars)) {
      if (def.default !== undefined) {
        results.warnings.push({
          key,
          message: `Variable ${key} is using default value: ${def.default}`
        });
      }
      continue;
    }

    const value = envVars[key];

    // Type validation
    if (def.type && !validateType(value, def.type)) {
      results.valid = false;
      results.errors.push({
        key,
        message: `Variable ${key} should be of type ${def.type}, got: ${value}`
      });
    }

    // Pattern validation
    if (def.pattern && !new RegExp(def.pattern).test(value)) {
      results.valid = false;
      results.errors.push({
        key,
        message: `Variable ${key} does not match required pattern: ${def.pattern}`
      });
    }

    // Enum validation
    if (def.enum && !def.enum.includes(value)) {
      results.valid = false;
      results.errors.push({
        key,
        message: `Variable ${key} should be one of: ${def.enum.join(', ')}, got: ${value}`
      });
    }
  }

  // Check for extra variables
  const extraKeys = Object.keys(envVars).filter(key => !(key in schema));
  if (extraKeys.length > 0) {
    results.warnings.push({
      keys: extraKeys,
      message: `Found ${extraKeys.length} variables not in schema: ${extraKeys.join(', ')}`
    });
  }

  return results;
}

/**
 * Validate an environment variable's type
 * @param {string} value - Environment variable value
 * @param {string} type - Expected type
 * @returns {boolean} - Whether the value matches the type
 */
function validateType(value, type) {
  switch (type.toLowerCase()) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return !isNaN(Number(value));
    case 'boolean':
      return ['true', 'false', '0', '1'].includes(value.toLowerCase());
    case 'url':
      try {
        new URL(value);
        return true;
      } catch (e) {
        return false;
      }
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    case 'ipaddress':
      return /^(\d{1,3}\.){3}\d{1,3}$/.test(value);
    default:
      return true;
  }
}

/**
 * Check if environment variables are used in code
 * @param {Object} envVars - Environment variables
 * @param {string} directory - Directory to search in
 * @returns {Object} - Results with used and unused variables
 */
async function checkCodeUsage(envVars, directory) {
  const results = {
    used: {},
    unused: {}
  };

  const files = await glob('**/*.{js,jsx,ts,tsx,php,py,rb}', {
    cwd: directory,
    ignore: ['node_modules/**', 'vendor/**', '.git/**', 'dist/**', 'build/**']
  });

  // Create a map to track which variables are used
  const usageMap = Object.keys(envVars).reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {});

  // Search for usage in files
  for (const file of files) {
    const filePath = path.join(directory, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      for (const key of Object.keys(envVars)) {
        // Common patterns for accessing env vars in different languages
        const patterns = [
          `process.env.${key}`,
          `process.env['${key}']`,
          `process.env["${key}"]`,
          `env('${key}')`,
          `getenv('${key}')`,
          `os.getenv('${key}')`,
          `ENV['${key}']`,
          `$_ENV['${key}']`,
          `$${key}` // For shell scripts
        ];
        
        if (patterns.some(pattern => content.includes(pattern))) {
          usageMap[key] = true;
        }
      }
    }
  }

  // Populate results
  for (const [key, used] of Object.entries(usageMap)) {
    if (used) {
      results.used[key] = envVars[key];
    } else {
      results.unused[key] = envVars[key];
    }
  }

  return results;
}

/**
 * Compare two environment files and find differences
 * @param {string} file1 - First env file path
 * @param {string} file2 - Second env file path
 * @returns {Object} - Differences between files
 */
function compareEnvFiles(file1, file2) {
  const env1 = parseEnvFile(file1);
  const env2 = parseEnvFile(file2);

  const results = {
    onlyInFirst: {},
    onlyInSecond: {},
    different: {},
    same: {}
  };

  // Find keys only in first file
  for (const key of Object.keys(env1)) {
    if (!(key in env2)) {
      results.onlyInFirst[key] = env1[key];
    } else if (env1[key] !== env2[key]) {
      results.different[key] = {
        first: env1[key],
        second: env2[key]
      };
    } else {
      results.same[key] = env1[key];
    }
  }

  // Find keys only in second file
  for (const key of Object.keys(env2)) {
    if (!(key in env1)) {
      results.onlyInSecond[key] = env2[key];
    }
  }

  return results;
}

module.exports = {
  validateWithSchema,
  validateType,
  checkCodeUsage,
  compareEnvFiles
}; 