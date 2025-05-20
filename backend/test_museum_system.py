"""
Test script for the museum ticketing system.
This script tests the main functionality of the system.
"""
import requests
import json
from datetime import datetime, timedelta
import base64
from io import BytesIO
from PIL import Image

# Base URL for the API
BASE_URL = "http://localhost:5000"

def test_health():
    """Test the health check endpoint."""
    print("Testing health check...")
    response = requests.get(f"{BASE_URL}/api/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_museum_data():
    """Test getting museum data."""
    print("Testing museum data endpoint...")
    response = requests.get(f"{BASE_URL}/api/museum/data")
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Exhibits: {len(data['exhibits'])}")
        print(f"Ticket types: {len(data['ticket_prices'])}")
        print(f"Tour guides: {len(data['tour_guides'])}")
        print(f"Tour types: {len(data['tour_types'])}")
    else:
        print(f"Error: {response.text}")
    print()

def test_create_ticket():
    """Test creating a ticket."""
    print("Testing ticket creation...")
    
    # Create a ticket for tomorrow
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    
    data = {
        "visitor_name": "Test Visitor",
        "ticket_type": "Adult",
        "visit_date": tomorrow,
        "num_tickets": 2
    }
    
    response = requests.post(f"{BASE_URL}/api/museum/tickets", json=data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"Created {len(result['tickets'])} tickets")
        
        # Save the first ticket QR code as an image
        if result['tickets'] and 'qr_code' in result['tickets'][0]:
            qr_data = result['tickets'][0]['qr_code']
            img_data = base64.b64decode(qr_data)
            img = Image.open(BytesIO(img_data))
            img.save("test_ticket_qr.png")
            print("Saved QR code as test_ticket_qr.png")
    else:
        print(f"Error: {response.text}")
    print()

def test_validate_ticket():
    """Test validating a ticket."""
    print("Testing ticket validation...")
    
    # First create a ticket
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    
    data = {
        "visitor_name": "Test Visitor",
        "ticket_type": "Adult",
        "visit_date": tomorrow,
        "num_tickets": 1
    }
    
    response = requests.post(f"{BASE_URL}/api/museum/tickets", json=data)
    
    if response.status_code == 200:
        result = response.json()
        ticket = result['tickets'][0]
        
        # Now validate the ticket
        validate_data = {
            "qr_data": json.dumps({
                "ticket_id": ticket['ticket_id'],
                "visitor_name": ticket['visitor_name'],
                "ticket_type": ticket['ticket_type'],
                "visit_date": ticket['visit_date'],
                "generated_at": ticket['generated_at']
            })
        }
        
        validate_response = requests.post(f"{BASE_URL}/api/museum/tickets/validate", json=validate_data)
        print(f"Status: {validate_response.status_code}")
        print(f"Response: {validate_response.json()}")
    else:
        print(f"Error creating ticket: {response.text}")
    print()

def test_get_tours():
    """Test getting available tours."""
    print("Testing tour availability...")
    response = requests.get(f"{BASE_URL}/api/museum/tours")
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Tour types: {len(data['tour_types'])}")
        print(f"Available guides today: {len(data['available_guides'])}")
    else:
        print(f"Error: {response.text}")
    print()

def test_book_tour():
    """Test booking a tour."""
    print("Testing tour booking...")
    
    # First get available tours
    response = requests.get(f"{BASE_URL}/api/museum/tours")
    
    if response.status_code == 200:
        data = response.json()
        
        if data['available_guides'] and data['tour_types']:
            guide = data['available_guides'][0]
            tour_type = data['tour_types'][0]['id']
            
            # Book a tour for tomorrow
            tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
            
            booking_data = {
                "guide_id": guide['id'],
                "tour_type": tour_type,
                "date": tomorrow,
                "time": guide['availability'][0],
                "group_size": 2,
                "visitor_name": "Test Visitor",
                "visitor_email": "test@example.com"
            }
            
            booking_response = requests.post(f"{BASE_URL}/api/museum/tours/book", json=booking_data)
            print(f"Status: {booking_response.status_code}")
            print(f"Response: {booking_response.json()}")
        else:
            print("No available guides or tour types found")
    else:
        print(f"Error getting tours: {response.text}")
    print()

def test_feedback():
    """Test submitting feedback."""
    print("Testing feedback submission...")
    
    feedback_data = {
        "visitor_name": "Test Visitor",
        "visit_date": datetime.now().strftime("%Y-%m-%d"),
        "responses": {
            "How would you rate your overall museum experience?": {
                "rating": 5
            },
            "What aspects of your visit could be improved?": {
                "text": "The museum was great! I would like to see more interactive exhibits."
            }
        }
    }
    
    response = requests.post(f"{BASE_URL}/api/museum/feedback", json=feedback_data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        print("Feedback submitted successfully")
        
        # Get feedback summary
        summary_response = requests.get(f"{BASE_URL}/api/museum/feedback/summary")
        print(f"Summary Status: {summary_response.status_code}")
        print(f"Summary: {summary_response.json()}")
    else:
        print(f"Error: {response.text}")
    print()

def test_chat():
    """Test the chatbot."""
    print("Testing chatbot...")
    
    data = {
        "message": "What are the ticket prices?",
        "stream": False
    }
    
    response = requests.post(f"{BASE_URL}/api/chat", json=data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"Response: {result['response']}")
    else:
        print(f"Error: {response.text}")
    print()

def main():
    """Run all tests."""
    print("=== Museum Ticketing System Tests ===")
    print()
    
    test_health()
    test_museum_data()
    test_create_ticket()
    test_validate_ticket()
    test_get_tours()
    test_book_tour()
    test_feedback()
    test_chat()
    
    print("=== Tests Complete ===")

if __name__ == "__main__":
    main() 