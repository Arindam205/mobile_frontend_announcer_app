// src/utils/networkUtils.js - Enhanced for live radio streaming
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
        details: state.details,
        effectiveType: state.details?.effectiveType || 'unknown'
      };
    } catch (error) {
      console.error('Network check failed:', error);
      return { isConnected: false };
    }
  }

  static async testStreamConnectivity(streamUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // Reduced timeout for live streams

      const response = await fetch(streamUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'RAISE-RadioApp/3.0 (Android; Live-Radio)',
          'Accept': 'application/vnd.apple.mpegurl, audio/x-mpegurl, audio/mpegurl, */*',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Connection': 'keep-alive'
        }
      });

      clearTimeout(timeoutId);
      return {
        isConnected: response.ok,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error) {
      console.error('Stream connectivity test failed:', error);
      return { isConnected: false, error: error.message };
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
          'User-Agent': 'RAISE-RadioApp/3.0'
        }
      });

      clearTimeout(timeoutId);
      return {
        isConnected: response.ok,
        status: response.status
      };
    } catch (error) {
      console.error('API connectivity test failed:', error);
      return { isConnected: false, error: error.message };
    }
  }
}

export class StreamValidator {
  // Enhanced HLS URL validation for radio streams
  static validateHLSUrl(url) {
    if (!url || typeof url !== 'string') {
      return false;
    }

    // Enhanced HLS pattern for live radio streams
    const hlsPatterns = [
      /^https?:\/\/.+\.(m3u8|m3u)(\?.*)?$/i, // Standard HLS
      /^https?:\/\/.+\/playlist\.m3u8(\?.*)?$/i, // Playlist format
      /^https?:\/\/.+\/chunklist\.m3u8(\?.*)?$/i, // Chunklist format
      /^https?:\/\/.+\/index\.m3u8(\?.*)?$/i, // Index format
      /^https?:\/\/.+\/media\.m3u8(\?.*)?$/i, // Media format
      /^https?:\/\/.+\/stream\.m3u8(\?.*)?$/i // Stream format
    ];

    return hlsPatterns.some(pattern => pattern.test(url));
  }

