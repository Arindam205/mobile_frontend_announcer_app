const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs-extra');
const path = require('path');

module.exports = function withNetworkSecurityConfig(config) {
  // Inject network security config reference into AndroidManifest.xml
  config = withAndroidManifest(config, (cfg) => {
    const app = cfg.modResults.manifest.application[0];
    app.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    app.$['android:usesCleartextTraffic'] = 'true';
    return cfg;
  });

  // Copy the XML file to the correct location during the Android build
  config = withDangerousMod(config, [
    'android',
    async (cfg) => {
      const src = path.resolve('./network_security_config.xml');
      const dest = path.join(
        cfg.modRequest.platformProjectRoot,
        'app/src/main/res/xml/network_security_config.xml'
      );

      await fs.ensureDir(path.dirname(dest));
      await fs.copy(src, dest);

      return cfg;
    },
  ]);

  return config;
};
