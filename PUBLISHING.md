# Publishing Guide for @kodesonik/zedoc

## Prerequisites

1. Make sure you have an npm account
2. Login to npm: `npm login`
3. Ensure you have access to publish under the @kodesonik scope

## Publishing Steps

### 1. Build the library
```bash
npm run build
```

### 2. Test the package
```bash
npm pack --dry-run
```

### 3. Publish to npm
```bash
npm publish --access public
```

## Version Management

To update the version before publishing:

```bash
# For patch version (1.0.0 -> 1.0.1)
npm version patch

# For minor version (1.0.0 -> 1.1.0)
npm version minor

# For major version (1.0.0 -> 2.0.0)
npm version major
```

## Repository Setup

Make sure to:

1. Initialize git repository: `git init`
2. Add remote: `git remote add origin https://github.com/kodesonik/zedoc.git`
3. Create initial commit:
   ```bash
   git add .
   git commit -m "Initial commit: NestJS documentation library"
   git push -u origin main
   ```

## Package Features

✅ **Complete NestJS Library Setup**
- Proper TypeScript configuration
- NestJS CLI integration
- ESLint and Prettier setup
- Jest testing configuration

✅ **Core Functionality**
- Documentation service with Handlebars templates
- Custom @ApiDoc decorator
- Swagger integration
- Tailwind CSS styling
- Beautiful HTML documentation generation

✅ **Publishing Ready**
- Correct package.json configuration
- Proper exports and type definitions
- .npmignore for clean package
- MIT license
- Comprehensive README

✅ **Example Usage**
- Example module and controller
- Clear documentation and API reference

## Next Steps

1. Set up the GitHub repository
2. Configure CI/CD pipeline (optional)
3. Publish to npm
4. Create documentation website (optional)
5. Add more features and templates 