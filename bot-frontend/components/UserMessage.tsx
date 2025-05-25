import React from 'react';
import { FaUser } from 'react-icons/fa';

interface UserMessageProps {
  content: string;
}

const UserMessage: React.FC<UserMessageProps> = ({ content }) => {
  return (
    <div className="flex justify-end mb-6">
      <div className="flex items-start max-w-[90%] md:max-w-[80%] flex-row-reverse">
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-blue-500">
          <FaUser className="text-white" size={18} />
        </div>
        <div className="mx-3 p-4 rounded-lg bg-blue-100">
          <div className="text-gray-700 text-base font-normal whitespace-pre-wrap">
            {content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-2">{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMessage;