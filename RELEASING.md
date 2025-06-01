# 🚀 Release Process

This document explains how to create releases and publish the @kodesonik/zedoc package.

## 📋 Overview

We use GitHub Actions to automate the release and publishing process. There are three main workflows:

1. **CI Workflow** (`ci.yml`) - Runs tests on pull requests and pushes
2. **Release Workflow** (`release.yml`) - Creates releases and tags (manual trigger)
3. **Publish Workflow** (`publish.yml`) - Publishes to npm when tags are created

## 🔧 Setup Requirements

Before you can publish packages, ensure these secrets are configured in your GitHub repository:

### Required Secrets

1. **`NPM_TOKEN`** - Your npm authentication token
   - Go to [npm](https://www.npmjs.com) → Account → Access Tokens
   - Create a new token with "Automation" type
   - Add it to GitHub repository secrets

2. **`GITHUB_TOKEN`** - Automatically provided by GitHub Actions (no setup needed)

### Setting up NPM_TOKEN

1. Log into [npmjs.com](https://www.npmjs.com)
2. Go to your account settings → Access Tokens
3. Click "Generate New Token" → "Automation"
4. Copy the token
5. In your GitHub repository, go to Settings → Secrets and Variables → Actions
6. Click "New repository secret"
7. Name: `NPM_TOKEN`, Value: (paste your token)

## 📦 Release Methods

### Method 1: Manual Release (Recommended)

Use the GitHub Actions release workflow for a controlled release process:

1. Go to your repository on GitHub
2. Click "Actions" tab
3. Select "Create Release" workflow
4. Click "Run workflow"
5. Choose:
   - **Version**: `patch`, `minor`, `major`, or specific version (e.g., `1.0.0`)
   - **Pre-release**: Check if this is a pre-release
6. Click "Run workflow"

This will:
- ✅ Run all tests and linting
- ✅ Build the package
- ✅ Bump the version in `package.json`
- ✅ Create a git tag
- ✅ Push changes and tag to GitHub
- ✅ Create a GitHub release
- ✅ Trigger the publish workflow automatically

### Method 2: Command Line Release

For quick releases from your local machine:

```bash
# Patch release (0.0.1 → 0.0.2)
npm run release:patch

# Minor release (0.0.1 → 0.1.0)
npm run release:minor

# Major release (0.0.1 → 1.0.0)
npm run release:major
```

This will:
- ✅ Bump version in `package.json`
- ✅ Create a git tag
- ✅ Push to GitHub
- ✅ Trigger GitHub Actions to publish

### Method 3: Manual Tag Creation

Create a tag manually to trigger publishing:

```bash
# Create and push a tag
git tag v0.0.2
git push origin v0.0.2
```

## 🔄 Workflow Details

### CI Workflow (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Actions:**
- Tests on Node.js 16, 18, and 20
- Linting and formatting checks
- Build verification
- Package content validation

### Release Workflow (`release.yml`)

**Triggers:**
- Manual dispatch from GitHub Actions UI

**Actions:**
- Run tests and linting
- Bump version based on input
- Update README with new version
- Create and push git tag
- Generate release notes
- Create GitHub release
- Trigger publish workflow

### Publish Workflow (`publish.yml`)

**Triggers:**
- New tags matching `v*` pattern (e.g., `v0.0.1`, `v1.0.0`)

**Actions:**
- Run full test suite
- Build package with assets
- Publish to npm with provenance
- Create GitHub release with changelog

## 📝 Version Guidelines

Follow [Semantic Versioning](https://semver.org/):

- **Patch** (`0.0.1` → `0.0.2`): Bug fixes, documentation updates
- **Minor** (`0.0.1` → `0.1.0`): New features, backwards compatible
- **Major** (`0.0.1` → `1.0.0`): Breaking changes

## 🔍 Troubleshooting

### Common Issues

1. **NPM publish fails**
   - Check if `NPM_TOKEN` secret is set correctly
   - Ensure you have publish permissions for `@kodesonik/zedoc`
   - Verify the version doesn't already exist on npm

2. **Tests fail during release**
   - Fix failing tests before creating a release
   - Run `npm test` locally to debug

3. **Build fails**
   - Run `npm run build` locally to check for issues
   - Ensure all dependencies are properly listed

4. **Permission denied on GitHub**
   - Check repository permissions
   - Ensure GitHub Actions are enabled

### Verification Steps

Before releasing, run these commands locally:

```bash
# Install dependencies
npm ci

# Run tests
npm test

# Check linting
npm run lint

# Check formatting
npm run format -- --check

# Build package
npm run build

# Verify package contents
npm run pack:check
```

## 📚 Additional Resources

- [npm publishing docs](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [GitHub Actions documentation](https://docs.github.com/en/actions)
- [Semantic Versioning](https://semver.org/)
- [npm provenance documentation](https://docs.npmjs.com/generating-provenance-statements)

## 🆘 Support

If you encounter issues with the release process:

1. Check the GitHub Actions logs for detailed error messages
2. Verify all required secrets are configured
3. Ensure you have the necessary permissions
4. Create an issue in the repository for help 