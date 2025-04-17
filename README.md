# env-check

**env-check** is a smart environment variable validator and manager from SphereOps that solves common problems with .env files in development teams and multi-environment deployments.

![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)

## 🧩 The Problem

In many projects, especially in teams or multi-environment deployments (dev/stage/prod), managing .env files can be challenging:

- Missing or misconfigured environment variables cause silent failures
- Environment files are inconsistent across environments
- No validation of variable types or required values
- Difficulty in safely sharing sensitive environment variables with team members
- Uncertainty about which variables are actually used in the codebase

## 🚀 Features

**env-check** solves these problems with a comprehensive set of features:

- **Validate**: Check environment variables against a schema for required values and correct types
- **Compare**: Find differences between environment files (e.g., dev vs. prod)
- **Generate**: Create schema files or templates from existing environment files
- **Code Check**: Identify unused or missing variables referenced in your code
- **Security**: Encrypt sensitive environment files for safe sharing with team members
- **Format Support**: Works with .env, JSON, and YAML formats

## 📦 Installation

### Global NPM Installation

```bash
npm install -g env-check
```

This will make the `env-check` command available globally in your terminal.

### Linux System-wide Installation

For system-wide installation on Linux (making it available to all users):

1. Install the package globally first:

```bash
sudo npm install -g env-check
```

2. Create a symbolic link to make it available as a system utility:

```bash
sudo ln -s $(which env-check) /usr/local/bin/env-check
```

3. Ensure it's executable:

```bash
sudo chmod +x /usr/local/bin/env-check
```

### Direct Usage Without Installing

You can also use the tool without installing it:

```bash
npx env-check
```

## 🛠️ Usage

### Validate Environment Variables

Check your .env file against a schema:

```bash
env-check validate --file .env --schema env.schema.json
```

Check if variables are actually used in your code:

```bash
env-check validate --file .env --code-check
```

### Compare Environment Files

Find differences between environment files:

```bash
env-check diff .env.dev .env.prod
```

Output as JSON:

```bash
env-check diff .env.dev .env.prod --output json
```

### Generate Schema or Example Files

Generate a schema from your current .env file:

```bash
env-check init --type schema --file .env
```

Generate an .env.example template:

```bash
env-check init --type example --file .env
```

### Encrypt/Decrypt Environment Files

Encrypt an environment file for safe sharing:

```bash
env-check encrypt .env --output .env.encrypted
```

Decrypt an encrypted environment file:

```bash
env-check decrypt .env.encrypted --output .env.decrypted
```

## Schema Format

env-check uses a JSON schema format to validate environment variables. Here's an example:

```json
{
  "PORT": {
    "type": "number",
    "required": true,
    "description": "Port the server will listen on"
  },
  "API_KEY": {
    "type": "string",
    "required": true,
    "sensitive": true
  },
  "DEBUG_MODE": {
    "type": "boolean",
    "required": false,
    "default": "false"
  }
}
```

Supported types:
- `string`: Regular string value
- `number`: Numeric value
- `boolean`: Boolean value (`true`, `false`, `0`, `1`, `yes`, `no`)
- `url`: Valid URL
- `email`: Valid email address
- `ipaddress`: Valid IP address

## 💖 Why env-check Will Make Your Life Easier

- **Stop Fighting .env Files**: No more debugging issues caused by missing or incorrectly configured environment variables.

- **Team Consistency**: Ensure everyone on your team has the correct variables across all environments.

- **Onboarding Made Easy**: New team members can get up and running quickly with correctly configured environments.

- **CI/CD Ready**: Validate environment variables in your CI/CD pipeline before deployment.

- **Security First**: Safely share sensitive credentials with team members using encryption.

- **Documentation Built-in**: Schema files document what each variable is for and what format it should have.

- **Cleanup Unused Variables**: Identify and remove environment variables that aren't used in your code.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏢 About SphereOps

SphereOps specializes in building developer tools that make operations and DevOps workflows more efficient and error-free. # check-env
