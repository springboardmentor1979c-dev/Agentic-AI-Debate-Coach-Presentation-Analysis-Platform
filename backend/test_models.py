from app.core.config import settings
from google import genai

print("API Key loaded:", bool(settings.GEMINI_API_KEY))
print("First 10 chars:", settings.GEMINI_API_KEY[:10])

client = genai.Client(api_key=settings.GEMINI_API_KEY)

for model in client.models.list():
    print(model.name)