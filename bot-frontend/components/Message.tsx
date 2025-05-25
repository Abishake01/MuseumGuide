import React, { useState } from 'react';
import UserMessage from './UserMessage';
import AssistantMessage from './AssistantMessage';
import BookingDialog from './BookingDialog';

interface MessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    type?: 'booking' | 'info' | 'event' | 'ticket' | 'guide' | 'benefits' | 'exhibition';
    bookingDetails?: {
      tickets: number;
      date: string;
      time: string;
      exhibition: string;
    };
  };
  prevMessage?: {
    role: 'user' | 'assistant';
    content: string;
  };
}

const Message: React.FC<MessageProps> = ({ message, prevMessage }) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Determine if "Book Now" button should be shown based on user query
  const showBookingButton = prevMessage?.role === 'user' && (
    message.type === 'ticket' ||
    message.type === 'event' ||
    message.type === 'guide' ||
    message.type === 'exhibition' ||
    prevMessage.content.toLowerCase().includes('ticket') ||
    prevMessage.content.toLowerCase().includes('booking') ||
    prevMessage.content.toLowerCase().includes('book') ||
    prevMessage.content.toLowerCase().includes('event') ||
    prevMessage.content.toLowerCase().includes('tour') ||
    prevMessage.content.toLowerCase().includes('exhibition') ||
    prevMessage.content.toLowerCase().includes('artifacts') ||
    prevMessage.content.toLowerCase().includes('exhibit')
  );

  const isBookingTour = message.type === 'guide' || (
    (prevMessage?.content?.toLowerCase().includes('guided tour') ?? false) ||
    (prevMessage?.content?.toLowerCase().includes('tour guide') ?? false)
  );

  return (
    <>
      {message.role === 'user' ? (
        <UserMessage content={message.content} />
      ) : (
        <AssistantMessage
          content={message.content}
          type={message.type}
          bookingDetails={message.bookingDetails}
          showBookingButton={showBookingButton}
          onOpenBooking={() => setIsBookingOpen(true)}
          isBookingTour={isBookingTour}
        />
      )}

      <BookingDialog
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </>
  );
};

export default Message;