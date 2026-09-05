from fastapi import APIRouter, Depends

from app.schemas.copilot import (
    SuggestReplyRequest,
    SuggestReplyResponse,
    SummarizeRequest,
    SummarizeResponse,
    KBRetrieveRequest,
    KBSnippet,
)
from app.schemas.common import ApiResponse
from app.core.security import get_current_user
from app.services import copilot_service

router = APIRouter()


@router.post("/suggest-reply", response_model=ApiResponse[SuggestReplyResponse])
async def suggest_reply(
    body: SuggestReplyRequest,
    current_user: dict = Depends(get_current_user),
):
    result = await copilot_service.suggest_reply(
        tenant_id=current_user["tenant_id"],
        ticket_id=body.ticket_id,
        conversation_id=body.conversation_id,
        context=body.context,
    )
    return ApiResponse(data=SuggestReplyResponse(**result))


@router.post("/summarize", response_model=ApiResponse[SummarizeResponse])
async def summarize(
    body: SummarizeRequest,
    current_user: dict = Depends(get_current_user),
):
    result = await copilot_service.summarize(
        tenant_id=current_user["tenant_id"],
        ticket_id=body.ticket_id,
        conversation_id=body.conversation_id,
    )
    return ApiResponse(data=SummarizeResponse(**result))


@router.post("/retrieve-kb", response_model=ApiResponse[list[KBSnippet]])
async def retrieve_kb(
    body: KBRetrieveRequest,
    current_user: dict = Depends(get_current_user),
):
    snippets = await copilot_service.retrieve_kb_snippets(
        tenant_id=current_user["tenant_id"],
        query=body.query,
        top_k=body.top_k,
    )
    return ApiResponse(data=[KBSnippet(**s) for s in snippets])
