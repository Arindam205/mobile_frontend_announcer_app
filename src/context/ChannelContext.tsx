import React, { createContext, useContext, useState } from 'react';

// Define the Channel interface
export interface Channel {
  channelId: number;
  channelName: string;
  frequencyDetails: string;
  description: string;
  stationId?: number | string; // Add stationId as optional
}

// Define what data will be available in the context
interface ChannelContextData {
  selectedChannel: Channel | null;
  stationName: string;
  setSelectedChannelData: (channel: Channel, stationName: string) => void;
  clearSelectedChannel: () => void;
}

// Create the context with default values
const ChannelContext = createContext<ChannelContextData>({
  selectedChannel: null,
  stationName: '',
  setSelectedChannelData: () => {},
  clearSelectedChannel: () => {},
});

// Create a provider component
export const ChannelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [stationName, setStationName] = useState<string>('');

  // Function to set both the channel and station name with validation
  const setSelectedChannelData = (channel: Channel, name: string) => {
    try {
      console.log("[ChannelContext] Setting channel data:", {
        channelId: channel.channelId,
        channelName: channel.channelName,
        stationName: name,
        stationId: channel.stationId
      });
      
      // Validate channel data
      if (!channel || typeof channel.channelId !== 'number') {
        console.error("[ChannelContext] Invalid channel data:", channel);
        return;
      }
      
      // Create a safe copy of the channel
      const safeChannel: Channel = {
        channelId: channel.channelId,
        channelName: channel.channelName || 'Unknown Channel',
        frequencyDetails: channel.frequencyDetails || '',
        description: channel.description || '',
        stationId: channel.stationId // Make sure we keep the stationId if it exists
      };
      
      // Update state
      setSelectedChannel(safeChannel);
      setStationName(name || '');
      
      console.log("[ChannelContext] Channel context updated successfully");
    } catch (error) {
      console.error("[ChannelContext] Error setting channel data:", error);
    }
  };

  // Function to clear the selected channel
  const clearSelectedChannel = () => {
    console.log("[ChannelContext] Clearing channel data");
    setSelectedChannel(null);
    setStationName('');
  };

  return (
    <ChannelContext.Provider
      value={{
        selectedChannel,
        stationName,
        setSelectedChannelData,
        clearSelectedChannel
      }}
    >
      {children}
    </ChannelContext.Provider>
  );
};

// Create a hook to use the channel context
export const useChannel = () => {
  const context = useContext(ChannelContext);
  
  if (!context) {
    throw new Error('useChannel must be used within a ChannelProvider');
  }
  
  return context;
};