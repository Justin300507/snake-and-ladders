from sqlalchemy import Column, Integer, String
from app.database import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    hashed_password = Column(String, server_default='', nullable=False)

    @property
    def player_states(self):
        from sqlalchemy import inspect as _sa_inspect
        _sess = _sa_inspect(self).session
        if _sess is None:
            return []
        from app.models.player_states import PlayerState
        return _sess.query(PlayerState).filter(PlayerState.user_id == self.id).all()

    @property
    def games(self):
        from sqlalchemy import inspect as _sa_inspect
        _sess = _sa_inspect(self).session
        if _sess is None:
            return []
        from app.models.games import Game
        return _sess.query(Game).filter(Game.winner_id == self.id).all()

    # Relationships
