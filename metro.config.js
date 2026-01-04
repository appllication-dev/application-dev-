const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('mjs');
config.resolver.sourceExts.push('cjs');

// Enable package.json exports support
config.resolver.unstable_enablePackageExports = true;

module.exports = config;

