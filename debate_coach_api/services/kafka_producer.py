"""
Kafka producer — async event publishing for microservice communication.
Falls back to no-op when Kafka is unavailable or disabled.
"""
import json
from config import KAFKA_ENABLED, KAFKA_BOOTSTRAP_SERVERS, KAFKA_TOPIC_ANALYSIS, KAFKA_TOPIC_NOTIFICATIONS, KAFKA_TOPIC_SCORING

_producer = None


def _get_producer():
    global _producer
    if not KAFKA_ENABLED:
        return None
    if _producer is not None:
        return _producer
    try:
        from kafka import KafkaProducer
        _producer = KafkaProducer(
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            request_timeout_ms=3000,
        )
        return _producer
    except Exception:
        return None


def publish_event(topic: str, event: dict):
    """Publish an event to a Kafka topic. No-op if Kafka unavailable."""
    producer = _get_producer()
    if producer:
        try:
            producer.send(topic, event)
            producer.flush(timeout=2)
        except Exception:
            pass


def publish_analysis_event(session_id: int, argument_id: int, user_id: int):
    publish_event(KAFKA_TOPIC_ANALYSIS, {
        "event": "argument_submitted",
        "session_id": session_id,
        "argument_id": argument_id,
        "user_id": user_id,
    })


def publish_scoring_event(session_id: int, user_id: int, score: float):
    publish_event(KAFKA_TOPIC_SCORING, {
        "event": "score_computed",
        "session_id": session_id,
        "user_id": user_id,
        "score": score,
    })


def publish_notification_event(user_id: int, title: str, message: str, channel: str = "email"):
    publish_event(KAFKA_TOPIC_NOTIFICATIONS, {
        "event": "notification_triggered",
        "user_id": user_id,
        "title": title,
        "message": message,
        "channel": channel,
    })
