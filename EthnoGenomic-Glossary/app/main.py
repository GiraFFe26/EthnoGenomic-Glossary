from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import search, terms, auth, admin
from app.db.db import Base, engine
# Import models to ensure metadata is populated
from app.models import term as _term_model  # noqa: F401
from app.models import relation as _relation_model  # noqa: F401
from app.models import user as _user_model  # noqa: F401
from app.db.seed import seed_initial_data


def init_db():
    # For template purposes; in production prefer proper migrations.
    Base.metadata.create_all(bind=engine)
    seed_initial_data(engine)


init_db()

app = FastAPI(title="EthnoGenomic Glossary", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(terms.router)
app.include_router(search.router)
app.include_router(auth.router)
app.include_router(admin.router)


@app.get("/health")
def healthcheck():
    return {"status": "ok"}
