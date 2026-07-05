from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.games import Game
from app.models.users import User
from app.models.player_states import PlayerState

stats_router = APIRouter()

@stats_router.get("/stats/summary")
def get_summary_stats(db: Session = Depends(get_db)):
    """
    Returns aggregate counts and key metrics for the dashboard, such as total games, active games, and registered users.
    """
    total_users = db.query(User).count()
    total_games = db.query(Game).count()
    active_games = db.query(Game).filter(Game.winner_id.is_(None)).count()
    total_player_states = db.query(PlayerState).count()

    return {
        "total_users": total_users,
        "total_games": total_games,
        "active_games": active_games,
        "total_player_states": total_player_states,
    }
