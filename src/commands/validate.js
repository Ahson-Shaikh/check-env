const { parseEnvFile } = require('../utils/parser');
const { validateWithSchema, checkCodeUsage } = require('../utils/validator');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

/**
 * Validate command handler
 * @param {Object} options - Command options
 */
async function validate(options) {
  try {
    const envFilePath = path.resolve(options.file);
    console.log(chalk.blue(`Validating environment file: ${envFilePath}`));

    // Check if file exists
    if (!fs.existsSync(envFilePath)) {
      console.error(chalk.red(`Error: Environment file not found at ${envFilePath}`));
      process.exit(1);
    }

    // Parse environment file
    const envVars = parseEnvFile(envFilePath);
    console.log(chalk.green(`Found ${Object.keys(envVars).length} environment variables`));

    // Validate against schema if it exists
    const schemaPath = path.resolve(options.schema);
    if (fs.existsSync(schemaPath)) {
      console.log(chalk.blue(`Validating against schema: ${schemaPath}`));
      const schemaResults = await validateWithSchema(envVars, schemaPath);

      // Print schema validation results
      if (schemaResults.valid) {
        console.log(chalk.green('✓ All variables match schema requirements'));
      } else {
        console.log(chalk.red(`✗ Found ${schemaResults.errors.length} validation errors`));
        
        for (const error of schemaResults.errors) {
          console.log(chalk.red(`  - ${error.message}`));
        }
      }

      if (schemaResults.warnings.length > 0) {
        console.log(chalk.yellow(`⚠ Found ${schemaResults.warnings.length} warnings:`));
        
        for (const warning of schemaResults.warnings) {
          console.log(chalk.yellow(`  - ${warning.message}`));
        }
      }
    } else {
      console.log(chalk.yellow(`Schema file not found at ${schemaPath}. Skipping schema validation.`));
      console.log(chalk.yellow('Tip: Run `env-check init` to generate a schema file.'));
    }

    // Check code usage if requested
    if (options.codeCheck) {
      const directoryPath = path.resolve(options.directory);
      console.log(chalk.blue(`Checking for variable usage in code: ${directoryPath}`));
      
      const usageResults = await checkCodeUsage(envVars, directoryPath);
      
      // Print code usage results
      const unusedCount = Object.keys(usageResults.unused).length;
      if (unusedCount > 0) {
        console.log(chalk.yellow(`⚠ Found ${unusedCount} variables not used in code:`));
        
        for (const key of Object.keys(usageResults.unused)) {
          console.log(chalk.yellow(`  - ${key}`));
        }
      } else {
        console.log(chalk.green('✓ All variables are used in code'));
      }
      
      console.log(chalk.green(`✓ Found ${Object.keys(usageResults.used).length} variables used in code`));
    }

  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

module.exports = validate; 