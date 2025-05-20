"""
QR code generation and validation helper for museum tickets.
"""
import qrcode
import json
import uuid
import base64
from io import BytesIO
from datetime import datetime, timedelta

def generate_ticket_qr(ticket_data):
    """
    Generate a QR code for a museum ticket.
    
    Args:
        ticket_data (dict): Ticket information including visitor details, ticket type, and date.
        
    Returns:
        str: Base64 encoded QR code image.
    """
    # Add a unique ticket ID if not provided
    if 'ticket_id' not in ticket_data:
        ticket_data['ticket_id'] = str(uuid.uuid4())
    
    # Add timestamp for validation
    ticket_data['generated_at'] = datetime.now().isoformat()
    
    # Convert ticket data to JSON
    ticket_json = json.dumps(ticket_data)
    
    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(ticket_json)
    qr.make(fit=True)
    
    # Create image
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return img_str, ticket_data['ticket_id']

def validate_ticket_qr(qr_data):
    """
    Validate a QR code from a museum ticket.
    
    Args:
        qr_data (str): QR code data in JSON format.
        
    Returns:
        dict: Validation result with status and message.
    """
    try:
        # Parse QR data
        ticket_data = json.loads(qr_data)
        
        # Check if ticket has required fields
        required_fields = ['ticket_id', 'visitor_name', 'ticket_type', 'visit_date', 'generated_at']
        for field in required_fields:
            if field not in ticket_data:
                return {
                    'valid': False,
                    'message': f'Invalid ticket: Missing {field}'
                }
        
        # Check if ticket is not expired (valid for 1 year from generation)
        generated_at = datetime.fromisoformat(ticket_data['generated_at'])
        if datetime.now() - generated_at > timedelta(days=365):
            return {
                'valid': False,
                'message': 'Ticket has expired'
            }
        
        # Check if visit date is valid (not in the past)
        visit_date = datetime.fromisoformat(ticket_data['visit_date'])
        if visit_date < datetime.now().replace(hour=0, minute=0, second=0, microsecond=0):
            return {
                'valid': False,
                'message': 'Visit date has passed'
            }
        
        # All checks passed
        return {
            'valid': True,
            'message': 'Ticket is valid',
            'ticket_data': ticket_data
        }
    
    except json.JSONDecodeError:
        return {
            'valid': False,
            'message': 'Invalid QR code format'
        }
    except Exception as e:
        return {
            'valid': False,
            'message': f'Validation error: {str(e)}'
        }

def create_mock_ticket(visitor_name, ticket_type, visit_date, num_tickets=1):
    """
    Create a mock ticket for testing purposes.
    
    Args:
        visitor_name (str): Name of the visitor.
        ticket_type (str): Type of ticket (Adult, Child, Senior, etc.).
        visit_date (str): Date of visit in ISO format (YYYY-MM-DD).
        num_tickets (int): Number of tickets to generate.
        
    Returns:
        list: List of ticket data dictionaries.
    """
    tickets = []
    
    for _ in range(num_tickets):
        ticket_data = {
            'visitor_name': visitor_name,
            'ticket_type': ticket_type,
            'visit_date': visit_date,
            'purchase_date': datetime.now().isoformat(),
            'price': get_ticket_price(ticket_type)
        }
        
        qr_code, ticket_id = generate_ticket_qr(ticket_data)
        ticket_data['qr_code'] = qr_code
        ticket_data['ticket_id'] = ticket_id
        
        tickets.append(ticket_data)
    
    return tickets

def get_ticket_price(ticket_type):
    """
    Get the price for a specific ticket type.
    
    Args:
        ticket_type (str): Type of ticket.
        
    Returns:
        float: Price of the ticket.
    """
    # This would typically come from a database or configuration
    prices = {
        'Adult': 25.00,
        'Child': 12.00,
        'Senior': 18.00,
        'Student': 15.00,
        'Family': 65.00,
        'Group': 20.00
    }
    
    return prices.get(ticket_type, 25.00)  # Default to adult price if type not found 