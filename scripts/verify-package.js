#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying package for publishing...\n');

const checks = [
  {
    name: 'package.json exists',
    check: () => fs.existsSync('package.json'),
    error: 'package.json not found'
  },
  {
    name: 'dist directory exists',
    check: () => fs.existsSync('dist'),
    error: 'dist directory not found. Run: npm run build'
  },
  {
    name: 'dist/index.js exists',
    check: () => fs.existsSync('dist/index.js'),
    error: 'dist/index.js not found. Run: npm run build'
  },
  {
    name: 'dist/index.d.ts exists',
    check: () => fs.existsSync('dist/index.d.ts'),
    error: 'dist/index.d.ts not found. Run: npm run build'
  },
  {
    name: 'dist/templates directory exists',
    check: () => fs.existsSync('dist/templates'),
    error: 'dist/templates not found. Run: npm run build'
  },
  {
    name: 'dist/assets directory exists',
    check: () => fs.existsSync('dist/assets'),
    error: 'dist/assets not found. Run: npm run build'
  },
  {
    name: 'documentation.hbs template exists',
    check: () => fs.existsSync('dist/templates/documentation.hbs'),
    error: 'documentation.hbs template not found'
  },
  {
    name: 'CSS assets exist',
    check: () => {
      const cssFiles = ['default.css', 'postman.css', 'insomnia.css', 'swagger.css'];
      return cssFiles.every(file => fs.existsSync(`dist/assets/${file}`));
    },
    error: 'One or more CSS theme files missing'
  },
  {
    name: 'docs.js asset exists',
    check: () => fs.existsSync('dist/assets/docs.js'),
    error: 'docs.js asset not found'
  },
  {
    name: 'README.md exists',
    check: () => fs.existsSync('README.md'),
    error: 'README.md not found'
  }
];

let allPassed = true;

checks.forEach((check, index) => {
  const passed = check.check();
  const status = passed ? '✅' : '❌';
  const message = passed ? check.name : `${check.name} - ${check.error}`;
  
  console.log(`${status} ${message}`);
  
  if (!passed) {
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 Package verification passed! Ready for publishing.');
  
  // Display package info
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log(`\n📦 Package: ${packageJson.name}`);
    console.log(`📄 Version: ${packageJson.version}`);
    console.log(`📝 Description: ${packageJson.description}`);
    
    console.log('\n🚀 To publish:');
    console.log('   npm publish');
    console.log('\n🏷️  To create a release:');
    console.log('   npm run release:patch  # for patch version');
    console.log('   npm run release:minor  # for minor version');
    console.log('   npm run release:major  # for major version');
  } catch (error) {
    console.log('⚠️  Could not read package.json for additional info');
  }
} else {
  console.log('❌ Package verification failed! Please fix the issues above.');
  process.exit(1);
}

console.log(''); 