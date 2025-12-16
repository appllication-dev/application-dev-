const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Fix for three.js and react-three-fiber - extend default extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs', 'mjs'];
config.resolver.assetExts = [...config.resolver.assetExts, 'glb', 'gltf'];

// Fix for @tanstack/react-query v5 resolution in Metro
config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === '@tanstack/react-query') {
        return {
            filePath: path.resolve(__dirname, 'node_modules/@tanstack/react-query/build/legacy/index.cjs'),
            type: 'sourceFile',
        };
    }
    return context.resolveRequest(context, moduleName, platform);
};

// Force resolution of three.js to prevent "Multiple instances" warning
config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    'three': path.resolve(__dirname, 'node_modules/three'),
};

module.exports = config;
