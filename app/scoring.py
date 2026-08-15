def calculate_overall_score(claim: int, evidence: int, rebuttal: int, verdict: int):
    # Simulated Weighted scoring formula processor calculating overall debate metrics (0-100)
    return int(0.3 * claim + 0.3 * evidence + 0.2 * rebuttal + 0.2 * verdict)
