from fastapi import APIRouter, HTTPException
from app.models.schemas import InvestigateRequest, InvestigateResponse
from app.services.investigation_service import investigate as run_investigation

router = APIRouter(tags=["investigate"])


@router.post("/investigate", response_model=InvestigateResponse)
def investigate(payload: InvestigateRequest):
    if not payload.text and not payload.url:
        raise HTTPException(
            status_code=400, detail="Provide at least one of: text, url"
        )
    return run_investigation(payload.text, payload.url)
