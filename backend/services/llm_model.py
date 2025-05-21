from langchain_groq import ChatGroq

def get_llm_model(model_name: str = "llama3-8b-8192", temperature: float = 0.5, api_key: str = None) -> ChatGroq:
    if not api_key:
        raise ValueError("Groq API key is required.")

    return ChatGroq(model=model_name, temperature=temperature, api_key=api_key)
