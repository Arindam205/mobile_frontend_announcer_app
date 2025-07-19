// // src/utils/urlHandler.js
// import * as Linking from 'expo-linking';
// import { StreamValidator } from './networkUtils';

// export class URLHandler {
//   static trustedDomains = [
//     'air.pc.cdn.bitgravity.com',
//     'akashvani.gov.in',
//     'bitgravity.com',
//     'cdn.bitgravity.com'
//   ];

//   static validateIncomingURL(url) {
//     try {
//       // Handle custom scheme URLs
//       if (url.startsWith('raise://') || url.startsWith('com.subhra.raiseapp://')) {
//         return { isValid: true, type: 'custom_scheme' };
//       }

//       const parsedURL = new URL(url);
      
//       // Only allow HTTPS for external URLs
//       if (parsedURL.protocol !== 'https:') {
//         console.warn('[URLHandler] Blocked non-HTTPS URL:', url);
//         return { isValid: false, reason: 'Non-HTTPS URL not allowed' };
//       }
      
//       // Validate against trusted domains
//       if (!this.trustedDomains.includes(parsedURL.hostname)) {
//         console.warn('[URLHandler] Blocked untrusted domain:', parsedURL.hostname);
//         return { isValid: false, reason: 'Untrusted domain' };
//       }
      
//       // Check if it's a valid HLS stream
//       if (StreamValidator.validateHLSUrl(url)) {
//         return { isValid: true, type: 'hls_stream' };
//       }
      
//       return { isValid: true, type: 'web_link' };
//     } catch (error) {
//       console.error('[URLHandler] Invalid URL:', url, error);
//       return { isValid: false, reason: 'Invalid URL format' };
//     }
//   }

//   static parseCustomSchemeURL(url) {
//     try {
//       const parsedURL = Linking.parse(url);
      
//       return {
//         scheme: parsedURL.scheme,
//         hostname: parsedURL.hostname,
//         path: parsedURL.path,
//         queryParams: parsedURL.queryParams || {}
//       };
//     } catch (error) {
//       console.error('[URLHandler] Error parsing custom scheme URL:', error);
//       return null;
//     }
//   }

//   static createDeepLink(action, params = {}) {
//     const baseURL = 'raise://';
//     const queryString = new URLSearchParams(params).toString();
    
//     return `${baseURL}${action}${queryString ? `?${queryString}` : ''}`;
//   }

//   // Handle different types of incoming URLs
//   static async handleIncomingURL(url, radioController) {
//     console.log('[URLHandler] Processing incoming URL:', url);
    
//     const validation = this.validateIncomingURL(url);
    
//     if (!validation.isValid) {
//       console.warn(`[URLHandler] Rejected URL: ${validation.reason}`);
//       return false;
//     }

//     try {
//       switch (validation.type) {
//         case 'custom_scheme':
//           return await this.handleCustomScheme(url, radioController);
        
//         case 'hls_stream':
//           return await this.handleHLSStream(url, radioController);
        
//         case 'web_link':
//           return await this.handleWebLink(url, radioController);
        
//         default:
//           console.warn('[URLHandler] Unknown URL type');
//           return false;
//       }
//     } catch (error) {
//       console.error('[URLHandler] Error handling URL:', error);
//       return false;
//     }
//   }

//   static async handleCustomScheme(url, radioController) {
//     const parsed = this.parseCustomSchemeURL(url);
    
//     if (!parsed) return false;

//     console.log('[URLHandler] Handling custom scheme:', parsed);

//     // Handle different custom scheme actions
//     switch (parsed.path) {
//       case 'play':
//         if (radioController && typeof radioController.play === 'function') {
//           await radioController.play();
//           return true;
//         }
//         break;
      
//       case 'stop':
//         if (radioController && typeof radioController.stop === 'function') {
//           await radioController.stop();
//           return true;
//         }
//         break;
      
//       case 'station':
//         const stationId = parsed.queryParams.stationId;
//         if (stationId && radioController && typeof radioController.switchStation === 'function') {
//           await radioController.switchStation(stationId);
//           return true;
//         }
//         break;
      
//       case 'stream':
//         const streamUrl = decodeURIComponent(parsed.queryParams.streamUrl || '');
//         if (streamUrl && radioController && typeof radioController.playCustomStream === 'function') {
//           await radioController.playCustomStream(streamUrl);
//           return true;
//         }
//         break;
      
//       default:
//         console.log('[URLHandler] Unknown custom scheme path:', parsed.path);
//     }

