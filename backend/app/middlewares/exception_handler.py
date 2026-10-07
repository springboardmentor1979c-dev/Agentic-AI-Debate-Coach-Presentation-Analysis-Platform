import logging
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from pydantic import ValidationError

logger = logging.getLogger("debate_coach_api")

class ExceptionHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        try:
            return await call_next(request)
        except ValidationError as val_err:
            logger.error(f"Validation error: {val_err}")
            return JSONResponse(
                status_code=422,
                content={"detail": val_err.errors(), "message": "Input validation failed."}
            )
        except Exception as exc:
            logger.error(f"Unhandled error: {exc}", exc_info=True)
            # Default to 500
            status_code = 500
            detail = "Internal Server Error"
            
            if isinstance(exc, StarletteHTTPException):
                status_code = exc.status_code
                detail = exc.detail
                
            return JSONResponse(
                status_code=status_code,
                content={"detail": detail}
            )
