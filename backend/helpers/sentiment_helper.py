"""
Sentiment analysis helper for museum feedback collection.
"""
from textblob import TextBlob
import json
import os
from datetime import datetime

# Mock sentiment analysis function using TextBlob
def analyze_sentiment(text):
    """
    Analyze the sentiment of a text using TextBlob.
    
    Args:
        text (str): The text to analyze.
        
    Returns:
        dict: Sentiment analysis results including polarity and subjectivity.
    """
    if not text:
        return {
            'polarity': 0,
            'subjectivity': 0,
            'sentiment': 'neutral'
        }
    
    analysis = TextBlob(text)
    
    # Get polarity (-1 to 1) and subjectivity (0 to 1)
    polarity = analysis.sentiment.polarity
    subjectivity = analysis.sentiment.subjectivity
    
    # Determine sentiment category
    if polarity > 0.1:
        sentiment = 'positive'
    elif polarity < -0.1:
        sentiment = 'negative'
    else:
        sentiment = 'neutral'
    
    return {
        'polarity': polarity,
        'subjectivity': subjectivity,
        'sentiment': sentiment
    }

def collect_feedback(feedback_data):
    """
    Collect and analyze visitor feedback.
    
    Args:
        feedback_data (dict): Feedback data including visitor info and responses.
        
    Returns:
        dict: Processed feedback with sentiment analysis.
    """
    # Add timestamp
    feedback_data['timestamp'] = datetime.now().isoformat()
    
    # Analyze sentiment for each text response
    for question, answer in feedback_data['responses'].items():
        if isinstance(answer, str) and len(answer.strip()) > 0:
            feedback_data['responses'][question]['sentiment'] = analyze_sentiment(answer)
    
    # Calculate overall sentiment
    text_responses = [
        answer for question, answer in feedback_data['responses'].items()
        if isinstance(answer, str) and len(answer.strip()) > 0
    ]
    
    if text_responses:
        overall_sentiment = analyze_sentiment(' '.join(text_responses))
        feedback_data['overall_sentiment'] = overall_sentiment
    else:
        feedback_data['overall_sentiment'] = {
            'polarity': 0,
            'subjectivity': 0,
            'sentiment': 'neutral'
        }
    
    # Save feedback to file (in a real system, this would go to a database)
    save_feedback(feedback_data)
    
    return feedback_data

def save_feedback(feedback_data):
    """
    Save feedback data to a file.
    
    Args:
        feedback_data (dict): The feedback data to save.
    """
    # Create feedback directory if it doesn't exist
    feedback_dir = 'db/feedback'
    os.makedirs(feedback_dir, exist_ok=True)
    
    # Generate filename with timestamp
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"{feedback_dir}/feedback_{timestamp}.json"
    
    # Save to file
    with open(filename, 'w') as f:
        json.dump(feedback_data, f, indent=2)

def get_feedback_summary():
    """
    Get a summary of all feedback.
    
    Returns:
        dict: Summary of feedback including average sentiment and common themes.
    """
    feedback_dir = 'db/feedback'
    
    if not os.path.exists(feedback_dir):
        return {
            'total_feedback': 0,
            'average_sentiment': 'neutral',
            'average_polarity': 0,
            'average_subjectivity': 0,
            'common_themes': []
        }
    
    # Get all feedback files
    feedback_files = [f for f in os.listdir(feedback_dir) if f.endswith('.json')]
    
    if not feedback_files:
        return {
            'total_feedback': 0,
            'average_sentiment': 'neutral',
            'average_polarity': 0,
            'average_subjectivity': 0,
            'common_themes': []
        }
    
    # Process all feedback
    total_polarity = 0
    total_subjectivity = 0
    sentiment_counts = {'positive': 0, 'neutral': 0, 'negative': 0}
    
    for filename in feedback_files:
        with open(os.path.join(feedback_dir, filename), 'r') as f:
            feedback = json.load(f)
            
            if 'overall_sentiment' in feedback:
                sentiment = feedback['overall_sentiment']
                total_polarity += sentiment['polarity']
                total_subjectivity += sentiment['subjectivity']
                sentiment_counts[sentiment['sentiment']] += 1
    
    # Calculate averages
    total_feedback = len(feedback_files)
    average_polarity = total_polarity / total_feedback
    average_subjectivity = total_subjectivity / total_feedback
    
    # Determine most common sentiment
    most_common_sentiment = max(sentiment_counts, key=sentiment_counts.get)
    
    return {
        'total_feedback': total_feedback,
        'average_sentiment': most_common_sentiment,
        'average_polarity': average_polarity,
        'average_subjectivity': average_subjectivity,
        'sentiment_distribution': sentiment_counts,
        'common_themes': []  # In a real system, this would use NLP to extract themes
    }

def create_mock_feedback(visitor_name, visit_date, rating, comments):
    """
    Create mock feedback for testing purposes.
    
    Args:
        visitor_name (str): Name of the visitor.
        visit_date (str): Date of visit in ISO format (YYYY-MM-DD).
        rating (int): Overall rating (1-5).
        comments (str): Visitor comments.
        
    Returns:
        dict: Mock feedback data.
    """
    feedback_data = {
        'visitor_name': visitor_name,
        'visit_date': visit_date,
        'responses': {
            'How would you rate your overall museum experience?': {
                'rating': rating,
                'sentiment': analyze_sentiment(f"I rate my experience {rating} out of 5")
            },
            'What aspects of your visit could be improved?': {
                'text': comments,
                'sentiment': analyze_sentiment(comments)
            }
        }
    }
    
    return collect_feedback(feedback_data) 