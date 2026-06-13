from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.schemas.ticket import ReallocateRequest, ReallocateResponse
from app.services.ticket_service import TicketService

router = APIRouter()


@router.post("/reallocate", response_model=ReallocateResponse)
def reallocate_ticket(
    payload: ReallocateRequest,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
) -> ReallocateResponse:
    try:
        result = TicketService.process_reallocation(
            db,
            pnr=payload.pnr,
            new_train_id=payload.new_train_id,
            departure_time=payload.departure_time,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    return ReallocateResponse(
        check=result["check"],
        ticket=result["ticket"],
        alternatives_considered=result["alternatives_considered"],
        multihop_options=result["multihop_options"],
    )
