from django.urls import path
from . import views

urlpatterns = [
    path('submit_questionnaire/', views.submit_questionnaire, name='submit_questionnaire'),
    path('send_message/', views.send_message, name='send_message'),
    path('get_chat_history/<uuid:session_id>/', views.get_chat_history, name='get_chat_history'),
    path('resume/upload/', views.upload_resume, name='upload_resume'),
    path('roadmap/<uuid:session_id>/', views.get_roadmap, name='get_roadmap'),
]

