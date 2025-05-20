import React from 'react';
import { Message as MessageType } from '@/types/chat';
import { FaUser, FaRobot } from 'react-icons/fa';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-500' : 'bg-gray-500'}`}>
          {isUser ? <FaUser className="text-white" /> : <FaRobot className="text-white" />}
        </div>
        <div className={`mx-2 p-3 rounded-lg ${isUser ? 'bg-blue-100' : 'bg-gray-100'}`}>
          <p className="text-sm">{message.content}</p>
          {message.type === 'qr' && message.data?.qrCode && (
            <div className="mt-2">
              <img src={message.data.qrCode} alt="QR Code" className="w-32 h-32" />
            </div>
          )}
          {message.type === 'tour-guide' && message.data?.tourGuide && (
            <div className="mt-2">
              <p className="font-semibold">{message.data.tourGuide.name}</p>
              <p className="text-sm text-gray-600">Language: {message.data.tourGuide.language}</p>
              <p className="text-sm text-gray-600">Availability: {message.data.tourGuide.availability}</p>
            </div>
          )}
          {message.type === 'feedback' && message.data?.feedback && (
            <div className="mt-2">
              <p className="text-sm">Rating: {message.data.feedback.rating}/5</p>
              <p className="text-sm">{message.data.feedback.comment}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message; 