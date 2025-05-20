"""
Mock data for the museum ticketing and guidance system.
This file contains sample data for exhibits, ticket prices, tour schedules, and guides.
"""

# Museum exhibits
EXHIBITS = [
    {
        "id": "exh-001",
        "name": "Ancient Civilizations",
        "description": "Explore artifacts from ancient Egyptian, Greek, and Roman civilizations.",
        "location": "First Floor, Gallery A",
        "duration": "45 minutes",
        "highlights": ["Pharaoh's Sarcophagus", "Greek Vases", "Roman Coins"],
        "image_url": "https://example.com/images/ancient-civilizations.jpg"
    },
    {
        "id": "exh-002",
        "name": "Renaissance Art",
        "description": "Masterpieces from the Italian Renaissance period.",
        "location": "Second Floor, Gallery B",
        "duration": "60 minutes",
        "highlights": ["Da Vinci Sketches", "Michelangelo Replicas", "Botticelli Paintings"],
        "image_url": "https://example.com/images/renaissance-art.jpg"
    },
    {
        "id": "exh-003",
        "name": "Modern Art",
        "description": "Contemporary art from the 20th and 21st centuries.",
        "location": "Third Floor, Gallery C",
        "duration": "30 minutes",
        "highlights": ["Picasso Works", "Warhol Prints", "Contemporary Installations"],
        "image_url": "https://example.com/images/modern-art.jpg"
    },
    {
        "id": "exh-004",
        "name": "Natural History",
        "description": "Fossils, minerals, and specimens from around the world.",
        "location": "First Floor, Gallery D",
        "duration": "45 minutes",
        "highlights": ["Dinosaur Skeletons", "Meteorite Collection", "Ocean Life Dioramas"],
        "image_url": "https://example.com/images/natural-history.jpg"
    },
    {
        "id": "exh-005",
        "name": "Interactive Science",
        "description": "Hands-on exhibits exploring physics, chemistry, and biology.",
        "location": "Basement Level, Gallery E",
        "duration": "60 minutes",
        "highlights": ["Electricity Demonstrations", "Chemistry Lab", "Virtual Reality Experiences"],
        "image_url": "https://example.com/images/interactive-science.jpg"
    }
]

# Ticket prices
TICKET_PRICES = [
    {
        "type": "Adult",
        "price": 25.00,
        "description": "Standard admission for adults (18+ years)"
    },
    {
        "type": "Child",
        "price": 12.00,
        "description": "Admission for children (5-17 years)"
    },
    {
        "type": "Senior",
        "price": 18.00,
        "description": "Admission for seniors (65+ years)"
    },
    {
        "type": "Student",
        "price": 15.00,
        "description": "Admission for students with valid ID"
    },
    {
        "type": "Family",
        "price": 65.00,
        "description": "Admission for 2 adults and up to 3 children"
    },
    {
        "type": "Group",
        "price": 20.00,
        "description": "Per person for groups of 10 or more (must be booked in advance)"
    }
]

# Special offers
SPECIAL_OFFERS = [
    {
        "name": "Free Entry Day",
        "description": "First Sunday of every month is free entry for all visitors",
        "validity": "First Sunday of each month"
    },
    {
        "name": "Student Discount",
        "description": "50% off for students with valid ID on Wednesdays",
        "validity": "Every Wednesday"
    },
    {
        "name": "Family Pass",
        "description": "Buy one adult ticket, get one child ticket free",
        "validity": "Weekends only"
    }
]

