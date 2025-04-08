import { ReactNode } from 'react';
import { Animated } from 'react-native';

export interface Channel {
  channelId: string | number;
  channelName: string;
  frequencyDetails?: string;
  stationId?: string;
}

export interface Language {
  languageId: number;
  languageName: string;
  micAnimation: Animated.Value;
}

export interface RatingOption {
  id: 'announcer' | 'program';
  title: string;
  description: string;
  icon: ReactNode;
  image: any;
}