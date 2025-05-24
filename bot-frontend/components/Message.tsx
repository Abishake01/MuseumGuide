import React from 'react';
import { FaUser, FaRobot, FaCalendarAlt, FaTicketAlt, FaMapMarkerAlt, FaPalette, FaInfoCircle } from 'react-icons/fa';
import QRCode from 'qrcode.react';

interface MessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    type?: 'booking' | 'info' | 'event' | 'ticket';
    bookingDetails?: {
      tickets: number;
      date: string;
      time: string;
      exhibition: string;
    };
  };
}

const message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  const renderContent = () => {
    if (message.type === 'booking') {
      return (
        <div className="space-y-4">
          <div className="flex items-start">
            <FaTicketAlt className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Booking Confirmation</h3>
              <p className="text-gray-700 mb-4">You're booking {message.bookingDetails?.tickets} tickets for {message.bookingDetails?.date} at {message.bookingDetails?.time}.</p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">Exhibition Details</h4>
                <p className="text-gray-700">{message.bookingDetails?.exhibition}</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">Ticket Prices</h4>
                <ul className="space-y-1">
                  <li className="text-gray-700">Adults: $20</li>
                  <li className="text-gray-700">Children (5-12): $10</li>
                  <li className="text-gray-700">Under 5: Free</li>
                </ul>
              </div>
              
              <div className="flex justify-center p-4 bg-white rounded-lg border border-gray-200">
                <QRCode value={`MuseumTicket-${Date.now()}`} size={128} />
              </div>
              
              <p className="text-sm text-gray-500 mt-3">Please present this QR code at the museum entrance.</p>
            </div>
          </div>
        </div>
      );
    }

    if (message.content.includes('Upcoming Events')) {
      const events = [
        {
          title: "The Future of Space Exploration",
          date: "March 15th",
          location: "Upper Level",
          description: "Join us for the opening of our new exhibition featuring the latest developments in space exploration."
        },
        {
          title: "The World of Fashion",
          date: "April 1st",
          location: "Main Gallery",
          description: "Step into the world of high fashion with our new exhibition featuring the latest trends and designs."
        }
      ];

      return (
        <div className="space-y-4">
          <div className="flex items-center mb-4">
            <FaCalendarAlt className="text-purple-500 mr-3" size={20} />
            <h3 className="font-bold text-xl text-gray-800">Upcoming Events</h3>
          </div>
          
          {events.map((event, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-purple-200 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-800">{event.title}</h4>
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                  {event.date}
                </span>
              </div>
              <p className="text-gray-600 mb-2">{event.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Location: {event.location}</span>
                <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                  Learn More →
                </button>
              </div>
            </div>
          ))}
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Book Tickets
            </button>
          </div>
        </div>
      );
    }

    if (message.content.includes('Ticket Prices')) {
      return (
        <div className="space-y-4">
          <div className="flex items-center mb-3">
            <FaTicketAlt className="text-green-500 mr-3" />
            <h3 className="font-bold text-lg text-gray-800">Ticket Prices</h3>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-gray-700">Adults</span>
                <span className="font-medium">$20</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-700">Children (5-12)</span>
                <span className="font-medium">$10</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-700">Children under 5</span>
                <span className="font-medium">Free</span>
              </li>
            </ul>
            
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">Prices are subject to change. Please check our website for the most current information.</p>
            </div>
          </div>
        </div>
      );
    }

    // Default message rendering
    return (
      <div className="text-gray-700 whitespace-pre-wrap">
        {message.content.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-2">{paragraph}</p>
        ))}
      </div>
    );
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex items-start max-w-[90%] md:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-500' : 'bg-gray-500'}`}>
          {isUser ? <FaUser className="text-white" size={18} /> : <FaRobot className="text-white" size={18} />}
        </div>
        <div className={`mx-3 p-4 rounded-lg ${isUser ? 'bg-blue-100' : 'bg-white border border-gray-200 shadow-sm'}`}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default message;