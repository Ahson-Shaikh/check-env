const { parseEnvFile, saveEnvFile } = require('../utils/parser');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

/**
 * Generate a schema from environment variables
 * @param {Object} envVars - Environment variables
 * @returns {Object} - Generated schema
 */
function generateSchema(envVars) {
  const schema = {};

  for (const [key, value] of Object.entries(envVars)) {
    schema[key] = inferSchemaForValue(key, value);
  }

  return schema;
}

/**
 * Infer schema type for a value
 * @param {string} key - Environment variable key
 * @param {string} value - Environment variable value
 * @returns {Object} - Schema definition
 */
function inferSchemaForValue(key, value) {
  const def = {
    required: true,
    description: `Environment variable: ${key}`
  };

  // Try to infer type
  if (!isNaN(Number(value))) {
    def.type = 'number';
  } else if (['true', 'false', 'yes', 'no', '0', '1'].includes(value.toLowerCase())) {
    def.type = 'boolean';
    def.enum = ['true', 'false', '0', '1', 'yes', 'no'];
  } else if (/^(https?:\/\/)/.test(value)) {
    def.type = 'url';
  } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    def.type = 'email';
  } else if (/^(\d{1,3}\.){3}\d{1,3}$/.test(value)) {
    def.type = 'ipaddress';
  } else {
    def.type = 'string';
  }

  // Infer default value
  if (key.includes('DEFAULT') || key.includes('FALLBACK')) {
    def.default = value;
    def.required = false;
  }

  // Guess sensitive data
  if (
    key.includes('SECRET') || 
    key.includes('PASSWORD') || 
    key.includes('KEY') || 
    key.includes('TOKEN') ||
    key.includes('AUTH')
  ) {
    def.sensitive = true;
  }

  return def;
}

/**
 * Generate example environment file
 * @param {Object} envVars - Environment variables
 * @param {Object} schema - Schema object (optional)
 * @returns {Object} - Example environment variables
 */
function generateExample(envVars, schema = null) {
  const exampleVars = {};
  
  // If we have a schema, use it to generate better examples
  if (schema) {
    for (const [key, def] of Object.entries(schema)) {
      if (def.default) {
        exampleVars[key] = def.default;
      } else if (def.enum && def.enum.length > 0) {
        exampleVars[key] = def.enum[0];
      } else if (def.sensitive) {
        exampleVars[key] = '********';
      } else if (key in envVars) {
        // Use the original value but mask it if it looks like a secret
        const isSensitiveLooking = key.includes('SECRET') || 
                                  key.includes('PASSWORD') || 
                                  key.includes('KEY') || 
                                  key.includes('TOKEN');
        
        exampleVars[key] = isSensitiveLooking ? '********' : envVars[key];
      } else {
        exampleVars[key] = `YOUR_${key}_HERE`;
      }
    }
  } else {
    // No schema available, just mask sensitive-looking values
    for (const [key, value] of Object.entries(envVars)) {
      const isSensitiveLooking = key.includes('SECRET') || 
                                key.includes('PASSWORD') || 
                                key.includes('KEY') || 
                                key.includes('TOKEN');
      
      exampleVars[key] = isSensitiveLooking ? '********' : value;
    }
  }
  
  return exampleVars;
}

/**
 * Initialize environment configuration
 * @param {Object} options - Command options
 */
function init(options) {
  try {
    const envFilePath = path.resolve(options.file);
    console.log(chalk.blue(`Reading environment file: ${envFilePath}`));

    // Check if file exists
    if (!fs.existsSync(envFilePath)) {
      console.error(chalk.red(`Error: Environment file not found at ${envFilePath}`));
      process.exit(1);
    }

    // Parse environment file
    const envVars = parseEnvFile(envFilePath);
    console.log(chalk.green(`Found ${Object.keys(envVars).length} environment variables`));

    if (options.type.toLowerCase() === 'schema') {
      // Generate schema
      const schema = generateSchema(envVars);
      
      // Determine output path
      const outputPath = options.output || 'env.schema.json';
      const schemaPath = path.resolve(outputPath);
      
      // Save schema
      fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
      console.log(chalk.green(`✓ Generated schema at ${schemaPath}`));
      console.log(chalk.blue('You can now use this schema for validation with:'));
      console.log(chalk.blue(`  env-check validate --schema ${outputPath}`));
    } else {
      // Generate example file
      let schema = null;
      const schemaPath = path.resolve('env.schema.json');
      
      // If a schema exists, use it for better examples
      if (fs.existsSync(schemaPath)) {
        console.log(chalk.blue(`Found schema file: ${schemaPath}`));
        schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      }
      
      const exampleVars = generateExample(envVars, schema);
      
      // Determine output path
      const outputPath = options.output || '.env.example';
      const examplePath = path.resolve(outputPath);
      
      // Save example file
      saveEnvFile(exampleVars, examplePath);
      console.log(chalk.green(`✓ Generated example file at ${examplePath}`));
    }

  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

module.exports = init; 