import fs from 'node:fs';
import process from 'node:process';

const manifestPath = 'manifest.json';
const versionsPath = 'versions.json';
const packagePath = 'package.json';
const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const versions = JSON.parse(fs.readFileSync(versionsPath, 'utf8'));

manifest.version = packageData.version;
versions[packageData.version] = manifest.minAppVersion;

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(versionsPath, `${JSON.stringify(versions, null, 2)}\n`);
process.exit(0);
