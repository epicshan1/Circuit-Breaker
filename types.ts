
export interface Step {
  title: string;
  content: string;
  duration: number;
}

export interface AudioGuide {
  time: number;
  text: string;
}

export interface Protocol {
  id: string;
  title: string;
  icon: string;
  description: string;
  fullTitle: string;
  duration: number;
  explanation: string;
  hasBreathing: boolean;
  steps: Step[];
  audioGuide: AudioGuide[];
}

export interface JournalEntry {
  id: string;
  date: string;
  protocol: string;
  text: string;
  audioTranscription?: boolean;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  email: string;
  message: string;
}

export interface Profile {
  name: string;
  email: string;
  bio: string;
}

export interface Preferences {
  notifications: boolean;
  haptics: boolean;
  audioVolume: number;
  audioEnabled: boolean;
}

export interface AppState {
  usage: Record<string, number>;
  journal: JournalEntry[];
  favorites: string[];
  emergencyContact?: EmergencyContact;
  profile?: Profile;
  preferences?: Preferences;
}
