# backend/api/llm_engine.py
import json
import re

from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.embeddings import OllamaEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_ollama import OllamaLLM
from .youtube import get_youtube_courses

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
    - IF the user's status is 'college_student' or 'passout', politely ask them to attach their resume.
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


# In llm_engine.py

def generate_career_roadmap(session, history_text):
    """
    Final version: Uses the Coursera API to find real, verified course links.
    """
    resume_context = "No resume provided for this session."
    if session.resume_file and hasattr(session.resume_file, 'path'):
        vector_store = process_resume(session.resume_file.path)
        if vector_store:
            relevant_chunks = vector_store.similarity_search(history_text, k=3)
            resume_context = " ".join([chunk.page_content for chunk in relevant_chunks])

    # --- Conditional Prompting ---
    if session.status == 'school_student':
        # The school student logic is unchanged.
        template = """
        You are a career counselor AI. Your SOLE task is to generate a JSON response based ONLY on the provided Chat History.
        DO NOT invent or suggest generic careers. The suggestions MUST be directly related to the user's stated interests in the provided context:
        ---
        {chat_history}
        ---
        TASK: Based on the conversation, suggest 3 academic fields for the student.
        You MUST respond with ONLY a single, valid JSON object.
        The JSON object must have a key "roadmap" which contains a list of 3 objects.
        Each object MUST have these exact keys: "title" (string), "skills" (list of strings), "reasoning" (string).
        DO NOT add any text before or after the JSON object.
        """
        prompt = PromptTemplate(input_variables=["chat_history"], template=template)
        chain = LLMChain(llm=llm, prompt=prompt)
        result = chain.invoke({"chat_history": history_text})
        # The data is returned directly after the try/except block.

    else: # For college students and professionals
        # --- NEW PROMPT: ASKS FOR SEARCHABLE SKILLS ---
        template = """
        You are a career counselor AI. Your SOLE task is to generate a JSON response based ONLY on the provided Chat History and Resume Context.
        DO NOT invent or suggest generic careers. The suggestions MUST be directly related to the user's stated interests in the provided context:

        Analyze the following conversation and resume context.
        Chat History: {chat_history}
        Resume Context: {resume_context}

        TASK: Based on this information, Suggest 3 detailed career pathways.
        You MUST format your response as a single, valid JSON object.
        The object must have one key "roadmap", a list of 3 pathway objects.
        Each object must have these exact keys: "title", "skills", "courses_to_find", "salary", "growth", "reasoning".
        - The "courses_to_find" value MUST be a list of 2-3 strings.
        - Each string MUST be a specific, searchable skill or course name (e.g., "Python for Everybody", "Machine Learning Specialization").
        """
        prompt = PromptTemplate(input_variables=["chat_history", "resume_context"], template=template)
        chain = LLMChain(llm=llm, prompt=prompt)
        result = chain.invoke({"chat_history": history_text, "resume_context": resume_context})

    try:
        llm_output_text = result['text']
        print("--- LLM Roadmap Response ---")
        print(llm_output_text)
        print("--------------------------")

        data = None
        # First, try to find a JSON block inside ```json ... ```
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', llm_output_text, re.DOTALL)
    
        if json_match:
            # If we find a block, extract and parse it
            json_string = json_match.group(1)
            data = json.loads(json_string)
        elif llm_output_text.startswith('{') and llm_output_text.endswith('}'):
            # If no block is found, check if the whole response IS the JSON
            data = json.loads(llm_output_text)
        else:
            # If neither of the above are true, we can't process it.
            raise ValueError("Could not find or parse a valid JSON object in the AI's response.")
        
        # --- NEW: API Integration Loop ---
        # If it's a college student, find real courses
        if session.status != 'school_student' and 'roadmap' in data:
            for pathway in data['roadmap']:
                verified_courses = []
                if 'courses_to_find' in pathway:
                    for skill_to_find in pathway['courses_to_find']:
                        # Call our new API helper for each skill
                        courses = get_youtube_courses(skill_to_find, max_results=1)
                        if courses:
                            verified_courses.append(courses[0])
                            
                    # Replace the AI's suggestions with our verified data
                    pathway['courses'] = verified_courses
                    del pathway['courses_to_find'] 
        return data

    except (json.JSONDecodeError, TypeError, KeyError) as e:
        print(f"Error processing roadmap: {e}")
        return {"error": "Failed to decode or process the roadmap from AI response."}
    
    