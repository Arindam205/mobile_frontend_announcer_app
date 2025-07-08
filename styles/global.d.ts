// global.d.ts - Add this file to your project root or src/types/

declare global {
  var trackPlayerServiceControls: {
    stopFromApp: () => Promise<void>;
    startStream: () => Promise<void>;
  } | undefined;
}

// Ensure this file is treated as a module
export {};