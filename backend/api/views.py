from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import UserSession, ChatMessage
from .serializers import UserSessionSerializer, ChatMessageSerializer, ChatSendSerializer, ChatHistorySerializer
from .llm_engine import chat_with_ai, generate_career_roadmap


@api_view(['POST'])
def submit_questionnaire(request):
    serializer = UserSessionSerializer(data=request.data)
    if serializer.is_valid():
        session = serializer.save()
        
        # --- NEW: Generate a dynamic welcome message using the LLM ---
        context = { "name": session.name, "status": session.status, "age": session.age }
        # The initial message is a placeholder to trigger the "Phase 1" welcome logic in the LLM.
        welcome_message = chat_with_ai(context, "The user has just completed the questionnaire and joined the chat.", "")
        
        ChatMessage.objects.create(session=session, sender='ai', message=welcome_message)
        
        return Response({
            'success': True,
            'session_id': session.session_id,
        }, status=status.HTTP_201_CREATED)
    
    return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def send_message(request):
    serializer = ChatSendSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    session_id = serializer.validated_data['session_id']
    message_text = serializer.validated_data['message']
    
    try:
        session = UserSession.objects.get(session_id=session_id)
        
        # Save the user's message
        ChatMessage.objects.create(session=session, sender='user', message=message_text)


         # 1. Check if the user is explicitly asking for the roadmap
        user_wants_roadmap = 'roadmap' in message_text.lower() or 'career plan' in message_text.lower()

         # --- ROADMAP TRIGGER LOGIC ---
         # First, get the total message count for this session
        message_count = ChatMessage.objects.filter(session=session).count()
        limit_reached = message_count >= 20
        # Check if the message limit is reached AND the roadmap hasn't been created yet
        if (limit_reached or user_wants_roadmap) and not session.roadmap_data:
            
            # This part of the logic is unchanged. It generates and saves the roadmap.
            history_queryset = ChatMessage.objects.filter(session=session).order_by("timestamp")
            history_text = "\n".join([f"{msg.get_sender_display()}: {msg.message}" for msg in history_queryset])
            
            roadmap_json = generate_career_roadmap(session, history_text)
            session.roadmap_data = roadmap_json
            session.save()
            
            final_ai_message_text = f"Oops! You've reached the message limit for this session. We've had a great conversation! I've prepared a personalized career roadmap for you based on everything we've discussed. You can access it here: [View Your Roadmap](/roadmap/{session.session_id})"
            
            ai_message = ChatMessage.objects.create(session=session, sender='ai', message=final_ai_message_text)
        else:
            # --- NORMAL CONVERSATION FLOW ---
            # If the limit isn't reached, continue the conversation as usual.
        
            # Get the full conversation history to provide context to the LLM
            history_queryset = ChatMessage.objects.filter(session=session).order_by("timestamp")
            history_text = "\n".join([f"{msg.get_sender_display()}: {msg.message}" for msg in history_queryset])
        
            # Prepare the context from the user's session data
            context = { "name": session.name, "status": session.status, "age": session.age }
        
            # Call the LLM to get the next response
            ai_response_text = chat_with_ai(context, message_text, history_text)
        
            # Save the AI's response
            ai_message = ChatMessage.objects.create(session=session, sender='ai', message=ai_response_text)
        
        return Response({
            'success': True,
            'ai_response': ChatMessageSerializer(ai_message).data
        }, status=status.HTTP_201_CREATED)
    
    except UserSession.DoesNotExist:
        return Response({'success': False, 'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_chat_history(request, session_id):
    try:
        session = UserSession.objects.get(session_id=session_id)
        serializer = ChatHistorySerializer(session)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    except UserSession.DoesNotExist:
        return Response({'success': False, 'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['GET'])
def get_roadmap(request, session_id):
    """
    Get the generated career roadmap for a session
    """
    try:
        session = UserSession.objects.get(session_id=session_id)
        if session.roadmap_data:
            return Response(session.roadmap_data, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Roadmap not generated yet.'}, status=status.HTTP_404_NOT_FOUND)
    
    except UserSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def upload_resume(request):
    """
    Handles resume file uploads for a given session.
    """
    session_id = request.data.get('session_id')
    resume_file = request.FILES.get('resume')

    # Validation to ensure the required data is present
    if not session_id or not resume_file:
        return Response(
            {'success': False, 'error': 'Session ID and resume file are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        session = UserSession.objects.get(session_id=session_id)
    except UserSession.DoesNotExist:
        return Response(
            {'success': False, 'error': 'Session not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Assign the uploaded file to the model field and save the session
    session.resume_file = resume_file
    session.save()

    # --- LLM Trigger (Optional) ---
    # You could immediately trigger the LLM to analyze the resume and send a new message.
    # For now, we'll just confirm the upload was successful.
    
    # Create a confirmation message to add to the chat history
    ai_message_text = f"Thank you for uploading your resume, '{resume_file.name}'. I will review it now. What specific roles are you interested in?"
    
    ai_message = ChatMessage.objects.create(
        session=session,
        sender='ai',
        message=ai_message_text
    )
    
    return Response({
        'success': True,
        'message': 'Resume uploaded successfully.',
        'ai_response': ChatMessageSerializer(ai_message).data
    }, status=status.HTTP_200_OK)