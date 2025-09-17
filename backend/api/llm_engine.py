# backend/api/llm_engine.py
import json

from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.embeddings import OllamaEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_ollama import OllamaLLM

# --- Initialization ---
llm = OllamaLLM(model="llama3.1", temperature=0.7)
embeddings = OllamaEmbeddings(model="llama3.1")

# --- NEW: Resume Processing Function (from your original script) ---
def process_resume(file_path: str):
    """
    Reads a resume file (PDF), splits it into chunks, and creates a searchable
    vector store (a smart index) of its content.
    """
    if not file_path:
        return None
    try:
        loader = PyPDFLoader(file_path)
        pages = loader.load()
        text = " ".join([page.page_content for page in pages])
        
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = text_splitter.split_text(text)
        
        # Create the smart index from the resume chunks
        vector_store = FAISS.from_texts(chunks, embedding=embeddings)
        print(f"Successfully processed resume: {file_path}")
        return vector_store
    except Exception as e:
        print(f"Error processing resume file: {e}")
        return None

# --- UPDATED Master Prompt ---
# We've added a {resume_context} placeholder.
base_template = """
You are an expert career counselor AI. Your goal is to have a natural, multi-step conversation.

**Conversation Rules:**
1.  **Phase 1: Rapport Building (First 2 AI messages).** Your first message is a warm welcome. Your second message should be an open-ended question to make the user comfortable.
2.  **Phase 2: Conditional Logic (AI's 3rd message).**
    - IF the user's status is 'school_student', continue the conversation naturally.
    - IF the user's status is 'college_student' or 'passout', politely ask them to paste their resume.
3.  **Phase 3: Counseling.**
    - For school students, analyze their concerns and provide guidance.
    - For college/passout, once they provide a resume, analyze it and begin counseling.

**User's Background Information:**
- Name: {name}
- Status: {status}
- Age: {age}
- **Resume Context:** {resume_context}

**Conversation History:**
{history}

The user just sent this message: "{message}"

---
**IMPORTANT INSTRUCTION:** Your final output must ONLY be the words the counselor would say. Do not add any notes, explanations, or mention your internal rules or phases.

Your next response as the AI Counselor:
"""

prompt = PromptTemplate(
    input_variables=["name", "status", "age", "resume_context", "history", "message"],
    template=base_template,
)

chain = LLMChain(llm=llm, prompt=prompt)

# --- Main AI Function ---
def chat_with_ai(context: dict, message: str, history: str):
    """
    Generates an AI response, now with the ability to process a resume.
    """
    resume_context = "No resume has been provided for this session yet."
    
    # Check if a resume path is available in the session context
    if context.get("resume_path"):
        vector_store = process_resume(context["resume_path"])
        if vector_store:
            # Find the most relevant parts of the resume based on the user's message
            relevant_chunks = vector_store.similarity_search(message, k=2)
            resume_context = " ".join([chunk.page_content for chunk in relevant_chunks])
            print("Found relevant resume context.")

    # Call the LLM with all available information
    result = chain.invoke({
        "name": context.get("name", "the user"),
        "status": context.get("status", "N/A"),
        "age": context.get("age", "N/A"),
        "resume_context": resume_context,
        "history": history,
        "message": message,
    })
    return result['text']
# --- UPDATED: Career-roadmap AI Function ---
def generate_career_roadmap(session, history_text):
    """
    Generates a career roadmap based on the user's status and chat history.
    """
    resume_context = "No resume provided for this session."
    
    # This logic correctly prepares the context for the LLM
    if session.resume_file and hasattr(session.resume_file, 'path'):
        vector_store = process_resume(session.resume_file.path)
        if vector_store:
            relevant_chunks = vector_store.similarity_search(history_text, k=3)
            resume_context = " ".join([chunk.page_content for chunk in relevant_chunks])

    # --- Conditional Prompting ---
    if session.status == 'school_student':
        # Prompt for school students (no courses, no salary)
        template = """
        Based on the conversation with this school student, suggest 3-5 potential academic fields or streams they could pursue in higher education.
        For each suggestion, provide:
        - "title": (the field or stream)
        - "skills": (a list of 3-5 key skills)
        - "reasoning": (a brief explanation, in 50 words)

        Format the entire output as a single, clean JSON object with a single key "roadmap" containing a list of these suggestions.
        Chat History: {chat_history}
        """
        prompt = PromptTemplate(input_variables=["chat_history"], template=template)
        chain = LLMChain(llm=llm, prompt=prompt)
        
        # FIX: Use .invoke() which is the modern, correct way to run the chain
        result = chain.invoke({"chat_history": history_text})

    else: # For college students and professionals
        # Prompt for college/professionals (includes courses, salary, etc.)
        template = """
        Based on the conversation and resume context, provide 3-5 detailed career pathways.
        For each pathway, provide:
        - "title": (The Occupation Title)
        - "skills": (a list of 5-7 key skills)
        - "courses": (a list of 2-3 real, relevant Coursera course URLs)
        - "salary": (A string representing the Expected Salary Range)
        - "growth": (A string: "High", "Medium", or "Low")
        - "reasoning": (A brief explanation, in 50 words)

        Format the entire output as a single, clean JSON object with a single key "roadmap" containing a list of these pathways.
        Chat History: {chat_history}
        Resume Context: {resume_context}
        """
        prompt = PromptTemplate(input_variables=["chat_history", "resume_context"], template=template)
        chain = LLMChain(llm=llm, prompt=prompt)

        # FIX: Use .invoke() here as well
        result = chain.invoke({"chat_history": history_text, "resume_context": resume_context})

    try:
        # The actual text response is in the 'text' key of the result dictionary
        return json.loads(result['text'])
    except (json.JSONDecodeError, TypeError, KeyError):
        # Fallback in case of an error
        return {"error": "Could not generate roadmap data."}
    
    