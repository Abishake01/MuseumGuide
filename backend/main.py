from flask import Flask, request, Response, jsonify
from flask_cors import CORS
from handlers.response_handler import get_response
from helpers.qr_helper import generate_ticket_qr, validate_ticket_qr, create_mock_ticket
from helpers.sentiment_helper import collect_feedback, get_feedback_summary, create_mock_feedback
from helpers.museum_data import get_all_museum_data
import uuid
import json
from datetime import datetime, timedelta

app = Flask(__name__)
# Enable CORS for all routes and origins
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_input = data.get('message')
    session_id = data.get('session_id', str(uuid.uuid4()))
    stream = data.get('stream', False)
    messages = data.get('messages', [])
    
    if not user_input:
        return jsonify({"error": "No message provided"}), 400
    
    if stream:
        def generate():
            for chunk in get_response(user_input, session_id=session_id, stream=True, messages=messages):
                yield f"data: {chunk}\n\n"
        
        return Response(generate(), mimetype='text/event-stream', headers={
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*'
        })
    else:
        response = get_response(user_input, session_id=session_id, stream=False, messages=messages)
        return jsonify({"response": response, "session_id": session_id})

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

# New endpoints for museum ticketing system

@app.route('/api/museum/data', methods=['GET'])
def get_museum_data():
    """Get all museum data including exhibits, ticket prices, and tour schedules."""
    return jsonify(get_all_museum_data())

@app.route('/api/museum/tickets', methods=['POST'])
def create_ticket():
    """Create a new museum ticket with QR code."""
    data = request.json
    visitor_name = data.get('visitor_name')
    ticket_type = data.get('ticket_type')
    visit_date = data.get('visit_date')
    num_tickets = data.get('num_tickets', 1)
    
    if not all([visitor_name, ticket_type, visit_date]):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Create mock ticket (in a real system, this would create a real ticket in a database)
    tickets = create_mock_ticket(visitor_name, ticket_type, visit_date, num_tickets)
    
    return jsonify({"tickets": tickets})

@app.route('/api/museum/tickets/validate', methods=['POST'])
def validate_ticket():
    """Validate a ticket QR code."""
    data = request.json
    qr_data = data.get('qr_data')
    
    if not qr_data:
        return jsonify({"error": "No QR data provided"}), 400
    
    # Validate the ticket
    result = validate_ticket_qr(qr_data)
    
    return jsonify(result)

@app.route('/api/museum/feedback', methods=['POST'])
def submit_feedback():
    """Submit visitor feedback."""
    data = request.json
    
    if not data or 'responses' not in data:
        return jsonify({"error": "Invalid feedback data"}), 400
    
    # Collect and analyze feedback
    feedback = collect_feedback(data)
    
    return jsonify({"success": True, "feedback": feedback})

@app.route('/api/museum/feedback/summary', methods=['GET'])
def feedback_summary():
    """Get a summary of all feedback."""
    summary = get_feedback_summary()
    return jsonify(summary)

@app.route('/api/museum/tours', methods=['GET'])
def get_tours():
    """Get available tour guides and schedules."""
    museum_data = get_all_museum_data()
    
    # Get current day of week
    current_day = datetime.now().strftime('%A')
    
    # Filter guides available today
    available_guides = []
    for guide in museum_data['tour_guides']:
        if current_day in guide['availability']:
            available_guides.append({
                'id': guide['id'],
                'name': guide['name'],
                'specialties': guide['specialties'],
                'languages': guide['languages'],
                'availability': guide['availability'][current_day],
                'rating': guide['rating']
            })
    
    return jsonify({
        'tour_types': museum_data['tour_types'],
        'available_guides': available_guides
    })

@app.route('/api/museum/tours/book', methods=['POST'])
def book_tour():
    """Book a guided tour."""
    data = request.json
    guide_id = data.get('guide_id')
    tour_type = data.get('tour_type')
    date = data.get('date')
    time = data.get('time')
    group_size = data.get('group_size', 1)
    visitor_name = data.get('visitor_name')
    visitor_email = data.get('visitor_email')
    
    if not all([guide_id, tour_type, date, time, visitor_name, visitor_email]):
        return jsonify({"error": "Missing required fields"}), 400
    
    # In a real system, this would check availability and create a booking
    # For now, we'll just return a mock booking confirmation
    booking_id = str(uuid.uuid4())
    
    return jsonify({
        "success": True,
        "booking_id": booking_id,
        "confirmation": {
            "guide_id": guide_id,
            "tour_type": tour_type,
            "date": date,
            "time": time,
            "group_size": group_size,
            "visitor_name": visitor_name,
            "visitor_email": visitor_email,
            "booking_id": booking_id
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)