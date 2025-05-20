export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'qr' | 'tour-guide' | 'feedback';
  data?: {
    qrCode?: string;
    tourGuide?: {
      name: string;
      language: string;
      availability: string;
    };
    feedback?: {
      rating: number;
      comment: string;
    };
  };
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
} 