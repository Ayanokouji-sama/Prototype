from rest_framework import serializers
from .models import UserSession, ChatMessage

class UserSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSession
        fields = '__all__'
        extra_kwargs = {
            'concerns': {'required': False, 'allow_blank': True, 'allow_null': True}
        }

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['message_id', 'sender', 'message', 'timestamp']

class ChatHistorySerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = UserSession
        fields = ['session_id', 'name', 'status', 'messages']

class ChatSendSerializer(serializers.Serializer):
    session_id = serializers.UUIDField()
    message = serializers.CharField()

