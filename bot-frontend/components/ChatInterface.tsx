import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, 
  FaRobot, 
  FaCalendarAlt, 
  FaTicketAlt, 
  FaMapMarkerAlt, 
  FaPalette,
  FaSearch,
  FaArrowDown,
  FaArrowUp,
  FaTimes,
  FaInfoCircle,
  FaHistory,
  FaBook,
  FaCamera,
  FaLandmark,
  FaChevronRight
} from 'react-icons/fa';
import { BsTicketPerforated, BsExclamationTriangle } from 'react-icons/bs';
import MessageComponent from './Message';
import { sendMessage, checkHealth } from '@/services/api';
import { Message, Conversation } from '@/types/chat';

interface ChatInterfaceProps {
  conversation: Conversation;
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  conversations: Conversation[];
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  onSendMessage: (message: string) => void;
  onRegenerate?: () => void;
  onHighlight?: (text: string) => void;
  onBookTour?: (guideId: string) => void;
  onSubmitFeedback?: (feedback: { rating: number; comment: string }) => void;
}

export default function ChatInterface({ 
  conversation, 
  setConversations,
  conversations,
  isSidebarOpen,
  setIsSidebarOpen,
  onSendMessage,
  onRegenerate,
  onHighlight,
  onBookTour,
  onSubmitFeedback
}: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Museum-themed quick prompts
  const museumPrompts = [
    { 
      title: "Current Exhibitions", 
      description: "What exhibitions are currently showing?", 
      icon: <FaPalette className="text-purple-500" />
    },
    { 
      title: "Upcoming Events", 
      description: "What special events are coming up?", 
      icon: <FaCalendarAlt className="text-blue-500" />
    },
    { 
      title: "Ticket Prices", 
      description: "How much are admission tickets?", 
      icon: <FaTicketAlt className="text-green-500" />
    },
    { 
      title: "Guided Tours", 
      description: "What guided tours are available?", 
      icon: <FaLandmark className="text-yellow-500" />
    }
  ];

  // Check if mobile
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages, streamedResponse]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Save/load conversations from localStorage
  useEffect(() => {
    const savedConversations = localStorage.getItem('museum-conversations');
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        setConversations(parsed.map((conv: any) => ({
          ...conv,
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        })));
      } catch (error) {
        console.error('Error parsing saved conversations:', error);
      }
    }
  }, []);

  useEffect(() => {
    const conversationsToStore = conversations.map(conv => ({
      ...conv,
      messages: conv.messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }))
    }));
    localStorage.setItem('museum-conversations', JSON.stringify(conversationsToStore));
  }, [conversations]);

  // Check backend connection
  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const isConnected = await checkHealth();
        setIsOfflineMode(!isConnected);
      } catch (error) {
        setIsOfflineMode(true);
      }
    };
    
    checkBackendConnection();
  }, []);

  // Handle scroll position
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    };

    messagesContainer.addEventListener('scroll', handleScroll);
    return () => messagesContainer.removeEventListener('scroll', handleScroll);
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results: number[] = [];
    const query = searchQuery.toLowerCase();
    
    conversation.messages.forEach((msg, index) => {
      if (msg.content.toLowerCase().includes(query)) {
        results.push(index);
      }
    });
    
    setSearchResults(results);
    setCurrentResultIndex(results.length > 0 ? 0 : -1);
  }, [searchQuery, conversation.messages]);

  const navigateSearchResults = (direction: 'next' | 'prev') => {
    if (searchResults.length === 0) return;
    
    setCurrentResultIndex(prev => 
      direction === 'next' 
        ? (prev + 1) % searchResults.length 
        : (prev - 1 + searchResults.length) % searchResults.length
    );
  };

  useEffect(() => {
    if (currentResultIndex >= 0 && searchResults.length > 0) {
      const messageIndex = searchResults[currentResultIndex];
      const messageElement = document.getElementById(`message-${messageIndex}`);
      messageElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentResultIndex, searchResults]);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    setSearchQuery('');
    setSearchResults([]);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const highlightSearchMatches = (text: string) => {
    if (!searchQuery.trim()) return text;
    
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() 
        ? <mark key={i} className="bg-yellow-200 text-gray-900 px-0.5 rounded">{part}</mark> 
        : part
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      content: message,
      role: 'user' as const,
      timestamp: new Date()
    };

    const updatedConversations = conversations.map(c => {
      if (c.id === conversation.id) {
        let updatedName = c.name;
        if (c.messages.length === 0) {
          updatedName = message.length > 25 ? `${message.substring(0, 25)}...` : message;
          const questionMatch = message.match(/^(What|How|Why|When|Where|Is|Are|Can|Could|Do|Does|Who).{5,30}\??/i);
          if (questionMatch) {
            updatedName = questionMatch[0];
            if (!updatedName.endsWith('?')) updatedName += '?';
          }
        }
        return { ...c, name: updatedName, messages: [...c.messages, userMessage] };
      }
      return c;
    });
    
    setConversations(updatedConversations);
    setMessage('');
    textareaRef.current && (textareaRef.current.style.height = 'auto');
    setIsLoading(true);
    setStreamedResponse('');

    try {
      const currentConversation = updatedConversations.find(c => c.id === conversation.id);
      if (!currentConversation) throw new Error('Conversation not found');

      const response = await sendMessage(
        message, 
        currentConversation.sessionId || null,
        currentConversation.messages
      );

      if (!response.ok) throw new Error(`Server responded with ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body is null');

      const tempAiMessage = {
        id: Date.now().toString(),
        content: '',
        role: 'assistant' as const,
        timestamp: new Date()
      };

      setConversations(prev => 
        prev.map(c => 
          c.id === conversation.id 
            ? { 
                ...c, 
                messages: [...c.messages, tempAiMessage],
                sessionId: c.sessionId || `session-${Date.now()}`
              } 
            : c
        )
      );

      let accumulatedContent = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data) {
              accumulatedContent += data;
              setStreamedResponse(accumulatedContent);
              
              setConversations(prev => 
                prev.map(c => 
                  c.id === conversation.id 
                    ? { 
                        ...c, 
                        messages: c.messages.map(m => 
                          m.id === tempAiMessage.id 
                            ? { ...m, content: accumulatedContent } 
                            : m
                        ) 
                      } 
                    : c
                )
              );
            }
          }
        }
      }

      if (isOfflineMode) setIsOfflineMode(false);
    } catch (error) {
      console.error('Error sending message:', error);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setIsOfflineMode(true);
      }
      
      setConversations(prev => 
        prev.map(c => 
          c.id === conversation.id 
            ? { 
                ...c, 
                messages: [...c.messages, {
                  id: Date.now().toString(),
                  content: isOfflineMode 
                    ? "I'm currently in offline mode with limited functionality."
                    : "Sorry, there was an error processing your request.",
                  role: 'assistant' as const,
                  timestamp: new Date()
                }] 
              } 
            : c
        )
      );
    } finally {
      setIsLoading(false);
      setStreamedResponse('');
    }
  };

  return (
    <div 
      ref={chatContainerRef}
      className="flex-1 flex flex-col bg-white relative !m-0 transition-all duration-300"
      style={{ marginLeft: isSidebarOpen && !isMobile ? '20rem' : '0' }}
    >
      {/* Museum-themed chat header */}
      <div className="border-b border-gray-200 py-4 px-6 flex items-center justify-between bg-gradient-to-r from-blue-800 to-indigo-900 text-white shadow-md sticky top-0 z-10">
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg text-white hover:bg-blue-700 transition-colors"
            aria-label="Open sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        
        <div className="flex items-center flex-1 justify-center">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-800 mr-2 shadow-md">
            <FaLandmark className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-white truncate px-2 max-w-xs">
            {conversation.name || "Museum Guide"}
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            className={`p-2 rounded-lg ${isSearchOpen ? 'bg-blue-700 text-white' : 'text-white hover:bg-blue-700'} transition-colors`}
            onClick={toggleSearch}
            aria-label={isSearchOpen ? "Close search" : "Search conversation"}
          >
            <FaSearch className="w-5 h-5" />
          </button>
          
          <button 
            className="p-2 rounded-lg text-white hover:bg-blue-700 transition-colors"
            onClick={() => window.location.reload()}
            aria-label="Refresh conversation"
          >
            <FaHistory className="w-5 h-5" />
          </button>
        </div>
        
        {isOfflineMode && (
          <div className="absolute top-full left-0 right-0 bg-yellow-100 text-yellow-800 text-xs text-center py-1.5 px-2 flex items-center justify-center gap-1">
            <BsExclamationTriangle className="w-3 h-3" />
            <span>Offline Mode: Some features may be limited</span>
          </div>
        )}
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-200 bg-white overflow-hidden"
          >
            <div className="p-3 flex items-center bg-gray-50">
              <div className="flex-1 flex items-center bg-white rounded-lg px-3 py-2 border border-gray-300">
                <FaSearch className="text-gray-500 mr-2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in conversation..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-gray-800"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Clear search"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {searchResults.length > 0 && (
                <div className="flex items-center ml-3">
                  <span className="text-sm text-gray-600 mr-2">
                    {currentResultIndex + 1} of {searchResults.length}
                  </span>
                  <button
                    onClick={() => navigateSearchResults('prev')}
                    className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors mr-1"
                    aria-label="Previous result"
                  >
                    <FaArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigateSearchResults('next')}
                    className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
                    aria-label="Next result"
                  >
                    <FaArrowDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat messages with museum theme */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50 relative"
      >
        {conversation.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-800 to-indigo-900 rounded-full flex items-center justify-center text-white text-4xl mb-6 shadow-lg">
              <FaLandmark className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-blue-800 to-indigo-900 bg-clip-text text-transparent">
              Museum Virtual Guide
            </h2>
            <p className="text-gray-600 max-w-md mb-8">
              Ask me about exhibits, events, tickets, or museum history. I'm here to help!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
              {museumPrompts.map((prompt, i) => (
                <motion.button
                  key={i}
                  className="text-left p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow group"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setMessage(prompt.title + ": " + prompt.description);
                    textareaRef.current?.focus();
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-opacity-20 group-hover:bg-opacity-30 transition-colors">
                      {prompt.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1 group-hover:text-blue-700 transition-colors">
                        {prompt.title}
                      </h3>
                      <p className="text-sm text-gray-500">{prompt.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {conversation.messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                id={`message-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={searchResults.includes(index) && currentResultIndex === searchResults.indexOf(index) 
                  ? 'ring-2 ring-yellow-400 ring-offset-2 rounded-xl' 
                  : ''}
              >
                <MessageComponent 
                  message={msg} 
                  onRegenerate={msg.role === 'assistant' ? () => onRegenerate?.() : undefined} 
                  highlightText={highlightSearchMatches}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        
        {isLoading && !streamedResponse && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-800 to-indigo-900 rounded-full flex items-center justify-center text-white shadow-md mr-3">
              <FaLandmark className="w-5 h-5" />
            </div>
            <div className="typing-indicator">
              <span className="bg-blue-800"></span>
              <span className="bg-blue-800"></span>
              <span className="bg-blue-800"></span>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} className="h-4" />
        
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-24 right-6 p-3 rounded-full bg-white shadow-lg border border-gray-200 text-gray-600 hover:text-blue-700 hover:border-blue-500 transition-all duration-200"
            onClick={scrollToBottom}
            aria-label="Scroll to bottom"
          >
            <FaArrowDown className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* Museum-themed message input */}
      <div className="border-t border-gray-200 p-4 md:p-6 bg-white sticky bottom-0 z-10">
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
          <div className="flex items-center bg-white rounded-2xl border-2 border-gray-200 focus-within:border-blue-700 transition-colors duration-200 shadow-md overflow-hidden">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about exhibits, events, or museum information..."
              className="flex-1 p-4 focus:outline-none resize-none text-gray-800 bg-white min-h-[44px]"
              rows={1}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            
            <div className="flex-shrink-0 p-2">
              <motion.button
                type="submit"
                disabled={isLoading || !message.trim()}
                className={`p-3 rounded-xl ${
                  isLoading || !message.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-800 to-indigo-900 text-white shadow-md hover:shadow-lg'
                } transition-all duration-200`}
                whileHover={isLoading || !message.trim() ? {} : { scale: 1.05 }}
                whileTap={isLoading || !message.trim() ? {} : { scale: 0.95 }}
                aria-label="Send message"
              >
                {isLoading ? (
                  <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </motion.button>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-2 px-2 text-xs text-gray-500">
            <div className="flex items-center">
              <FaInfoCircle className="w-3 h-3 mr-1" />
              <span>Press Enter to send, Shift+Enter for new line</span>
            </div>
            <div className="flex gap-2">
              <button 
                type="button" 
                className="p-1.5 rounded-full hover:bg-gray-100 hover:text-blue-700 transition-colors"
                aria-label="Search museum catalog"
              >
                <FaSearch className="w-4 h-4" />
              </button>
              <button 
                type="button" 
                className="p-1.5 rounded-full hover:bg-gray-100 hover:text-blue-700 transition-colors"
                aria-label="Museum events"
              >
                <FaCalendarAlt className="w-4 h-4" />
              </button>
              <button 
                type="button" 
                className="p-1.5 rounded-full hover:bg-gray-100 hover:text-blue-700 transition-colors"
                aria-label="Museum tickets"
              >
                <BsTicketPerforated className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}