  // Enhanced stream health check specifically for live radio
  static async checkStreamHealth(streamUrl) {
    try {
      if (!this.validateHLSUrl(streamUrl)) {
        throw new Error('Invalid HLS URL format for radio stream');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      console.log(`[StreamValidator] Checking health of: ${streamUrl}`);

      // Enhanced headers for live radio streaming
      const response = await fetch(streamUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'RAISE-RadioApp/3.0 (Android; Live-Radio-Optimized)',
          'Accept': 'application/vnd.apple.mpegurl, audio/x-mpegurl, audio/mpegurl, application/x-mpegURL, */*',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Connection': 'keep-alive',
          'Range': 'bytes=0-1024' // Test partial content support
        }
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type') || '';
      const contentLength = response.headers.get('content-length');
      const lastModified = response.headers.get('last-modified');
      const cacheControl = response.headers.get('cache-control');

      // Validate content type for HLS streams
      const validContentTypes = [
        'application/vnd.apple.mpegurl',
        'application/x-mpegurl',
        'audio/x-mpegurl',
        'audio/mpegurl',
        'text/plain'
      ];

      const hasValidContentType = validContentTypes.some(type => 
        contentType.toLowerCase().includes(type)
      );

      // Additional checks for live streams
      const isLiveStream = !contentLength || contentLength === '0' || 
                          (cacheControl && cacheControl.includes('no-cache'));

      const healthResult = {
        isHealthy: response.ok && (hasValidContentType || response.status === 200),
        status: response.status,
        contentType: contentType,
        lastModified: lastModified,
        timestamp: new Date().toISOString(),
        isLiveStream: isLiveStream,
        supportedFeatures: {
          partialContent: response.status === 206,
          keepAlive: response.headers.get('connection')?.includes('keep-alive'),
          chunkedTransfer: response.headers.get('transfer-encoding')?.includes('chunked')
        }
      };

      console.log(`[StreamValidator] Health check result:`, healthResult);
      return healthResult;

    } catch (error) {
      console.error(`[StreamValidator] Health check failed:`, error);
      
      let errorType = 'unknown';
      if (error.name === 'AbortError') {
        errorType = 'timeout';
      } else if (error.message.includes('Network')) {
        errorType = 'network';
      } else if (error.message.includes('CORS')) {
        errorType = 'cors';
      }

      return {
        isHealthy: false,
        error: error.message,
        errorType: errorType,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Enhanced method to check multiple stream variants
  static async checkMultipleStreams(streamUrls) {
    const results = {};
    
    for (const [key, url] of Object.entries(streamUrls)) {
      console.log(`[StreamValidator] Checking ${key}: ${url}`);
      results[key] = await this.checkStreamHealth(url);
      
      // Small delay between checks to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return results;
  }

  // Get the best available stream based on health checks
  static getBestStream(healthResults) {
    const healthyStreams = Object.entries(healthResults)
      .filter(([_, result]) => result.isHealthy)
      .sort(([_, a], [__, b]) => {
        // Prioritize by status code and features
        if (a.status !== b.status) {
          return a.status === 200 ? -1 : 1;
        }
        
        // Prefer streams with better feature support
        const aFeatures = Object.values(a.supportedFeatures || {}).filter(Boolean).length;
        const bFeatures = Object.values(b.supportedFeatures || {}).filter(Boolean).length;
        
        return bFeatures - aFeatures;
      });

    return healthyStreams.length > 0 ? healthyStreams[0] : null;
  }

  // Enhanced error detection for live radio streams
  static isStreamError(error) {
    const streamErrorIndicators = [
      // Network errors
      'ERR_NETWORK_CHANGED',
      'ERR_INTERNET_DISCONNECTED', 
      'ERR_CONNECTION_REFUSED',
      'ERR_CONNECTION_TIMED_OUT',
      'ENOTFOUND',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ECONNRESET',
      
      // Stream-specific errors
      'android-parsing-container-unsupported',
      'parsing-container-unsupported',
      'source-error',
      'media-source-error',
      'hls-parser-error',
      'segment-loading-error',
      'manifest-loading-error',
      
      // ExoPlayer specific errors
      'exoplayer-error',
      'decoder-error',
      'renderer-error',
      'drm-error',
      
      // HTTP errors that indicate stream issues
      'http-error-404',
      'http-error-403',
      'http-error-500',
      'http-error-502',
      'http-error-503'
    ];
    
    if (!error || !error.message) {
      return false;
    }
    
    const errorMessage = error.message.toLowerCase();
    const errorCode = error.code?.toLowerCase() || '';
    
    return streamErrorIndicators.some(indicator => 
      errorMessage.includes(indicator.toLowerCase()) ||
      errorCode.includes(indicator.toLowerCase())
    );
  }

  // Check if error is recoverable
  static isRecoverableError(error) {
    const recoverableErrors = [
      'network',
      'timeout',
      'connection-refused',
      'temporary-unavailable',
      '502', '503', '504' // Temporary server errors
    ];
    
    const nonRecoverableErrors = [
      'android-parsing-container-unsupported',
      'parsing-container-unsupported',
      'decoder-error',
      'drm-error',
      '404', '403', '401' // Client errors
    ];
    
    if (!error || !error.message) {
      return false;
    }
    
    const errorMessage = error.message.toLowerCase();
    const errorCode = error.code?.toLowerCase() || '';
    
    // Check if it's explicitly non-recoverable
    if (nonRecoverableErrors.some(indicator => 
      errorMessage.includes(indicator) || errorCode.includes(indicator))) {
      return false;
    }
    
    // Check if it's recoverable
    return recoverableErrors.some(indicator => 
      errorMessage.includes(indicator) || errorCode.includes(indicator));
  }

  // Enhanced manifest validation for HLS streams
  static async validateHLSManifest(manifestUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(manifestUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'RAISE-RadioApp/3.0 (Android; Manifest-Validator)',
          'Accept': 'application/vnd.apple.mpegurl, text/plain, */*',
          'Cache-Control': 'no-cache'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const manifestText = await response.text();
      
      // Basic HLS manifest validation
      const hasM3UHeader = manifestText.includes('#EXTM3U');
      const hasVersion = manifestText.includes('#EXT-X-VERSION');
      const hasTargetDuration = manifestText.includes('#EXT-X-TARGETDURATION');
      const hasMediaSequence = manifestText.includes('#EXT-X-MEDIA-SEQUENCE');
      
      // Check for live stream indicators
      const isLive = !manifestText.includes('#EXT-X-ENDLIST');
      const hasSegments = manifestText.split('\n').some(line => 
        line.trim() && !line.startsWith('#') && (line.includes('.ts') || line.includes('.m4s'))
      );

      return {
        isValid: hasM3UHeader && hasTargetDuration,
        isLive: isLive,
        hasSegments: hasSegments,
        features: {
          hasVersion: hasVersion,
          hasMediaSequence: hasMediaSequence,
          segmentCount: (manifestText.match(/#EXTINF:/g) || []).length
        },
        manifestContent: manifestText.substring(0, 500) // First 500 chars for debugging
      };

    } catch (error) {
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  // Test stream playability without actually playing
  static async testStreamPlayability(streamUrl) {
    try {
      // First check basic health
      const healthCheck = await this.checkStreamHealth(streamUrl);
      if (!healthCheck.isHealthy) {
        return {
          isPlayable: false,
          reason: 'Stream health check failed',
          details: healthCheck
        };
      }

      // Then validate the manifest
      const manifestCheck = await this.validateHLSManifest(streamUrl);
      if (!manifestCheck.isValid) {
        return {
          isPlayable: false,
          reason: 'Invalid HLS manifest',
          details: manifestCheck
        };
      }

      return {
        isPlayable: true,
        streamType: manifestCheck.isLive ? 'live' : 'vod',
        features: manifestCheck.features,
        health: healthCheck
      };

    } catch (error) {
      return {
        isPlayable: false,
        reason: 'Playability test failed',
        error: error.message
      };
    }
  }
}