import importlib
import os
import threading
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

# Render/Heroku provide postgres:// but SQLAlchemy 1.4+ requires postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Top-level engine assignment so validators can detect the exported symbol
_engine_kwargs = (
    {"connect_args": {"check_same_thread": False}}
    if DATABASE_URL.startswith("sqlite")
    else {"pool_pre_ping": True, "pool_recycle": 300}
)
engine = create_engine(DATABASE_URL, **_engine_kwargs)

# SQLite: enable WAL mode + 5s busy timeout to prevent write-lock hangs after any 500 error.
# WAL allows concurrent reads while a write is in progress; busy_timeout retries the lock
# instead of immediately raising "database is locked", preventing the cascade of timeouts
# that occur when a failed db.commit() leaves the connection in a dirty state.
if DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def _set_sqlite_pragmas(dbapi_conn, _record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA busy_timeout=5000")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def _add_missing_columns():
    """ALTER TABLE ADD COLUMN for any mapped columns missing from existing tables."""
    try:
        from sqlalchemy import inspect as _inspect, text as _text
        insp = _inspect(engine)
        existing_tables = set(insp.get_table_names())
        with engine.begin() as conn:
            for table in Base.metadata.sorted_tables:
                if table.name not in existing_tables:
                    continue
                try:
                    existing_cols = {c["name"] for c in insp.get_columns(table.name)}
                except Exception:
                    continue
                for col in table.columns:
                    if col.name in existing_cols:
                        continue
                    try:
                        type_str = col.type.compile(dialect=engine.dialect)
                    except Exception:
                        type_str = "TEXT"
                    try:
                        conn.execute(_text(
                            f"ALTER TABLE {table.name} ADD COLUMN {col.name} {type_str}"
                        ))
                    except Exception:
                        pass
    except Exception:
        pass


def create_tables():
    """Import every model in app/models/ then create all tables."""
    # Use CWD-relative path; uvicorn and pre-flight subprocess run from backend dir
    models_dir = os.path.join("app", "models")
    if os.path.isdir(models_dir):
        for fname in sorted(os.listdir(models_dir)):
            if fname.endswith(".py") and fname not in ("__init__.py",):
                mod_name = fname[:-3]
                try:
                    importlib.import_module(f"app.models.{mod_name}")
                except Exception:
                    pass
    Base.metadata.create_all(bind=engine)
    if DATABASE_URL.startswith("sqlite"):
        _add_missing_columns()


def get_db_url() -> str:
    """Return the active database URL (exported so main.py can import it)."""
    return DATABASE_URL


# Lazy, one-time schema creation on the SAME engine the request handlers use.
# This is the safety net that makes deployment work regardless of what main.py
# does. Generated main.py files frequently create their own throwaway engine
# (e.g. sqlite:///./sql_app.db) and run Base.metadata.create_all against THAT,
# so on a real deployment (where DATABASE_URL points at Postgres) the tables get
# created on the wrong database and every handler query hits an empty one —
# "relation does not exist" / "no such table" 500s on the very first request.
# Locally this is masked by an out-of-band pre-flight create_tables() that does
# not run on Render/Heroku. Creating the tables here, bound to `engine`
# (== SessionLocal's bind), guarantees the schema exists on the database the
# handlers actually query. create_all is idempotent (checkfirst=True), so this
# is a no-op when the tables already exist.
_tables_ready = False
_tables_lock = threading.Lock()


def _ensure_tables_once():
    global _tables_ready
    if _tables_ready:
        return
    with _tables_lock:
        if _tables_ready:
            return
        try:
            create_tables()
        except Exception:
            pass
        _tables_ready = True


def get_db():
    _ensure_tables_once()
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
