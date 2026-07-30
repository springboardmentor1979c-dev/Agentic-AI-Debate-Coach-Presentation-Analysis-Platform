import os
import json
import logging
from typing import Optional, Dict, Any
from fastapi import HTTPException
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger("debate_coach.ai_providers")

class LLMProvider:
    def __init__(self):
        self.provider = os.getenv("LLM_PROVIDER", "mock").lower()
        self.openai_key = os.getenv("OPENAI_API_KEY", "")
        self.openai_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        self.groq_key = os.getenv("GROQ_API_KEY", "")
        self.groq_model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

        # Safe logging
        print(f"LLM provider: {self.provider}")
        if self.provider == "groq":
            has_key = bool(self.groq_key and "PASTE_MY_NEW_GROQ_KEY_HERE" not in self.groq_key)
            print(f"Groq key configured: {has_key}")
            print(f"Groq model: {self.groq_model}")

        if self.provider == "openai" and not self.openai_key:
            logger.warning("OPENAI_API_KEY is not set. Falling back to Mock LLM provider.")
            self.provider = "mock"

    def _log_request(self, model: str, operation: str, success: int, latency_ms: int, error: str = None):
        try:
            from database import DATABASE_PATH
            import sqlite3
            conn = sqlite3.connect(DATABASE_PATH)
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO ai_request_logs (provider, model, operation, success, latency_ms, error_category)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (self.provider, model, operation, success, latency_ms, error)
            )
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Telemetry logging failed: {e}")

    def complete(self, prompt: str, system_prompt: str = "You are a helpful assistant.", json_mode: bool = False) -> str:
        import time
        start_time = time.time()
        
        operation = "general_completion"
        if "fallacy" in prompt.lower():
            operation = "fallacy_detection"
        elif "analysis" in prompt.lower() or "claims" in prompt.lower():
            operation = "argument_analysis"
        elif "rebuttal" in prompt.lower() or "counterargument" in prompt.lower():
            operation = "rebuttal_generation"
        elif "coaching" in prompt.lower():
            operation = "coaching_feedback"

        model_name = self.groq_model if self.provider == "groq" else (self.openai_model if self.provider == "openai" else "mock-llama")

        if self.provider == "groq":
            if not self.groq_key or "PASTE_MY_NEW_GROQ_KEY_HERE" in self.groq_key:
                self._log_request(model_name, operation, 0, 0, "Missing API Key")
                raise HTTPException(status_code=500, detail="GROQ_API_KEY environment variable is missing or not set.")
            try:
                from groq import Groq, APIConnectionError, RateLimitError, APIStatusError
                
                client = Groq(api_key=self.groq_key)
                messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ]
                
                kwargs = {
                    "model": self.groq_model,
                    "messages": messages,
                    "timeout": 30.0
                }
                
                if json_mode:
                    kwargs["response_format"] = {"type": "json_object"}
                    
                chat_completion = client.chat.completions.create(**kwargs)
                response_text = chat_completion.choices[0].message.content
                if not response_text:
                    self._log_request(model_name, operation, 0, int((time.time() - start_time) * 1000), "Empty Response")
                    raise HTTPException(status_code=500, detail="Received empty response from AI provider.")
                self._log_request(model_name, operation, 1, int((time.time() - start_time) * 1000))
                return response_text
            except RateLimitError as e:
                self._log_request(model_name, operation, 0, int((time.time() - start_time) * 1000), "RateLimitError")
                logger.error(f"Groq API Rate Limit Exceeded: {e}")
                raise HTTPException(status_code=429, detail="AI provider rate limit exceeded. Please try again later.")
            except APIStatusError as e:
                self._log_request(model_name, operation, 0, int((time.time() - start_time) * 1000), f"APIStatusError:{e.status_code}")
                logger.error(f"Groq API status error: {e.status_code} - {e.message}")
                if e.status_code == 401:
                    raise HTTPException(status_code=401, detail="AI provider authentication failure.")
                raise HTTPException(status_code=e.status_code, detail=f"AI provider error: {e.message}")
            except APIConnectionError as e:
                self._log_request(model_name, operation, 0, int((time.time() - start_time) * 1000), "APIConnectionError")
                logger.error(f"Groq API connection/network failure: {e}")
                raise HTTPException(status_code=503, detail="AI provider connection failed. Please check network connectivity.")
            except HTTPException:
                raise
            except Exception as e:
                self._log_request(model_name, operation, 0, int((time.time() - start_time) * 1000), "UnexpectedError")
                logger.error(f"Groq completion request failed: {e}")
                raise HTTPException(status_code=500, detail="An unexpected error occurred during AI analysis.")

    def complete_stream(self, prompt: str, system_prompt: str = "You are a helpful assistant."):
        import time
        model_name = self.groq_model if self.provider == "groq" else (self.openai_model if self.provider == "openai" else "mock-llama")
        
        if self.provider == "groq":
            if not self.groq_key or "PASTE_MY_NEW_GROQ_KEY_HERE" in self.groq_key:
                raise HTTPException(status_code=500, detail="GROQ_API_KEY environment variable is missing or not set.")
            try:
                from groq import Groq
                client = Groq(api_key=self.groq_key)
                messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ]
                chat_completion = client.chat.completions.create(
                    model=self.groq_model,
                    messages=messages,
                    timeout=30.0,
                    stream=True
                )
                for chunk in chat_completion:
                    content = chunk.choices[0].delta.content
                    if content:
                        yield content
                return
            except Exception as e:
                logger.error(f"Groq stream request failed: {e}")

        # Fallback to mock streaming response
        words = (
            "While the affirmative position makes a compelling point regarding efficiency, it fails to account "
            "for the equity implications. A policy focusing solely on rapid optimization disadvantages rural "
            "communities lacking appropriate access infrastructure."
        ).split(" ")
        for word in words:
            yield word + " "
            time.sleep(0.04)

        if self.provider == "openai":
            try:
                import urllib.request
                import json

                url = "https://api.openai.com/v1/chat/completions"
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.openai_key}"
                }
                
                messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ]
                
                data = {
                    "model": self.openai_model,
                    "messages": messages
                }
                if json_mode:
                    data["response_format"] = {"type": "json_object"}

                req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST")
                with urllib.request.urlopen(req, timeout=30) as response:
                    res_body = response.read().decode("utf-8")
                    res_json = json.loads(res_body)
                    result_text = res_json["choices"][0]["message"]["content"]
                    self._log_request(model_name, operation, 1, int((time.time() - start_time) * 1000))
                    return result_text
            except Exception as e:
                self._log_request(model_name, operation, 0, int((time.time() - start_time) * 1000), "OpenAIError")
                logger.error(f"OpenAI completion request failed: {e}. Falling back to Mock response.")

        mock_res = self._mock_completion(prompt, system_prompt, json_mode)
        self._log_request(model_name, operation, 1, int((time.time() - start_time) * 1000))
        return mock_res

    def _mock_completion(self, prompt: str, system_prompt: str, json_mode: bool) -> str:
        # Check if the prompt suggests a specific schema response, e.g. Argument Analysis, Fallacy Detection, Rebuttal
        if json_mode or "json" in prompt.lower():
            if "fallacy" in prompt.lower():
                return json.dumps({
                    "fallacies": [
                        {
                            "type": "Straw Man",
                            "span": "The opponent claims we want to ban all technology",
                            "explanation": "Misrepresenting the target argument to make it easier to attack.",
                            "confidence": 0.85,
                            "why_it_weakens": "It shifts the target of the debate away from the actual policy proposal.",
                            "correction": "Refocus the discussion on the actual limited policy restrictions proposed."
                        }
                    ]
                })
            elif "analysis" in prompt.lower() or "claims" in prompt.lower():
                return json.dumps({
                    "claims": ["Technology isolation reduces interpersonal skill development"],
                    "evidence": ["A general statement about screen-time correlation studies"],
                    "reasoning_analysis": {"validity": "Weak causal links between phone ownership and social capability", "logic": "Correlation-causation leap"},
                    "scores": {
                        "clarity": 8.0,
                        "relevance": 8.5,
                        "evidence_strength": 6.0,
                        "logical_consistency": 7.0,
                        "persuasiveness": 7.5
                    },
                    "strengths": ["Clear opening premise and statement of purpose"],
                    "weaknesses": ["Relies on generalized assumptions rather than specific empirical studies"],
                    "feedback": ["Try referencing specific comparative cohorts to make the evidence assessment more concrete."]
                })
            else:
                return json.dumps({
                    "response": "This is a structured mock response for general JSON completions.",
                    "scores": {"overall": 8.0}
                })
        
        # Prose fallback
        if "rebuttal" in prompt.lower() or "counterargument" in prompt.lower():
            return (
                "While the affirmative position makes a compelling point regarding efficiency, it fails to account "
                "for the equity implications. A policy focusing solely on rapid optimization disadvantages rural "
                "communities lacking appropriate access infrastructure."
            )
        
        return "Indeed, debating requires robust structural claims. Let's delve deeper into the core principles of evidence evaluation."

ai_provider = LLMProvider()
