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
  name: string;
  messages: (Message | {
        id: string;
        content: string;
        role: "user";
        timestamp: Date;
    })[];
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  sessionId?: string;
} 