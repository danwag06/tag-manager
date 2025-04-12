# Wags Tags

A simple tool for creating consistent tagged releases that follow semantic versioning.

## Features

- **Semantic Versioning**: Automatically manages version increments (major, minor, patch)
- **Environment Support**: Configurable mapping between Git branches and environments (dev, qa, staging, production)
- **Pre-release Types**: Support for alpha, beta, and release candidate versions
- **Dual Tagging System**: Creates both immutable version-specific tags and mutable environment tags
- **Interactive Configuration**: Easy setup with guided prompts

## Installation

```bash
npm install wags-tags
```

## Quick Start

1. **Configure your repository**:

```bash
npx wags-tags --config
# or
npx wags-tags -config
```

2. **Create a patch release**:

```bash
npx wags-tags
# or
npx wags-tags -patch
```

3. **Create a minor release**:

```bash
npx wags-tags -minor
```

4. **Create a major release**:

```bash
npx wags-tags -major
```

5. **Create a pre-release**:

```bash
npx wags-tags --pre-release
# or
npx wags-tags -pr
```

## How It Works

Wags Tags helps maintain consistent versioning across multiple environments:

1. **Branch-to-Environment Mapping**: Maps Git branches to logical environments (dev, qa, staging, prod)
2. **Intelligent Versioning**: Determines the next version number based on semantic versioning rules
3. **Dual Tagging**: Creates two types of tags:
   - **Immutable tags**: Specific version tags (e.g., v1.2.3-dev, v1.0.0-alpha)
   - **Mutable tags**: Environment tags that always point to latest (e.g., dev, qa, latest)

## Tag Formats

- Production releases: `v1.2.3`
- Production pre-releases: `v1.2.3-alpha`, `v1.2.3-beta`, `v1.2.3-rc`
- Environment releases: `v1.2.3-dev`, `v1.2.3-qa`, `v1.2.3-stg`
- Environment pre-releases: `v1.2.3-dev-alpha`, `v1.2.3-qa-beta`, etc.

## Configuration

The configuration is stored in a `.wags-tags.json` file in your project root:

```json
{
  "environments": [
    {
      "name": "dev",
      "branch": "develop",
      "isProduction": false
    },
    {
      "name": "qa",
      "branch": "qa",
      "isProduction": false
    },
    {
      "name": "stg",
      "branch": "staging",
      "isProduction": false
    },
    {
      "name": "prod",
      "branch": "main",
      "isProduction": true
    }
  ]
}
```

## Use Cases

- **Multi-environment Deployments**: Maintain different versions for different environments
- **CI/CD Pipelines**: Automate versioning in your deployment process
- **NPM Package Publishing**: Create consistent tagged releases for your packages
- **Docker Image Tagging**: Use generated tags for Docker images

## License

ISC
