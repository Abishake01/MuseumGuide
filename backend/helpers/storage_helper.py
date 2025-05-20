from langchain_community.vectorstores import Chroma
from langchain_ollama import OllamaEmbeddings
from langchain.docstore.document import Document
import os
import json
from helpers.museum_data import get_all_museum_data

# Define constants
PERSIST_DIRECTORY = "db"
COLLECTION_NAME = "museum_data"
embeddings = OllamaEmbeddings(model="nomic-embed-text")

def get_or_create_vectorstore() -> Chroma:
    if os.path.exists(PERSIST_DIRECTORY) and os.path.exists(f"{PERSIST_DIRECTORY}/chroma.sqlite3"):
        print("Loading existing vectorstore...")
        return Chroma(
            persist_directory=PERSIST_DIRECTORY,
            embedding_function=embeddings,
            collection_name=COLLECTION_NAME
        )
    else:
        print("Creating new vectorstore with museum data...")
        os.makedirs(PERSIST_DIRECTORY, exist_ok=True)
        
        # Get museum data
        museum_data = get_all_museum_data()
        
        # Convert museum data to documents
        documents = []
        
        # Add exhibits
        for exhibit in museum_data['exhibits']:
            content = f"Exhibit: {exhibit['name']}\nDescription: {exhibit['description']}\nLocation: {exhibit['location']}\nDuration: {exhibit['duration']}\nHighlights: {', '.join(exhibit['highlights'])}"
            documents.append(Document(page_content=content, metadata={"type": "exhibit", "id": exhibit['id']}))
        
        # Add ticket prices
        for ticket in museum_data['ticket_prices']:
            content = f"Ticket Type: {ticket['type']}\nPrice: ${ticket['price']}\nDescription: {ticket['description']}"
            documents.append(Document(page_content=content, metadata={"type": "ticket", "type_name": ticket['type']}))
        
        # Add special offers
        for offer in museum_data['special_offers']:
            content = f"Special Offer: {offer['name']}\nDescription: {offer['description']}\nValidity: {offer['validity']}"
            documents.append(Document(page_content=content, metadata={"type": "offer", "name": offer['name']}))
        
        # Add tour guides
        for guide in museum_data['tour_guides']:
            content = f"Tour Guide: {guide['name']}\nSpecialties: {', '.join(guide['specialties'])}\nLanguages: {', '.join(guide['languages'])}\nBio: {guide['bio']}"
            documents.append(Document(page_content=content, metadata={"type": "guide", "id": guide['id']}))
        
        # Add tour types
        for tour in museum_data['tour_types']:
            content = f"Tour Type: {tour['name']}\nDuration: {tour['duration']}\nDescription: {tour['description']}\nPrice: ${tour['price']}\nMax Group Size: {tour['max_group_size']}"
            documents.append(Document(page_content=content, metadata={"type": "tour", "id": tour['id']}))
        
        # Add museum info
        info = museum_data['museum_info']
        content = f"Museum: {info['name']}\nAddress: {info['address']}\nPhone: {info['phone']}\nEmail: {info['email']}\nWebsite: {info['website']}\nFacilities: {', '.join(info['facilities'])}"
        documents.append(Document(page_content=content, metadata={"type": "museum_info"}))
        
        # Add hours
        hours_content = "Museum Hours:\n"
        for day, hours in info['hours'].items():
            hours_content += f"{day}: {hours}\n"
        documents.append(Document(page_content=hours_content, metadata={"type": "hours"}))
        
        # Create vectorstore
        vectorstore = Chroma.from_documents(
            documents=documents,
            embedding=embeddings,
            persist_directory=PERSIST_DIRECTORY,
            collection_name=COLLECTION_NAME
        )
        
        # Save museum data as JSON for easy access
        with open(f"{PERSIST_DIRECTORY}/museum_data.json", 'w') as f:
            json.dump(museum_data, f, indent=2)
        
        return vectorstore
