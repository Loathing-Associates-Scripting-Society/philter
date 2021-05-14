module.exports = {
  webpack: {
    plugins: {
      // We don't need asset-manifest.json
      remove: ['ManifestPlugin'],
    },
  },
};
