from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class Game(Base):
    __tablename__ = "games"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    current_turn_player_id = Column(Integer, ForeignKey('player_states.id'), nullable=True)
    status = Column(String(20), nullable=False)
    winner_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    @property
    def player_states(self):
        from sqlalchemy import inspect as _sa_inspect
        _sess = _sa_inspect(self).session
        if _sess is None or self.current_turn_player_id is None:
            return None
        from app.models.player_states import PlayerState
        return _sess.query(PlayerState).get(self.current_turn_player_id)

    @property
    def winner(self):
        from sqlalchemy import inspect as _sa_inspect
        _sess = _sa_inspect(self).session
        if _sess is None or self.winner_id is None:
            return None
        from app.models.users import User
        return _sess.query(User).get(self.winner_id)

    @property
    def current_turn_player(self):
        from sqlalchemy import inspect as _sa_inspect
        _sess = _sa_inspect(self).session
        if _sess is None or self.current_turn_player_id is None:
            return None
        from app.models.player_states import PlayerState
        return _sess.query(PlayerState).get(self.current_turn_player_id)


