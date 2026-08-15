def detect_fallacies(text: str):
    # Simulated Logical fallacy scanner
    fallacies = []
    if "always" in text or "never" in text:
        fallacies.append("Hasty Generalization")
    if "stupid" in text or "idiot" in text:
        fallacies.append("Ad Hominem")
    if "everyone knows" in text:
        fallacies.append("Bandwagon")
    return fallacies
