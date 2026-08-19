import time

from google import genai
from app.config import settings


client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


MODELS = [
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
]


def generate_response(prompt: str):
    last_error = None

    for model in MODELS:
        for attempt in range(3):
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=prompt,
                )

                return response.text

            except Exception as e:
                last_error = e
                error_text = str(e)

                # Retry temporary server overloads.
                if "503" in error_text or "UNAVAILABLE" in error_text:
                    wait_time = 2 ** attempt
                    time.sleep(wait_time)
                    continue

                # If this model isn't available, try the next model.
                if (
                    "404" in error_text
                    or "NOT_FOUND" in error_text
                    or "model" in error_text.lower()
                    and "not" in error_text.lower()
                ):
                    break

                # Other errors should not be retried repeatedly.
                raise

    raise last_error