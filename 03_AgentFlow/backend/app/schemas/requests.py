"""Request bodies accepted by the AgentFlow API.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

from pydantic import BaseModel


class RunRequest(BaseModel):
    query: str
    mode: str = "auto"
