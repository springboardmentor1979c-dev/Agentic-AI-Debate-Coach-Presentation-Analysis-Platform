from app.services.gemini_service import generate_debate_response

print(
    generate_debate_response(
        "Artificial Intelligence",
        "Against",
        "AI will improve healthcare."
    )
)