# Tour guides
TOUR_GUIDES = [
    {
        "id": "guide-001",
        "name": "Dr. Sarah Johnson",
        "specialties": ["Ancient Civilizations", "Renaissance Art"],
        "languages": ["English", "French", "Spanish"],
        "availability": {
            "Monday": ["10:00", "14:00", "16:00"],
            "Wednesday": ["10:00", "14:00", "16:00"],
            "Friday": ["10:00", "14:00", "16:00"],
            "Saturday": ["11:00", "15:00"]
        },
        "rating": 4.8,
        "bio": "Dr. Johnson has a Ph.D. in Art History and has been guiding tours for 15 years."
    },
    {
        "id": "guide-002",
        "name": "Prof. Michael Chen",
        "specialties": ["Modern Art", "Interactive Science"],
        "languages": ["English", "Chinese", "Japanese"],
        "availability": {
            "Tuesday": ["10:00", "14:00", "16:00"],
            "Thursday": ["10:00", "14:00", "16:00"],
            "Sunday": ["11:00", "15:00"]
        },
        "rating": 4.9,
        "bio": "Prof. Chen is a former university professor with expertise in contemporary art movements."
    },
    {
        "id": "guide-003",
        "name": "Maria Rodriguez",
        "specialties": ["Natural History", "Interactive Science"],
        "languages": ["English", "Spanish", "Portuguese"],
        "availability": {
            "Monday": ["11:00", "15:00"],
            "Wednesday": ["11:00", "15:00"],
            "Friday": ["11:00", "15:00"],
            "Saturday": ["10:00", "14:00"]
        },
        "rating": 4.7,
        "bio": "Maria has a background in biology and environmental science, with 10 years of museum experience."
    },
    {
        "id": "guide-004",
        "name": "Hans Schmidt",
        "specialties": ["Renaissance Art", "Modern Art"],
        "languages": ["English", "German", "French"],
        "availability": {
            "Tuesday": ["11:00", "15:00"],
            "Thursday": ["11:00", "15:00"],
            "Sunday": ["10:00", "14:00"]
        },
        "rating": 4.6,
        "bio": "Hans is an art historian specializing in European art from the 15th to 20th centuries."
    }
]

# Tour types
TOUR_TYPES = [
    {
        "id": "tour-001",
        "name": "Highlights Tour",
        "duration": "60 minutes",
        "description": "A guided tour of the museum's most important exhibits",
        "price": 15.00,
        "max_group_size": 15
    },
    {
        "id": "tour-002",
        "name": "In-Depth Art Tour",
        "duration": "90 minutes",
        "description": "Detailed exploration of the art collections",
        "price": 25.00,
        "max_group_size": 10
    },
    {
        "id": "tour-003",
        "name": "Science Discovery Tour",
        "duration": "75 minutes",
        "description": "Interactive tour focusing on the science exhibits",
        "price": 20.00,
        "max_group_size": 12
    },
    {
        "id": "tour-004",
        "name": "Family Tour",
        "duration": "45 minutes",
        "description": "Engaging tour designed for families with children",
        "price": 30.00,
        "max_group_size": 20
    }
]

# Museum information
MUSEUM_INFO = {
    "name": "Global Museum of Art and Science",
    "address": "123 Museum Avenue, Cultural District, City",
    "phone": "+1 (555) 123-4567",
    "email": "info@globalmuseum.org",
    "website": "www.globalmuseum.org",
    "hours": {
        "Monday": "9:00 AM - 5:00 PM",
        "Tuesday": "9:00 AM - 5:00 PM",
        "Wednesday": "9:00 AM - 8:00 PM",
        "Thursday": "9:00 AM - 5:00 PM",
        "Friday": "9:00 AM - 5:00 PM",
        "Saturday": "10:00 AM - 6:00 PM",
        "Sunday": "10:00 AM - 6:00 PM"
    },
    "facilities": [
        "Cafeteria",
        "Gift Shop",
        "Wheelchair Access",
        "Audio Guides",
        "Free Wi-Fi",
        "Cloakroom",
        "Restrooms"
    ]
}

# Feedback questions
FEEDBACK_QUESTIONS = [
    "How would you rate your overall museum experience?",
    "How satisfied were you with the exhibits?",
    "How helpful was the staff?",
    "How would you rate the value for money?",
    "Would you recommend the museum to others?",
    "What aspects of your visit could be improved?",
    "Which exhibits did you enjoy the most?",
    "Did you use any of our guided tours? If yes, how was your experience?"
]

# Get all museum data as a single dictionary
def get_all_museum_data():
    return {
        "exhibits": EXHIBITS,
        "ticket_prices": TICKET_PRICES,
        "special_offers": SPECIAL_OFFERS,
        "tour_guides": TOUR_GUIDES,
        "tour_types": TOUR_TYPES,
        "museum_info": MUSEUM_INFO,
        "feedback_questions": FEEDBACK_QUESTIONS
    } 