from django.db import models
import uuid

class UserSession(models.Model):
    # --- CHOICES ---
    STATUS_CHOICES = [('school_student', 'School Student'), ('college_student', 'College Student'), ('passout', 'Graduate/Passout')]
    LEVEL_CHOICES = [('class_10', 'Class 10'), ('class_11', 'Class 11'), ('class_12', 'Class 12')]
    YEAR_CHOICES = [('first_year', '1st Year'), ('second_year', '2nd Year'), ('third_year', '3rd Year'), ('fourth_year', '4th Year')]
    FIELD_CHOICES = [('engineering', 'Engineering'), ('medical', 'Medical'), ('business', 'Business/Commerce'), ('arts', 'Arts/Humanities'), ('science', 'Science')]

    # --- FIELDS ---
    session_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, blank=True, null=True)
    year = models.CharField(max_length=20, choices=YEAR_CHOICES, blank=True, null=True)
    field = models.CharField(max_length=20, choices=FIELD_CHOICES, blank=True, null=True)
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    # MODIFIED: Concerns is now optional as it will be gathered during the chat.
    concerns = models.TextField(blank=True, null=True)
    resume_file = models.FileField(upload_to='resumes/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    roadmap_data = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = 'user_sessions'
        verbose_name = 'User Session'
        verbose_name_plural = 'User Sessions'

    def __str__(self):
        return f"{self.name} - {self.get_status_display()}"

class ChatMessage(models.Model):
    SENDER_CHOICES = [('user', 'User'), ('ai', 'AI')]

    message_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(UserSession, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_messages'
        ordering = ['timestamp']
        indexes = [models.Index(fields=['session', 'timestamp'])]
        verbose_name = 'Chat Message'
        verbose_name_plural = 'Chat Messages'

    def __str__(self):
        return f"{self.session.name} - {self.get_sender_display()}: {self.message[:50]}..."

