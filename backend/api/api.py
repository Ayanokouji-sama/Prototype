from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import uuid

@csrf_exempt
@require_http_methods(["POST"])
def submit_questionnaire(request):
    """Handle questionnaire submission from React frontend"""
    try:
        # Parse the JSON data from the request
        data = json.loads(request.body)
        
        # Log the received data for debugging
        print("Received questionnaire data:", data)
        
        # Here you can add your questionnaire processing logic
        # For example, save to database, process with AI, etc.
        
        # For now, just return success with the received data
        return JsonResponse({
            'status': 'success',
            'message': 'Questionnaire submitted successfully',
            'data': data,
            'session_id': str(uuid.uuid4())  # Generate a session ID for future chat
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'status': 'error',
            'message': 'Invalid JSON data received'
        }, status=400)
        
    except Exception as e:
        print(f"Error in submit_questionnaire: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': f'Server error: {str(e)}'
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def send_message(request):
    """Handle chat messages from React frontend"""
    try:
        data = json.loads(request.body)
        message = data.get('message', '')
        session_id = data.get('session_id', '')
        
        print(f"Received message: {message} for session: {session_id}")
        
        # Here you would integrate with your AI/chatbot logic
        # For now, return a simple response
        
        return JsonResponse({
            'status': 'success',
            'message': 'Message received',
            'response': f'Thank you for your message: "{message}". This is a placeholder response.',
            'session_id': session_id
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'status': 'error',
            'message': 'Invalid JSON data received'
        }, status=400)
        
    except Exception as e:
        print(f"Error in send_message: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': f'Server error: {str(e)}'
        }, status=500)


@require_http_methods(["GET"])
def get_chat_history(request, session_id):
    """Get chat history for a specific session"""
    try:
        print(f"Requested chat history for session: {session_id}")
        
        # Here you would fetch chat history from database
        # For now, return empty history
        
        return JsonResponse({
            'status': 'success',
            'session_id': str(session_id),
            'history': [],
            'message': 'Chat history retrieved (currently empty - placeholder)'
        })
        
    except Exception as e:
        print(f"Error in get_chat_history: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': f'Server error: {str(e)}'
        }, status=500)