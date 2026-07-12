import logging
import sys

LOG_FORMAT = (
    "%(asctime)s | "
    "%(levelname)-8s | "
    "%(name)s | "
    "%(filename)s:%(lineno)d | "
    "%(message)s"
)


def get_logger(name: str = "FastAPI") -> logging.Logger:
    logger = logging.getLogger(name)

    # Prevent duplicate handlers
    if logger.handlers:
        return logger

    logger.setLevel(logging.DEBUG)
    logger.propagate = False

    console_handler = logging.StreamHandler(sys.stdout)

    console_handler.setFormatter(
        logging.Formatter(
            LOG_FORMAT,
            datefmt="%Y-%m-%d %H:%M:%S",
        )
    )

    logger.addHandler(console_handler)

    return logger


logger = get_logger()
