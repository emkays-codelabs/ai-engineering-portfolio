"""
AI Customer Support Resolution Platform
----------------------------------------
Test Suite

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: (c) 2026 SaffronyxAI.in. All Rights Reserved.

Original work created for SaffronyxAI.in. Unauthorized copying,
reproduction, modification, redistribution, or commercial use is
prohibited without prior written permission from SaffronyxAI.in.
"""

import sys
from pathlib import Path

# Allow the test file to import prototype.py
PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

from prototype import classify_intent


def test_faq():
    intent, confidence = classify_intent(
        "What is your return policy?"
    )

    assert intent == "FAQ"
    assert confidence > 0


def test_account_issue():
    intent, confidence = classify_intent(
        "I forgot my password and cannot login"
    )

    assert intent == "Account Issue"
    assert confidence > 0


def test_order_issue():
    intent, confidence = classify_intent(
        "Where is my order?"
    )

    assert intent == "Order Issue"
    assert confidence > 0


def test_refund_issue():
    intent, confidence = classify_intent(
        "When will I receive my refund?"
    )

    assert intent == "Refund Issue"
    assert confidence > 0


def test_human_escalation():
    intent, confidence = classify_intent(
        "I want to speak to a human support agent"
    )

    assert intent == "Human Escalation"
    assert confidence > 0


def test_specific_order_question():
    intent, confidence = classify_intent(
        "What is my order status?"
    )

    assert intent == "Order Issue"


def test_unknown_request_escalates():
    intent, confidence = classify_intent(
        "Something unusual happened with my account"
    )

    assert intent == "Account Issue" or intent == "Human Escalation"