//     return false;
//   }

//   static async handleHLSStream(url, radioController) {
//     console.log('[URLHandler] Handling HLS stream:', url);
    
//     // Validate stream health before attempting to play
//     const health = await StreamValidator.checkStreamHealth(url);
    
//     if (!health.isHealthy) {
//       console.warn('[URLHandler] Stream is not healthy:', health);
//       return false;
//     }

//     if (radioController && typeof radioController.playCustomStream === 'function') {
//       await radioController.playCustomStream(url);
//       return true;
//     }

//     return false;
//   }

//   static async handleWebLink(url, radioController) {
//     console.log('[URLHandler] Handling web link:', url);
    
//     // Extract meaningful information from web links
//     // This is where you'd implement logic to parse your website URLs
//     // and convert them to appropriate actions
    
//     return false; // Implement based on your web link structure
//   }

//   // Generate sharing URLs
//   static generateShareURL(type, data) {
//     switch (type) {
//       case 'station':
//         return this.createDeepLink('station', { 
//           stationId: data.stationId,
//           autoplay: data.autoplay || false 
//         });
      
//       case 'stream':
//         return this.createDeepLink('stream', { 
//           streamUrl: encodeURIComponent(data.streamUrl),
//           autoplay: data.autoplay || false 
//         });
      
//       default:
//         return this.createDeepLink('play');
//     }
//   }
// }

// // Integration with your radio component
// export const createRadioURLHandler = (radioComponent) => {
//   return {
//     play: async () => {
//       if (radioComponent.current && typeof radioComponent.current.handlePlay === 'function') {
//         await radioComponent.current.handlePlay();
//       }
//     },
    
//     stop: async () => {
//       if (radioComponent.current && typeof radioComponent.current.handleStop === 'function') {
//         await radioComponent.current.handleStop();
//       }
//     },
    
//     switchStation: async (stationId) => {
//       // Implement station switching logic based on your app's structure
//       console.log('[URLHandler] Switching to station:', stationId);
//     },
    
//     playCustomStream: async (streamUrl) => {
//       if (radioComponent.current && typeof radioComponent.current.playCustomStream === 'function') {
//         await radioComponent.current.playCustomStream(streamUrl);
//       }
//     }
//   };
// };

// src/utils/urlHandler.js
import * as Linking from 'expo-linking';
import { StreamValidator } from './networkUtils';

export class URLHandler {
  static trustedDomains = [
    'air.pc.cdn.bitgravity.com',
    'akashvani.gov.in',
    'bitgravity.com',
    'cdn.bitgravity.com'
  ];

  static validateIncomingURL(url) {
    try {
      // Ignore TrackPlayer notification URLs - these don't need navigation
      if (url.startsWith('trackplayer://')) {
        console.log('[URLHandler] Ignoring TrackPlayer notification URL:', url);
        return { isValid: false, reason: 'TrackPlayer notification - no action needed', shouldIgnore: true };
      }

      // Handle custom scheme URLs
      if (url.startsWith('raise://') || url.startsWith('com.subhra.raiseapp://')) {
        return { isValid: true, type: 'custom_scheme' };
      }

      const parsedURL = new URL(url);
      
      // Only allow HTTPS for external URLs
      if (parsedURL.protocol !== 'https:') {
        console.warn('[URLHandler] Blocked non-HTTPS URL:', url);
        return { isValid: false, reason: 'Non-HTTPS URL not allowed' };
      }
      
      // Validate against trusted domains
      if (!this.trustedDomains.includes(parsedURL.hostname)) {
        console.warn('[URLHandler] Blocked untrusted domain:', parsedURL.hostname);
        return { isValid: false, reason: 'Untrusted domain' };
      }
      
      // Check if it's a valid HLS stream
      if (StreamValidator.validateHLSUrl(url)) {
        return { isValid: true, type: 'hls_stream' };
      }
      
      return { isValid: true, type: 'web_link' };
    } catch (error) {
      console.error('[URLHandler] Invalid URL:', url, error);
      return { isValid: false, reason: 'Invalid URL format' };
    }
  }

  static parseCustomSchemeURL(url) {
    try {
      const parsedURL = Linking.parse(url);
      
      return {
        scheme: parsedURL.scheme,
        hostname: parsedURL.hostname,
        path: parsedURL.path,
        queryParams: parsedURL.queryParams || {}
      };
    } catch (error) {
      console.error('[URLHandler] Error parsing custom scheme URL:', error);
      return null;
    }
  }

