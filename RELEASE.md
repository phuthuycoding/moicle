# Release Guide

This project uses automated releases via GitHub Actions. **DO NOT manually change version in `package.json`**.

## 📦 Publishing a Release

### Option 1: Via GitHub UI (Recommended)

1. Go to **Actions** tab in GitHub
2. Select **"Publish to NPM"** workflow
3. Click **"Run workflow"** button
4. Select options:
   - **Release Type**: `patch`, `minor`, `major`, `prepatch`, `preminor`, `premajor`, `prerelease`
   - **Prerelease ID**: `beta`, `alpha`, `rc`, etc. (for prerelease versions)
   - **Dist Tag**: `latest`, `beta`, `alpha`, `next`, `canary`
5. Click **"Run workflow"**

### Option 2: Via GitHub CLI

```bash
# Patch release (1.0.0 -> 1.0.1)
gh workflow run publish.yml -f release-type=patch -f dist-tag=latest

# Minor release (1.0.0 -> 1.1.0)
gh workflow run publish.yml -f release-type=minor -f dist-tag=latest

# Major release (1.0.0 -> 2.0.0)
gh workflow run publish.yml -f release-type=major -f dist-tag=latest

# Beta release (1.0.0 -> 1.0.1-beta.0)
gh workflow run publish.yml -f release-type=prepatch -f prerelease-id=beta -f dist-tag=beta

# Increment existing beta (1.0.1-beta.0 -> 1.0.1-beta.1)
gh workflow run publish.yml -f release-type=prerelease -f prerelease-id=beta -f dist-tag=beta
```

## 📋 Release Types

### Standard Releases

| Type    | Example                | Dist Tag | Description           |
| ------- | ---------------------- | -------- | --------------------- |
| `patch` | `1.0.0` → `1.0.1`      | `latest` | Bug fixes             |
| `minor` | `1.0.0` → `1.1.0`      | `latest` | New features          |
| `major` | `1.0.0` → `2.0.0`      | `latest` | Breaking changes      |

### Prerelease Versions

| Type        | Example                    | Dist Tag | Description                  |
| ----------- | -------------------------- | -------- | ---------------------------- |
| `prepatch`  | `1.0.0` → `1.0.1-beta.0`   | `beta`   | Beta patch                   |
| `preminor`  | `1.0.0` → `1.1.0-beta.0`   | `beta`   | Beta minor                   |
| `premajor`  | `1.0.0` → `2.0.0-beta.0`   | `beta`   | Beta major                   |
| `prerelease`| `1.0.1-beta.0` → `1.0.1-beta.1` | `beta` | Increment existing prerelease |

## 🎯 Common Scenarios

### Scenario 1: Bug Fix Release
```bash
# Current: 1.2.3
# Target: 1.2.4
gh workflow run publish.yml -f release-type=patch -f dist-tag=latest
```

### Scenario 2: New Feature Release
```bash
# Current: 1.2.3
# Target: 1.3.0
gh workflow run publish.yml -f release-type=minor -f dist-tag=latest
```

### Scenario 3: Breaking Change Release
```bash
# Current: 1.2.3
# Target: 2.0.0
gh workflow run publish.yml -f release-type=major -f dist-tag=latest
```

### Scenario 4: Beta Testing
```bash
# Current: 1.2.3
# Target: 1.2.4-beta.0
gh workflow run publish.yml -f release-type=prepatch -f prerelease-id=beta -f dist-tag=beta

# Users install with:
npm install moicle@beta
```

### Scenario 5: Alpha Release
```bash
# Current: 1.2.3
# Target: 1.3.0-alpha.0
gh workflow run publish.yml -f release-type=preminor -f prerelease-id=alpha -f dist-tag=alpha

# Users install with:
npm install moicle@alpha
```

### Scenario 6: Release Candidate
```bash
# Current: 1.2.3
# Target: 2.0.0-rc.0
gh workflow run publish.yml -f release-type=premajor -f prerelease-id=rc -f dist-tag=next

# Users install with:
npm install moicle@next
```

## 🔄 What Happens Automatically?

When you run the workflow, it will:

1. ✅ **Bump version** in `package.json` based on release type
2. ✅ **Build package** (if build step exists)
3. ✅ **Publish to NPM** with specified dist-tag
4. ✅ **Commit changes** back to master branch
5. ✅ **Create Git tag** (e.g., `v1.2.4`)
6. ✅ **Push tag** to GitHub
7. ✅ **Create GitHub Release** with release notes

## 🚫 Don't Do This

❌ **Never manually edit version in package.json**
```bash
# DON'T DO THIS:
git commit -m "bump version to 1.2.4"  # ❌ WRONG
```

✅ **Always use the workflow**
```bash
# DO THIS INSTEAD:
gh workflow run publish.yml -f release-type=patch -f dist-tag=latest
```

## 📊 Dist Tags Explained

- **`latest`**: Default, stable releases (recommended for production)
- **`beta`**: Beta testing, may have bugs
- **`alpha`**: Early testing, unstable
- **`next`**: Release candidates, near-stable
- **`canary`**: Bleeding edge, experimental

Users install with:
```bash
npm install moicle         # latest (default)
npm install moicle@beta    # beta version
npm install moicle@alpha   # alpha version
npm install moicle@1.2.3   # specific version
```

## 🔧 Prerequisites

1. **NPM Token**: Set `NPM_TOKEN` secret in GitHub repository settings
   - Use **Automation Token** (no OTP required)
   - Go to https://www.npmjs.com/ → Access Tokens → Generate New Token → Automation

2. **Permissions**: Workflow needs `contents: write` permission (already configured)

## 📝 Notes

- Version bumps are **automatic** and follow [Semantic Versioning](https://semver.org/)
- Git tags are created automatically with `v` prefix (e.g., `v1.2.3`)
- GitHub Releases are created automatically
- Prerelease versions are marked as "Pre-release" on GitHub
- All changes are pushed back to `master` branch

## 🆘 Troubleshooting

### Error: "This operation requires a one-time password"
➡️ Update `NPM_TOKEN` secret with an **Automation Token** instead of Classic Token

### Error: "refused to update ref"
➡️ Check GitHub token has `contents: write` permission

### Wrong version published
➡️ Don't panic! Just publish another version with the correct release type
