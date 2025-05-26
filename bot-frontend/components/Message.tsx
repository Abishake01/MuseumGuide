import React, { useState } from 'react';
import { FaUser, FaRobot, FaCalendarAlt, FaTicketAlt, FaMapMarkerAlt, FaPalette, FaInfoCircle, FaChevronRight, FaDownload } from 'react-icons/fa';
import { Dialog } from '@headlessui/react';
import qr from './abi.png';

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
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    ticketType: 'adult',
    quantity: 1,
    date: new Date().toISOString().split('T')[0],
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const [generatedTickets, setGeneratedTickets] = useState<any[]>([]);

  // Helper function to clean and parse AI response
  const parseResponse = (content: string) => {
    // Remove markdown artifacts (e.g., ##, **, ===)
    let cleaned = content.replace(/#+/g, '').replace(/\*\*/g, '').replace(/===/g, '').trim();
    
    // Split into lines
    const lines = cleaned.split('\n').filter(line => line.trim());
    
    // Extract heading (first non-empty line)
    let heading = lines[0] || 'Response';
    let bodyLines = lines.slice(1);
    
    // If the first line looks like a heading (e.g., all caps or followed by a blank line), keep it
    if (lines.length > 1 && (lines[0].toUpperCase() === lines[0] || lines[1].trim() === '')) {
      heading = lines[0].trim();
      bodyLines = lines.slice(lines[1].trim() === '' ? 2 : 1);
    }

    // Parse body into paragraphs or list items
    const body = [];
    let currentParagraph: string[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
        // Handle bullet points
        if (currentParagraph.length) {
          body.push({ type: 'paragraph', text: currentParagraph.join(' ') });
          currentParagraph = [];
        }
        body.push({ type: 'listItem', text: trimmedLine.slice(2).trim() });
      } else if (trimmedLine) {
        // Handle regular text
        currentParagraph.push(trimmedLine);
      } else if (currentParagraph.length) {
        // End of a paragraph
        body.push({ type: 'paragraph', text: currentParagraph.join(' ') });
        currentParagraph = [];
      }
    }
    
    // Push any remaining paragraph
    if (currentParagraph.length) {
      body.push({ type: 'paragraph', text: currentParagraph.join(' ') });
    }

    return { heading, body };
  };

  const renderContent = () => {
    const lowerContent = message.content.toLowerCase();

    // Display user messages as plain text
    if (isUser) {
      return (
        <div className="text-gray-700 whitespace-pre-wrap">
          {message.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-2">{paragraph}</p>
          ))}
        </div>
      );
    }

    // Handle booking confirmation
    if (message.type === 'booking' && message.bookingDetails) {
      return (
        <div className="space-y-4">
          <div className="flex items-start">
            <FaTicketAlt className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Booking Confirmation</h3>
              <p className="text-gray-700 mb-4">
                You're booking {message.bookingDetails.tickets} ticket{message.bookingDetails.tickets > 1 ? 's' : ''} for {message.bookingDetails.date} at {message.bookingDetails.time}.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">Exhibition Details</h4>
                <p className="text-gray-700">{message.bookingDetails.exhibition}</p>
              </div>
              
              <div className="flex justify-center p-4 bg-white rounded-lg border border-gray-200">
                <img src="/images/qr-code.png" alt="QR Code" className="w-32 h-32" />
              </div>
              
              <p className="text-sm text-gray-500 mt-3">Please present this QR code at the museum entrance.</p>
            </div>
          </div>
        </div>
      );
    }

    // Parse AI response
    const { heading, body } = parseResponse(message.content);

    // Determine icon based on message type or content
    let Icon = FaInfoCircle;
    let iconColor = 'text-blue-500';
    if (message.type === 'ticket' || lowerContent.includes('ticket price') || lowerContent.includes('how much are tickets')) {
      Icon = FaTicketAlt;
      iconColor = 'text-green-500';
    } else if (message.type === 'event' || lowerContent.includes('upcoming event') || lowerContent.includes('what events') || lowerContent.includes('event details')) {
      Icon = FaCalendarAlt;
      iconColor = 'text-purple-500';
    } else if (message.type === 'guide' || lowerContent.includes('guided tour') || lowerContent.includes('tour guide')) {
      Icon = FaMapMarkerAlt;
      iconColor = 'text-purple-500';
    }

    // Determine if "Book Now" button should be shown
    const showBookingButton = (
      message.type === 'ticket' ||
      message.type === 'event' ||
      message.type === 'guide' ||
      message.type === 'exhibition' ||
      lowerContent.includes('ticket price') ||
      lowerContent.includes('how much are tickets') 
    );

    return (
      <div className="space-y-4">
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          {body.map((item, index) => (
            <div key={index} className="mb-2">
              {item.type === 'listItem' ? (
                <div className="flex items-start">
                  <span className="text-gray-700 mr-2">•</span>
                  <p className="text-gray-700">{item.text}</p>
                </div>
              ) : (
                <p className="text-gray-700">{item.text}</p>
              )}
            </div>
          ))}
          {showBookingButton && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <button
                onClick={() => setIsBookingOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {message.type === 'guide' || lowerContent.includes('guided tour') || lowerContent.includes('tour guide') ? 'Book Tour' : 'Book Tickets'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (bookingStep === 1) {
      setBookingStep(2);
    } else if (bookingStep === 2) {
      setIsProcessing(true);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate mock tickets
      const tickets = [];
      for (let i = 0; i < bookingData.quantity; i++) {
        tickets.push({
          id: `ticket-${Math.random().toString(36).substr(2, 9)}`,
          type: bookingData.ticketType,
          date: bookingData.date,
          price: bookingData.ticketType === 'adult' ? 20 : 
                bookingData.ticketType === 'child' ? 10 : 0
        });
      }
      
      setGeneratedTickets(tickets);
      setBookingStep(3);
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const downloadQRCode = (ticketId: string) => {
    const link = document.createElement('a');
    link.href = '/images/qr-code.png';
    link.download = `museum-ticket-${ticketId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

      {/* Booking Dialog */}
      <Dialog open={isBookingOpen} onClose={() => {
        setIsBookingOpen(false);
        setBookingStep(1);
        setGeneratedTickets([]);
        setIsProcessing(false);
      }} className="fixed z-10 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
          <div className="relative bg-white rounded-lg max-w-md w-full p-6 mx-4">
            <Dialog.Title className="text-xl font-bold text-gray-800 mb-4">
              {bookingStep === 1 ? 'Book Tickets' : 
               bookingStep === 2 ? 'Payment Information' : 
               'Booking Confirmation'}
            </Dialog.Title>

            {bookingStep === 1 && (
              <form onSubmit={handleBookingSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={bookingData.name}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={bookingData.email}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={bookingData.phone}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visit Date</label>
                    <input
                      type="date"
                      name="date"
                      value={bookingData.date}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Type</label>
                    <select
                      name="ticketType"
                      value={bookingData.ticketType}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    >
                      <option value="adult">Adult ($20)</option>
                      <option value="child">Child 5-12 ($10)</option>
                      <option value="under5">Under 5 (Free)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      max="10"
                      value={bookingData.quantity}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Next <FaChevronRight className="inline ml-1" />
                  </button>
                </div>
              </form>
            )}

            {bookingStep === 2 && (
              <form onSubmit={handleBookingSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="4242 4242 4242 4242"
                      value={bookingData.cardNumber}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        name="expiry"
                        placeholder="MM/YY"
                        value={bookingData.expiry}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        placeholder="123"
                        value={bookingData.cvv}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setBookingStep(1)}
                    className="px-4 py-2 border border-gray-300 rounded"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded flex items-center justify-center"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Pay Now'
                    )}
                  </button>
                </div>
              </form>
            )}

            {bookingStep === 3 && (
              <div>
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <h3 className="font-bold text-green-800 mb-2">Booking Confirmed!</h3>
                  <p className="text-gray-700">Your tickets have been booked successfully. A confirmation has been sent to {bookingData.email}.</p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800">Your Tickets</h4>
                  {generatedTickets.map((ticket, i) => (
                    <div key={i} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <span className="font-medium">Ticket #{i + 1}</span>
                          <p className="text-sm text-gray-500 capitalize">{ticket.type} ticket</p>
                        </div>
                        <span className="font-bold text-lg">{ticket.price === 0 ? 'Free' : `$${ticket.price.toFixed(2)}`}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <p className="text-gray-500">Date</p>
                          <p className="font-medium">{ticket.date}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Booking Ref</p>
                          <p className="font-medium">{ticket.id.substring(0, 8)}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex flex-col items-center">
                        <div className="p-2 bg-white border border-gray-200 rounded mb-2">
                          <img src={qr.src} alt="QR Code" className="w-32 h-32" />
                        </div>
                        <button
                          onClick={() => downloadQRCode(ticket.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                        >
                          <FaDownload className="mr-1" /> Download QR Code
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setIsBookingOpen(false);
                      setBookingStep(1);
                      setGeneratedTickets([]);
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Message;