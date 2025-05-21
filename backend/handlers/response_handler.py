from helpers.chat_helper import ChatHelper
from services.llm_model import get_llm_model
from helpers.storage_helper import get_or_create_vectorstore
from constance.prompts import SYSTEM_PROMPT, HUMAN_PROMPT
from langchain.chains import LLMChain
from typing import Generator, Union
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

def get_response(
    user_input: str,
    session_id: str,
    stream: bool = False,
    messages: list = None
) -> Union[str, Generator[str, None, None]]:
    """
    Generates a response using the GROQ LLM model with vectorstore-enhanced context.

    Args:
        user_input (str): The user's message or question.
        session_id (str): The unique ID for the user's session.
        stream (bool): If True, yields streaming response chunks.
        messages (list): Optional chat history if passed manually.

    Returns:
        Union[str, Generator[str, None, None]]: A response string or a generator for streamed output.
    """

    # Load vectorstore and retrieve top-k relevant context
    vectorstore = get_or_create_vectorstore()
    results = vectorstore.similarity_search(user_input, k=2)
    context = "\n".join([doc.page_content for doc in results])

    # Get the Groq LLM model
    llm = get_llm_model(
        model_name="llama3-8b-8192", 
        temperature=0.5, 
        api_key=api_key
    )

    # Initialize the ChatHelper with system and human prompts
    chat_helper = ChatHelper(system_prompt=SYSTEM_PROMPT, human_prompt=HUMAN_PROMPT)

    # Compose the full chain
    chain = chat_helper.prompt | llm

    # Prepare payload for the chain
    payload = {
        "query": user_input,
        "context": context,
        "chat_history": messages if messages else chat_helper.get_memory_list(session_id)
    }

    print("Payload:", payload)

    # Stream or generate full response
    if stream:
        response = ""
        for chunk in chain.stream(payload):
            response += chunk.content
            yield chunk.content
        print("Stream ended")
    else:
        response = chain.invoke(payload)

    # Store the chat in memory if not using external messages
    if not messages:
        chat_helper.add_user_message(session_id, user_input)
        chat_helper.add_assistant_message(session_id, response)
        print("Updated Memory:", chat_helper.get_memory_list(session_id))

    # Return final response
    if not stream:
        return response.get("output_text", "") if isinstance(response, dict) else str(response)