  static createDeepLink(action, params = {}) {
    const baseURL = 'raise://';
    const queryString = new URLSearchParams(params).toString();
    
    return `${baseURL}${action}${queryString ? `?${queryString}` : ''}`;
  }

  // Handle different types of incoming URLs
  static async handleIncomingURL(url, radioController) {
    console.log('[URLHandler] Processing incoming URL:', url);
    
    const validation = this.validateIncomingURL(url);
    
    if (!validation.isValid) {
      // If it's a TrackPlayer URL that should be ignored, don't log as warning
      if (validation.shouldIgnore) {
        return false; // Silently ignore
      }
      console.warn(`[URLHandler] Rejected URL: ${validation.reason}`);
      return false;
    }

    try {
      switch (validation.type) {
        case 'custom_scheme':
          return await this.handleCustomScheme(url, radioController);
        
        case 'hls_stream':
          return await this.handleHLSStream(url, radioController);
        
        case 'web_link':
          return await this.handleWebLink(url, radioController);
        
        default:
          console.warn('[URLHandler] Unknown URL type');
          return false;
      }
    } catch (error) {
      console.error('[URLHandler] Error handling URL:', error);
      return false;
    }
  }

  static async handleCustomScheme(url, radioController) {
    const parsed = this.parseCustomSchemeURL(url);
    
    if (!parsed) return false;

    console.log('[URLHandler] Handling custom scheme:', parsed);

    // Handle different custom scheme actions
    switch (parsed.path) {
      case 'play':
        if (radioController && typeof radioController.play === 'function') {
          await radioController.play();
          return true;
        }
        break;
      
      case 'stop':
        if (radioController && typeof radioController.stop === 'function') {
          await radioController.stop();
          return true;
        }
        break;
      
      case 'station':
        const stationId = parsed.queryParams.stationId;
        if (stationId && radioController && typeof radioController.switchStation === 'function') {
          await radioController.switchStation(stationId);
          return true;
        }
        break;
      
      case 'stream':
        const streamUrl = decodeURIComponent(parsed.queryParams.streamUrl || '');
        if (streamUrl && radioController && typeof radioController.playCustomStream === 'function') {
          await radioController.playCustomStream(streamUrl);
          return true;
        }
        break;
      
      default:
        console.log('[URLHandler] Unknown custom scheme path:', parsed.path);
    }

    return false;
  }

  static async handleHLSStream(url, radioController) {
    console.log('[URLHandler] Handling HLS stream:', url);
    
    // Validate stream health before attempting to play
    const health = await StreamValidator.checkStreamHealth(url);
    
    if (!health.isHealthy) {
      console.warn('[URLHandler] Stream is not healthy:', health);
      return false;
    }

    if (radioController && typeof radioController.playCustomStream === 'function') {
      await radioController.playCustomStream(url);
      return true;
    }

    return false;
  }

  static async handleWebLink(url, radioController) {
    console.log('[URLHandler] Handling web link:', url);
    
    // Extract meaningful information from web links
    // This is where you'd implement logic to parse your website URLs
    // and convert them to appropriate actions
    
    return false; // Implement based on your web link structure
  }

  // Generate sharing URLs
  static generateShareURL(type, data) {
    switch (type) {
      case 'station':
        return this.createDeepLink('station', { 
          stationId: data.stationId,
          autoplay: data.autoplay || false 
        });
      
      case 'stream':
        return this.createDeepLink('stream', { 
          streamUrl: encodeURIComponent(data.streamUrl),
          autoplay: data.autoplay || false 
        });
      
      default:
        return this.createDeepLink('play');
    }
  }
}

// Integration with your radio component
export const createRadioURLHandler = (radioComponent) => {
  return {
    play: async () => {
      if (radioComponent.current && typeof radioComponent.current.handlePlay === 'function') {
        await radioComponent.current.handlePlay();
      }
    },
    
    stop: async () => {
      if (radioComponent.current && typeof radioComponent.current.handleStop === 'function') {
        await radioComponent.current.handleStop();
      }
    },
    
    switchStation: async (stationId) => {
      // Implement station switching logic based on your app's structure
      console.log('[URLHandler] Switching to station:', stationId);
    },
    
    playCustomStream: async (streamUrl) => {
      if (radioComponent.current && typeof radioComponent.current.playCustomStream === 'function') {
        await radioComponent.current.playCustomStream(streamUrl);
      }
    }
  };
};