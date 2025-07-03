// src/utils/debugLogger.js
import {logger} from 'react-native-flipper';

export const debugLog = {
  info: (message, data) => {
    if (__DEV__) {
      console.log(message, data);
      try {
        logger.info(message, data);
      } catch (error) {
        // Flipper might not be connected
      }
    }
  },
  error: (message, error) => {
    if (__DEV__) {
      console.error(message, error);
      try {
        logger.error(message, error);
      } catch (err) {
        // Flipper might not be connected
      }
    }
  },
  warn: (message, data) => {
    if (__DEV__) {
      console.warn(message, data);
      try {
        logger.warn(message, data);
      } catch (error) {
        // Flipper might not be connected
      }
    }
  }
};