#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const packageJson = require('../package.json');

// Import commands
const validate = require('../src/commands/validate');
const diff = require('../src/commands/diff');
const init = require('../src/commands/init');
const encrypt = require('../src/commands/encrypt');
const decrypt = require('../src/commands/decrypt');

// Set up CLI
program
  .name('env-check')
  .description('A smart environment variable validator and manager')
  .version(packageJson.version);

// Register commands
program
  .command('validate')
  .description('Validate .env against schema or usage in code')
  .option('-f, --file <path>', 'Path to .env file', '.env')
  .option('-s, --schema <path>', 'Path to schema file', 'env.schema.json')
  .option('-c, --code-check', 'Check if variables are used in code', false)
  .option('-d, --directory <path>', 'Directory to scan for code usage', '.')
  .action(validate);

program
  .command('diff')
  .description('Show differences between environment files')
  .argument('<file1>', 'First env file path')
  .argument('<file2>', 'Second env file path')
  .option('-o, --output <format>', 'Output format (table, json)', 'table')
  .action(diff);

program
  .command('init')
  .description('Generate .env.schema.json or .env.example')
  .option('-t, --type <type>', 'Output type (schema, example)', 'schema')
  .option('-f, --file <path>', 'Path to source .env file', '.env')
  .option('-o, --output <path>', 'Output file path')
  .action(init);

program
  .command('encrypt')
  .description('Encrypt environment file for safe sharing')
  .argument('<file>', 'The env file to encrypt')
  .option('-o, --output <path>', 'Output file path')
  .option('-k, --key <key>', 'Encryption key (will prompt if not provided)')
  .action(encrypt);

program
  .command('decrypt')
  .description('Decrypt encrypted environment file')
  .argument('<file>', 'The encrypted env file')
  .option('-o, --output <path>', 'Output file path')
  .option('-k, --key <key>', 'Decryption key (will prompt if not provided)')
  .action(decrypt);

// Handle errors
program.exitOverride();
try {
  program.parse(process.argv);
} catch (err) {
  console.error(chalk.red('Error:'), err.message);
  process.exit(1);
}

// Display help if no arguments passed
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 