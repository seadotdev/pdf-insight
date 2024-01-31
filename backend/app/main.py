import uvicorn
import logging
import sys
from starlette.middleware.cors import CORSMiddleware
from app.api.api import api_router
from app.core.config import settings, AppEnvironment
from app.loader_io import loader_io_router
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

logger = logging.getLogger(__name__)


def __setup_logging(log_level: str):
    log_level = getattr(logging, log_level.upper())
    log_formatter = logging.Formatter(
        "%(asctime)s [%(threadName)-12.12s] [%(levelname)-5.5s]  %(message)s"
    )
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setFormatter(log_formatter)
    root_logger.addHandler(stream_handler)
    logger.info("Set up logging with log level %s", log_level)


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
)


if settings.BACKEND_CORS_ORIGINS:
    # allow all origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins= settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_PREFIX)
app.mount(f"/{settings.LOADER_IO_VERIFICATION_STR}", loader_io_router)


def start():
    print("Running in AppEnvironment: " + settings.ENVIRONMENT.value)
    __setup_logging(settings.LOG_LEVEL)
        
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        workers=settings.UVICORN_WORKER_COUNT,
    )

if __name__ == "__main__":
    start()
