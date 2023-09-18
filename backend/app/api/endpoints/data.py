import logging
import io

from typing import List, Optional
from fastapi import APIRouter, Response


router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/{filename}")
async def retrieve(filename: str):
    with open('data/01325869_aa_2023-04-28.pdf', 'rb') as f:
        return Response(io.BytesIO(f.read()).getvalue(), media_type="application/pdf")