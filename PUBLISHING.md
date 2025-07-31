# Publishing Instructions for n8n-nodes-close-crm

## Prerequisites

1. **npm Account**: You need an npm account to publish packages
   - Create one at https://www.npmjs.com/signup if you don't have one
   - Verify your email address

2. **npm CLI**: Make sure you have npm installed and are logged in
   ```bash
   npm whoami  # Check if you're logged in
   npm login   # Login if needed
   ```

## Pre-Publishing Steps

### 1. Update Author Information
Before publishing, update your contact information in `package.json`:

```json
{
  "author": {
    "name": "Your Name",
    "email": "your-email@example.com"
  }
}
```

### 2. Update Repository URLs
Update the repository URLs to match your GitHub repository:

```json
{
  "homepage": "https://github.com/yourusername/n8n-nodes-close-crm#readme",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/yourusername/n8n-nodes-close-crm.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/n8n-nodes-close-crm/issues"
  }
}
```

### 3. Check Package Name Availability
```bash
npm view n8n-nodes-close-crm
```
If the package name is already taken, you'll need to choose a different name.

## Publishing Process

### 1. Final Quality Checks
```bash
# Run all checks
npm run build
npm run test
npm run lint

# Preview what will be published
npm pack --dry-run
```

### 2. Version Management
```bash
# For your first release (already set to 1.0.0)
npm version 1.0.0

# For future releases
npm version patch    # 1.0.1
npm version minor    # 1.1.0
npm version major    # 2.0.0
```

### 3. Publish to npm
```bash
# Publish the package
npm publish

# For first-time publishing, you might want to do a dry run first
npm publish --dry-run
```

### 4. Verify Publication
```bash
# Check that your package is available
npm view n8n-nodes-close-crm

# Install and test in a separate directory
mkdir test-install
cd test-install
npm init -y
npm install n8n-nodes-close-crm
```

## Post-Publishing Steps

### 1. Create GitHub Repository
1. Create a new repository on GitHub named `n8n-nodes-close-crm`
2. Push your code to the repository:
   ```bash
   git remote add origin https://github.com/yourusername/n8n-nodes-close-crm.git
   git branch -M main
   git push -u origin main
   ```

### 2. Create Release on GitHub
1. Go to your GitHub repository
2. Click "Releases" → "Create a new release"
3. Tag version: `v1.0.0`
4. Release title: `v1.0.0 - Initial Release`
5. Copy content from CHANGELOG.md for the description
6. Publish release

### 3. Submit to n8n Community
Consider submitting your node to the n8n community:
1. Share on the [n8n Community Forum](https://community.n8n.io/)
2. Consider adding it to awesome lists or community collections

## Maintenance

### Updating the Package
```bash
# Make your changes
# Update version in package.json or use npm version
npm version patch
npm run build
npm run test
npm publish
```

### Managing Versions
- **Patch** (1.0.1): Bug fixes
- **Minor** (1.1.0): New features, backward compatible
- **Major** (2.0.0): Breaking changes

## Troubleshooting

### Common Issues

1. **403 Forbidden**: Check if you're logged in and have permission
   ```bash
   npm whoami
   npm login
   ```

2. **Package name taken**: Choose a different name like `n8n-nodes-close-crm-yourname`

3. **Version already exists**: Increment the version number
   ```bash
   npm version patch
   ```

4. **Build failures**: Ensure all dependencies are installed
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

## Package Information
- **Package Size**: ~13.3 kB
- **Unpacked Size**: ~67.2 kB
- **Files Included**: 24 files (compiled JS, type definitions, assets)
- **License**: Apache 2.0