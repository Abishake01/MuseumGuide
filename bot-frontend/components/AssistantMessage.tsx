import React from 'react';
import { FaRobot, FaCalendarAlt, FaTicketAlt, FaMapMarkerAlt, FaPalette, FaInfoCircle } from 'react-icons/fa';
import ParsedContent from './ParsedContent';

interface AssistantMessageProps {
  content: string;
  type?: 'booking' | 'info' | 'event' | 'ticket' | 'guide' | 'benefits' | 'exhibition';
  bookingDetails?: {
    tickets: number;
    date: string;
    time: string;
    exhibition: string;
  };
  showBookingButton: boolean;
  onOpenBooking: () => void;
  isBookingTour: boolean;
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({
  content,
  type,
  bookingDetails,
  showBookingButton,
  onOpenBooking,
  isBookingTour
}) => {
  // Determine icon based on message type
  let Icon = FaInfoCircle;
  let iconColor = 'text-blue-500';
  if (type === 'ticket') {
    Icon = FaTicketAlt;
    iconColor = 'text-green-500';
  } else if (type === 'event') {
    Icon = FaCalendarAlt;
    iconColor = 'text-purple-500';
  } else if (type === 'guide') {
    Icon = FaMapMarkerAlt;
    iconColor = 'text-purple-500';
  } else if (type === 'exhibition') {
    Icon = FaPalette;
    iconColor = 'text-purple-500';
  } else if (type === 'benefits') {
    Icon = FaInfoCircle;
    iconColor = 'text-blue-500';
  }

  // Extract heading from content (first line)
  const lines = content.split('\n').filter(line => line.trim());
  const heading = lines[0]?.trim() || 'Response';

  return (
    <div className="flex justify-start mb-6">
      <div className="flex items-start max-w-[90%] md:max-w-[80%] flex-row">
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-500">
          <FaRobot className="text-white" size={18} />
        </div>
        <div className="mx-3 p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <Icon className={`${iconColor} mr-3`} size={20} />
              <h3 className="font-bold text-xl text-gray-800">{heading}</h3>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              {type === 'booking' && bookingDetails ? (
                <div className="space-y-4">
                  <div className="flex items-start">
                    <FaTicketAlt className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 mb-2">Booking Confirmation</h3>
                      <p className="text-gray-700 text-base font-normal mb-4">
                        You're booking {bookingDetails.tickets} ticket{bookingDetails.tickets > 1 ? 's' : ''} for {bookingDetails.date} at {bookingDetails.time}.
                      </p>

                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Exhibition Details</h4>
                        <p className="text-gray-700 text-base font-normal">{bookingDetails.exhibition}</p>
                      </div>

                      <div className="flex justify-center p-4 bg-white rounded-lg border border-gray-200">
                        <img src="/images/qr-code.png" alt="QR Code" className="w-32 h-32" />
                      </div>

                      <p className="text-sm text-gray-500 mt-3">Please present this QR code at the museum entrance.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <ParsedContent content={content} messageType={type} />
              )}

              {showBookingButton && (
                <div className="mt-6 pt-3 border-t border-gray-200">
                  <button
                    onClick={onOpenBooking}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {isBookingTour ? 'Book Tour' : 'Book Tickets'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantMessage;