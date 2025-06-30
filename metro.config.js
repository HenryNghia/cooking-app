const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Thêm đuôi .bin vào assetExts
config.resolver.assetExts.push('bin','json');

// Áp dụng NativeWind vào cấu hình và xuất ra
module.exports = withNativeWind(config, { input: './app/global.css' });