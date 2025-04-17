const { compareEnvFiles } = require('../utils/validator');
const chalk = require('chalk');
const path = require('path');

/**
 * Format comparison results as a table
 * @param {Object} results - Comparison results
 * @param {string} file1 - First file path
 * @param {string} file2 - Second file path
 */
function formatAsTable(results, file1, file2) {
  const file1Name = path.basename(file1);
  const file2Name = path.basename(file2);
  
  console.log(chalk.blue(`Comparing ${file1Name} and ${file2Name}:`));
  
  // Variables only in first file
  if (Object.keys(results.onlyInFirst).length > 0) {
    console.log(chalk.yellow(`\nVariables only in ${file1Name}:`));
    for (const [key, value] of Object.entries(results.onlyInFirst)) {
      console.log(chalk.yellow(`  ${key}=${value}`));
    }
  }
  
  // Variables only in second file
  if (Object.keys(results.onlyInSecond).length > 0) {
    console.log(chalk.yellow(`\nVariables only in ${file2Name}:`));
    for (const [key, value] of Object.entries(results.onlyInSecond)) {
      console.log(chalk.yellow(`  ${key}=${value}`));
    }
  }
  
  // Variables with different values
  if (Object.keys(results.different).length > 0) {
    console.log(chalk.red(`\nVariables with different values:`));
    for (const [key, values] of Object.entries(results.different)) {
      console.log(chalk.red(`  ${key}:`));
      console.log(chalk.red(`    ${file1Name}: ${values.first}`));
      console.log(chalk.red(`    ${file2Name}: ${values.second}`));
    }
  }
  
  // Variables that are the same
  if (Object.keys(results.same).length > 0) {
    console.log(chalk.green(`\nVariables with identical values: ${Object.keys(results.same).length}`));
  }
  
  // Summary
  console.log(chalk.blue('\nSummary:'));
  console.log(`  Total unique variables: ${Object.keys({...results.onlyInFirst, ...results.onlyInSecond, ...results.different, ...results.same}).length}`);
  console.log(`  Identical: ${Object.keys(results.same).length}`);
  console.log(`  Different: ${Object.keys(results.different).length}`);
  console.log(`  Only in ${file1Name}: ${Object.keys(results.onlyInFirst).length}`);
  console.log(`  Only in ${file2Name}: ${Object.keys(results.onlyInSecond).length}`);
}

/**
 * Format comparison results as JSON
 * @param {Object} results - Comparison results
 */
function formatAsJson(results) {
  console.log(JSON.stringify(results, null, 2));
}

/**
 * Compare two environment files
 * @param {string} file1 - First env file path
 * @param {string} file2 - Second env file path
 * @param {Object} options - Command options
 */
function diff(file1, file2, options) {
  try {
    const results = compareEnvFiles(file1, file2);
    
    if (options.output.toLowerCase() === 'json') {
      formatAsJson(results);
    } else {
      formatAsTable(results, file1, file2);
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

module.exports = diff; 