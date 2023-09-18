import logging
import io

from typing import List, Optional
from fastapi import APIRouter, Response


router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/{filename}")
async def retrieve(filename: str):
    with open(f'data/{filename}', 'rb') as f:
        return Response(io.BytesIO(f.read()).getvalue(), media_type="application/pdf")