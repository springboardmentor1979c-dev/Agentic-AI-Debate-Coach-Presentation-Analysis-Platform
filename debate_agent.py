import logging
from typing import Dict, Any, List
from argument_analysis import analyze_argument
from fallacy_detector import detect_fallacies
from counterargument import generate_counterargument

logger = logging.getLogger("debate_coach.debate_agent")

class DebateOrchestrator:
    def __init__(self, db_conn):
        self.db = db_conn

    def process_turn(self, session_id: int, user_content: str, audio_path: str = None, duration: float = 0.0) -> Dict[str, Any]:
        """
        Agentic Workflow:
        1. Receive User Turn.
        2. Execute Analyzer Agent: extracts claims, evidence, scores user argument.
        3. Execute Fallacy Detector Agent: flags logical fallacies.
        4. Save User Turn and Analysis reports to Database.
        5. Execute Opponent Agent: generates counterargument (AI response) using counterargument service.
        6. Save Opponent Turn to Database.
        7. Return turn contents and analysis details.
        """
        # Get session details
        cursor = self.db.cursor()
        cursor.execute(
            "SELECT * FROM debate_sessions WHERE id = ?", (session_id,)
        )
        session = cursor.fetchone()
        if not session:
            raise ValueError("Session not found")

        # 1. Save user turn
        cursor.execute(
            "INSERT INTO debate_turns (session_id, speaker, content, audio_path, duration) VALUES (?, 'User', ?, ?, ?)",
            (session_id, user_content, audio_path, duration)
        )
        user_turn_id = cursor.lastrowid

        # 2. Analyze user argument
        analysis = analyze_argument(user_content)
        
        # 3. Detect fallacies
        fallacies = detect_fallacies(user_content)

        # Save Analysis
        cursor.execute(
            """
            INSERT INTO argument_analyses (
                turn_id, claims, evidence, reasoning_analysis,
                clarity, relevance, evidence_strength, logical_consistency, persuasiveness,
                strengths, weaknesses, feedback
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_turn_id,
                json_dumps(analysis["claims"]),
                json_dumps(analysis["evidence"]),
                json_dumps(analysis["reasoning_analysis"]),
                analysis["scores"]["clarity"],
                analysis["scores"]["relevance"],
                analysis["scores"]["evidence_strength"],
                analysis["scores"]["logical_consistency"],
                analysis["scores"]["persuasiveness"],
                json_dumps(analysis["strengths"]),
                json_dumps(analysis["weaknesses"]),
                json_dumps(analysis["feedback"])
            )
        )

        # Save Fallacies
        for fallacy in fallacies:
            cursor.execute(
                """
                INSERT INTO fallacy_detections (
                    turn_id, type, span, explanation, confidence, correction
                ) VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    user_turn_id,
                    fallacy["type"],
                    fallacy.get("span", ""),
                    fallacy.get("explanation", ""),
                    fallacy.get("confidence", 0.5),
                    fallacy.get("correction", "")
                )
            )

        # 4. Get Turn history to generate counterargument
        cursor.execute(
            "SELECT speaker, content FROM debate_turns WHERE session_id = ? ORDER BY id ASC",
            (session_id,)
        )
        turns = cursor.fetchall()
        history = [{"speaker": t["speaker"], "content": t["content"]} for t in turns]

        # Determine strategy based on turn count or alternate randomly
        strategies = ["Logical Rebuttal", "Evidence-Based Rebuttal", "Practical Counterargument", "Policy Counterargument"]
        rebuttal_strategy = strategies[len(history) % len(strategies)]

        # 5. Generate AI opponent response
        ai_response = generate_counterargument(
            topic=session["topic"],
            user_position=session["position"],
            turn_history=history,
            difficulty=session["difficulty"],
            rebuttal_type=rebuttal_strategy
        )

        # 6. Save Opponent Turn
        cursor.execute(
            "INSERT INTO debate_turns (session_id, speaker, content) VALUES (?, 'AI', ?)",
            (session_id, ai_response)
        )
        ai_turn_id = cursor.lastrowid
        self.db.commit()

        return {
            "user_turn_id": user_turn_id,
            "user_analysis": analysis,
            "user_fallacies": fallacies,
            "ai_turn_id": ai_turn_id,
            "ai_content": ai_response
        }

    def process_turn_stream(self, session_id: int, user_content: str, audio_path: str = None, duration: float = 0.0) -> Dict[str, Any]:
        cursor = self.db.cursor()
        cursor.execute(
            "SELECT * FROM debate_sessions WHERE id = ?", (session_id,)
        )
        session = cursor.fetchone()
        if not session:
            raise ValueError("Session not found")

        # 1. Save user turn
        cursor.execute(
            "INSERT INTO debate_turns (session_id, speaker, content, audio_path, duration) VALUES (?, 'User', ?, ?, ?)",
            (session_id, user_content, audio_path, duration)
        )
        user_turn_id = cursor.lastrowid
        self.db.commit()

        # 2. Get Turn history to generate counterargument
        cursor.execute(
            "SELECT speaker, content FROM debate_turns WHERE session_id = ? ORDER BY id ASC",
            (session_id,)
        )
        turns = cursor.fetchall()
        history = [{"speaker": t["speaker"], "content": t["content"]} for t in turns]

        strategies = ["Logical Rebuttal", "Evidence-Based Rebuttal", "Practical Counterargument", "Policy Counterargument"]
        rebuttal_strategy = strategies[len(history) % len(strategies)]

        history_str = "\n".join([f"{t['speaker']}: {t['content']}" for t in history[-4:]])
        
        prompt = f"""
        You are an AI opponent in a debate practice session.
        Topic: "{session["topic"]}"
        User Position: "{session["position"]}" (You must advocate for the OPPOSING position).
        Difficulty Level: {session["difficulty"]} (Beginner: simple claims, conversational. Intermediate: clear arguments with reasoning. Advanced: sophisticated rhetoric, challenging rebuttals).
        Rebuttal Strategy: {rebuttal_strategy}
        
        Recent Turn History:
        {history_str}
        
        Respond with your next turn. Keep the response to exactly 1 single concise paragraph (40-70 words max). Be direct, conversational, and focus on rebutting the user's points in a spoken format. Do not write essays or multiple paragraphs.
        """

        return {
            "user_turn_id": user_turn_id,
            "prompt": prompt,
            "session": session
        }

    def save_ai_turn(self, session_id: int, ai_content: str) -> int:
        cursor = self.db.cursor()
        cursor.execute(
            "INSERT INTO debate_turns (session_id, speaker, content) VALUES (?, 'AI', ?)",
            (session_id, ai_content)
        )
        ai_turn_id = cursor.lastrowid
        self.db.commit()
        return ai_turn_id


def json_dumps(obj: Any) -> str:
    import json
    return json.dumps(obj)
