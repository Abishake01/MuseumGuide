# AI-Powered Museum Ticketing System

A smart, user-friendly solution that streamlines ticket booking, enhances visitor assistance, and supports museum operations through intelligent automation.

## Features

### QR-Based Entry & Validation
- Generate and scan QR codes for seamless museum entry
- Validate tickets at entry points
- Secure and tamper-proof ticket system

### Multilingual Chatbot
- Real-time help with bookings, navigation, and queries
- Support for multiple languages (English, Spanish, French, German, Chinese, Japanese)
- Contextual responses based on museum data

### Tour Guide Booking
- Schedule guided tours based on language and guide availability
- View guide specialties and ratings
- Book tours for specific dates and times

### Feedback Collection & Sentiment Analysis
- Collect visitor feedback through structured questions
- Analyze sentiment to improve services
- Generate insights for museum management

## Project Structure

### Backend
- Flask-based REST API
- LangChain for AI-powered responses
- Vector database for semantic search
- QR code generation and validation
- Sentiment analysis for feedback

### Frontend
- Next.js React application
- Responsive design for all devices
- Interactive chat interface
- Ticket booking and management
- Tour scheduling

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- Ollama pull (for local LLM ,llama2 ,llama3, nomic-embed-text)

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Start the backend server:
   ```
   python main.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd bot-frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Chat
- `POST /api/chat` - Send a message to the chatbot

### Museum Data
- `GET /api/museum/data` - Get all museum data

### Tickets
- `POST /api/museum/tickets` - Create a new ticket
- `POST /api/museum/tickets/validate` - Validate a ticket QR code

### Tours
- `GET /api/museum/tours` - Get available tour guides and schedules
- `POST /api/museum/tours/book` - Book a guided tour

### Feedback
- `POST /api/museum/feedback` - Submit visitor feedback
- `GET /api/museum/feedback/summary` - Get a summary of all feedback

## Mock Data

The system uses mock data for:
- Museum exhibits
- Ticket prices
- Tour guides and schedules
- Special offers

In a production environment, this would be replaced with a real database.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 