# In backend/api/youtube.py

from googleapiclient.discovery import build
from django.conf import settings

def get_youtube_courses(skill, max_results=1):
    """
    Search YouTube for a course/tutorial about a specific skill.
    """
    # Assumes you have YOUTUBE_API_KEY in your settings.py file
    API_KEY = settings.YOUTUBE_API_KEY
    YOUTUBE_API_SERVICE_NAME = "youtube"
    YOUTUBE_API_VERSION = "v3"
    
    try:
        youtube = build(YOUTUBE_API_SERVICE_NAME, YOUTUBE_API_VERSION, developerKey=API_KEY)
        
        request = youtube.search().list(
            q=f"{skill} course tutorial for beginners",
            part="snippet",
            type="video",
            maxResults=max_results,
            videoCategoryId="27" # Category ID for "Education"
        )
        response = request.execute()
        
        results = []
        for item in response.get('items', []):
            video_id = item.get('id', {}).get('videoId')
            snippet = item.get('snippet', {})
            if video_id and snippet:
                results.append({
                    "name": snippet.get('title', 'Untitled Video'),
                    "url": f"https://www.youtube.com/watch?v={video_id}"
                })
        return results
        
    except Exception as e:
        print(f"Failed to fetch YouTube courses for '{skill}': {str(e)}")
        return []