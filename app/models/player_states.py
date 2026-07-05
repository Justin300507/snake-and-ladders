from sqlalchemy import Column, Integer, ForeignKey, String
from app.database import Base


class PlayerState(Base):
    __tablename__ = "player_states"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    current_position = Column(Integer, nullable=False)
    turn_order = Column(Integer, nullable=False)
    order = Column(Integer, default=0, nullable=False)
    position = Column(String, server_default='', nullable=False)

    @property
    def user(self):
        from sqlalchemy import inspect as _sa_inspect
        _sess = _sa_inspect(self).session
        if _sess is None or self.user_id is None:
            return None
        from app.models.users import User
        return _sess.query(User).get(self.user_id)

    @property
    def game(self):
        from sqlalchemy import inspect as _sa_inspect
        _sess = _sa_inspect(self).session
        if _sess is None or self.game_id is None:
            return None
        from app.models.games import Game
        return _sess.query(Game).get(self.game_id)

