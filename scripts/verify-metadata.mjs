import fs from 'node:fs';

const packageData = readJson('package.json');
const packageLock = readJson('package-lock.json');
const manifest = readJson('manifest.json');
const versions = readJson('versions.json');
const versionPattern = /^\d+\.\d+\.\d+$/;

assert(versionPattern.test(manifest.version), 'manifest.json version must use x.y.z without a v prefix');
assert(packageData.version === manifest.version, 'package.json and manifest.json versions must match');
assert(packageLock.version === manifest.version, 'package-lock.json and manifest.json versions must match');
assert(
  packageLock.packages?.['']?.version === manifest.version,
  'package-lock.json root package and manifest.json versions must match',
);
assert(
  versions[manifest.version] === manifest.minAppVersion,
  'versions.json must map the current plugin version to manifest.json minAppVersion',
);
assert(/^[a-z-]+$/.test(manifest.id), 'manifest id must contain only lowercase letters and hyphens');
assert(!manifest.id.includes('obsidian'), 'manifest id must not contain obsidian');
assert(!manifest.id.endsWith('plugin'), 'manifest id must not end with plugin');
assert(manifest.description.length <= 250, 'manifest description must be no longer than 250 characters');
assert(manifest.description.endsWith('.'), 'manifest description must end with a period');
assert(!manifest.description.startsWith('This is a plugin'), 'manifest description must start with an action');
assert(typeof manifest.isDesktopOnly === 'boolean', 'manifest isDesktopOnly must be a boolean');

for (const requiredFile of ['README.md', 'LICENSE', 'manifest.json', 'versions.json']) {
  assert(fs.existsSync(requiredFile), `${requiredFile} is required for publication`);
}

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
