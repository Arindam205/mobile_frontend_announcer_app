// src/utils/networkUtils.js
import NetInfo from '@react-native-community/netinfo';

export class NetworkMonitor {
  static async checkConnectivity() {
    try {
      const state = await NetInfo.fetch();
      return {
        isConnected: state.isConnected,
        type: state.type,
        isWifi: state.type === 'wifi',
        isCellular: state.type === 'cellular',
        details: state.details
      };
    } catch (error) {
      console.error('Network check failed:', error);
      return { isConnected: false };
    }
  }

  static async testStreamConnectivity(streamUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(streamUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'RAISE-RadioApp/3.0',
          'Accept': 'application/vnd.apple.mpegurl',
        }
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.error('Stream connectivity test failed:', error);
      return false;
    }
  }

  static async testApiConnectivity(apiUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.error('API connectivity test failed:', error);
      return false;
    }
  }
}

export class StreamValidator {
  static validateHLSUrl(url) {
    const hlsPattern = /^https?:\/\/.+\.(m3u8|m3u)(\?.*)?$/i;
    return hlsPattern.test(url);
  }

  static async checkStreamHealth(streamUrl) {
    try {
      if (!this.validateHLSUrl(streamUrl)) {
        throw new Error('Invalid HLS URL format');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(streamUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'RAISE-RadioApp/3.0',
          'Accept': 'application/vnd.apple.mpegurl, */*',
          'Cache-Control': 'no-cache',
        }
      });

      clearTimeout(timeoutId);

      return {
        isHealthy: response.ok,
        status: response.status,
        contentType: response.headers.get('content-type'),
        lastModified: response.headers.get('last-modified'),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        isHealthy: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  static isStreamError(error) {
    const streamErrorIndicators = [
      'ERR_NETWORK_CHANGED',
      'ERR_INTERNET_DISCONNECTED',
      'ERR_CONNECTION_REFUSED',
      'ERR_CONNECTION_TIMED_OUT',
      'ENOTFOUND',
      'ECONNREFUSED',
      'ETIMEDOUT'
    ];
    
    return streamErrorIndicators.some(indicator => 
      error.message && error.message.includes(indicator)
    );
  }
}