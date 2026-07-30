from typing import Dict, Any

def calculate_session_score(db_conn, session_id: int) -> Dict[str, Any]:
    """
    Calculate and save the overall performance score based on the PDF weighted scoring model:
    - Argument Quality = 30%
    - Evidence Usage = 20%
    - Logical Consistency = 20%
    - Rebuttal Effectiveness = 15%
    - Communication Skills = 15%
    """
    cursor = db_conn.cursor()
    
    # Query all argument analyses for the user turns in this session
    cursor.execute(
        """
        SELECT 
            aa.clarity, aa.relevance, aa.evidence_strength, aa.logical_consistency, aa.persuasiveness,
            (SELECT COUNT(*) FROM fallacy_detections fd WHERE fd.turn_id = dt.id) as fallacy_count
        FROM argument_analyses aa
        JOIN debate_turns dt ON aa.turn_id = dt.id
        WHERE dt.session_id = ? AND dt.speaker = 'User'
        """,
        (session_id,)
    )
    
    analyses = cursor.fetchall()
    if not analyses:
        # Fallback defaults if no turns have been analyzed
        return {
            "argument_quality": 50.0,
            "evidence_usage": 50.0,
            "logical_consistency": 50.0,
            "rebuttal_effectiveness": 50.0,
            "communication_skills": 50.0,
            "overall_score": 50.0
        }
        
    # Aggregate component scores from analyses
    total_turns = len(analyses)
    avg_clarity = sum(a["clarity"] for a in analyses) / total_turns
    avg_relevance = sum(a["relevance"] for a in analyses) / total_turns
    avg_evidence = sum(a["evidence_strength"] for a in analyses) / total_turns
    avg_consistency = sum(a["logical_consistency"] for a in analyses) / total_turns
    avg_persuasiveness = sum(a["persuasiveness"] for a in analyses) / total_turns
    total_fallacies = sum(a["fallacy_count"] for a in analyses)

    # Calculate metrics matching the 5 dimensions:
    # 1. Argument Quality (30%): based on persuasiveness and clarity
    arg_quality = (avg_persuasiveness * 5.0) + (avg_clarity * 5.0) # Map 0-10 back to 0-100 scale
    
    # 2. Evidence Usage (20%): based on evidence strength
    evidence_usage = avg_evidence * 10.0
    
    # 3. Logical Consistency (20%): logical consistency metric penalized by fallacies
    logical_consistency = max(10.0, (avg_consistency * 10.0) - (total_fallacies * 15.0))
    
    # 4. Rebuttal Effectiveness (15%): based on relevance and responsiveness
    rebuttal_effectiveness = avg_relevance * 10.0
    
    # 5. Communication Skills (15%): based on clarity and style
    communication_skills = avg_clarity * 10.0

    # Ensure all components bounds are 0-100
    arg_quality = min(100.0, max(0.0, arg_quality))
    evidence_usage = min(100.0, max(0.0, evidence_usage))
    logical_consistency = min(100.0, max(0.0, logical_consistency))
    rebuttal_effectiveness = min(100.0, max(0.0, rebuttal_effectiveness))
    communication_skills = min(100.0, max(0.0, communication_skills))

    # Weighted Overall Score
    overall_score = (
        (arg_quality * 0.30) +
        (evidence_usage * 0.20) +
        (logical_consistency * 0.20) +
        (rebuttal_effectiveness * 0.15) +
        (communication_skills * 0.15)
    )

    # Fetch User turns to compute speech metrics
    cursor.execute(
        "SELECT content, duration FROM debate_turns WHERE session_id = ? AND speaker = 'User'",
        (session_id,)
    )
    user_turns = cursor.fetchall()
    
    total_duration = 0.0
    total_words = 0
    total_fillers = 0
    
    import re
    filler_words = ["um", "uh", "erm", "like", "you know", "basically", "actually"]
    
    for turn in user_turns:
        total_duration += float(turn["duration"] or 0.0)
        text = turn["content"]
        words = re.findall(r'\b\w+\b', text.lower())
        total_words += len(words)
        for filler in filler_words:
            matches = re.findall(r'\b' + re.escape(filler) + r'\b', text.lower())
            total_fillers += len(matches)
            
    avg_wpm = 0.0
    if total_duration > 0:
        avg_wpm = (total_words / total_duration) * 60.0
    elif total_words > 0:
        total_duration = total_words / 2.5
        avg_wpm = 150.0

    # Save to database
    cursor.execute(
        """
        INSERT OR REPLACE INTO performance_scores (
            session_id, argument_quality, evidence_usage, logical_consistency, rebuttal_effectiveness, 
            communication_skills, overall_score, total_duration, total_words, avg_wpm, total_fillers
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            session_id, arg_quality, evidence_usage, logical_consistency, rebuttal_effectiveness, 
            communication_skills, overall_score, total_duration, total_words, avg_wpm, total_fillers
        )
    )
    db_conn.commit()

    return {
        "argument_quality": round(arg_quality, 1),
        "evidence_usage": round(evidence_usage, 1),
        "logical_consistency": round(logical_consistency, 1),
        "rebuttal_effectiveness": round(rebuttal_effectiveness, 1),
        "communication_skills": round(communication_skills, 1),
        "overall_score": round(overall_score, 1),
        "total_duration": round(total_duration, 1),
        "total_words": total_words,
        "avg_wpm": round(avg_wpm, 1),
        "total_fillers": total_fillers
    }
