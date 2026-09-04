"""
AI Customer Support Resolution Platform
----------------------------------------
MVP Intent Classification Prototype

This prototype demonstrates the first decision-making layer
of an AI customer-support solution.

Supported intents:
1. FAQ
2. Account Issue
3. Order Issue
4. Refund Issue
5. Human Escalation

The prototype uses rule-based intent classification.
"""

import logging
import re


# ---------------------------------------------------------
# Logging Configuration
# ---------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------
# Intent Definitions
# ---------------------------------------------------------

INTENTS = {
    "FAQ": [
        "what are your",
        "how do i",
        "where can i",
        "do you offer",
        "what is",
        "information about",
        "opening hours",
        "return policy",
        "delivery policy",
    ],
    "Account Issue": [
        "account",
        "login",
        "log in",
        "password",
        "forgot password",
        "reset password",
        "username",
        "profile",
        "account locked",
        "cannot access",
    ],
    "Order Issue": [
        "order",
        "delivery",
        "shipment",
        "shipping",
        "tracking",
        "track my order",
        "where is my order",
        "order status",
        "package",
        "parcel",
        "not delivered",
    ],
    "Refund Issue": [
        "refund",
        "money back",
        "reimbursement",
        "refunded",
        "refund status",
        "return my money",
        "charged back",
    ],
    "Human Escalation": [
        "human",
        "agent",
        "representative",
        "support agent",
        "speak to someone",
        "speak to a person",
        "manager",
        "complaint",
        "escalate",
        "urgent",
        "legal",
    ],
}


# ---------------------------------------------------------
# Text Preprocessing
# ---------------------------------------------------------

def normalize_text(text: str) -> str:
    """
    Normalize customer input before classification.
    """

    text = text.lower().strip()
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text)

    return text


# ---------------------------------------------------------
# Intent Classification
# ---------------------------------------------------------

def classify_intent(question: str) -> tuple[str, float]:
    """
    Classify a customer question using weighted keyword matching.

    Longer, more specific phrases receive higher scores than
    generic keywords.

    Returns:
        tuple[str, float]:
            predicted intent and confidence score
    """

    normalized_question = normalize_text(question)

    scores = {
        intent: 0
        for intent in INTENTS
    }

    for intent, keywords in INTENTS.items():

        for keyword in keywords:

            normalized_keyword = normalize_text(keyword)

            if normalized_keyword in normalized_question:
                # Give more weight to specific multi-word phrases.
                word_count = len(normalized_keyword.split())

                if word_count >= 3:
                    weight = 3
                elif word_count == 2:
                    weight = 2
                else:
                    weight = 1

                scores[intent] += weight

    best_intent = max(scores, key=scores.get)
    best_score = scores[best_intent]

    total_score = sum(scores.values())

    if total_score == 0:
        logger.info("No intent matched for question.")
        return "Human Escalation", 0.0

    confidence = best_score / total_score

    logger.info(
        "Intent detected: %s | Confidence: %.2f",
        best_intent,
        confidence,
    )

    return best_intent, confidence


# ---------------------------------------------------------
# Response
# ---------------------------------------------------------

def process_question(question: str) -> None:
    """
    Process and display the classification result.
    """

    if not question.strip():
        print("\nPlease enter a valid question.")
        return

    intent, confidence = classify_intent(question)

    print("\n" + "=" * 45)
    print("AI CUSTOMER SUPPORT CLASSIFICATION")
    print("=" * 45)

    print(f"\nCustomer Question:")
    print(question)

    print(f"\nPredicted Category:")
    print(intent)

    print(f"\nConfidence:")
    print(f"{confidence:.2%}")

    if intent == "Human Escalation":
        print("\nRecommended Action:")
        print("Escalate the request to a human support agent.")

    elif confidence < 0.50:
        print("\nRecommended Action:")
        print("Low confidence — escalate to a human agent.")

    else:
        print("\nRecommended Action:")
        print("Continue with the appropriate AI support workflow.")

    print("=" * 45)


# ---------------------------------------------------------
# Main Application
# ---------------------------------------------------------

def main() -> None:
    """
    Run the interactive customer-support prototype.
    """

    print("\n" + "=" * 45)
    print("AI CUSTOMER SUPPORT RESOLUTION PLATFORM")
    print("Intent Classification Prototype")
    print("=" * 45)

    print("\nSupported Categories:")

    for number, intent in enumerate(INTENTS.keys(), start=1):
        print(f"{number}. {intent}")

    print("\nType 'exit' to quit.")

    while True:

        question = input("\nEnter your question: ")

        if question.lower().strip() == "exit":
            print("\nExiting prototype. Goodbye!")
            break

        process_question(question)


if __name__ == "__main__":
    main()
