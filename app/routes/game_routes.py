from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from pydantic import BaseModel, Field, ConfigDict

from app.database import get_db
from app.models.games import Game
from app.models.player_states import PlayerState
from app.utils.auth import get_current_user

# Import User for type hinting in get_current_user, but only for type checking
# To avoid circular imports or module-level model imports in routes, use string literal for type hint
# current_user: "User"


class GameCreate(BaseModel):
    model_config = {"from_attributes": True}
    player_ids: List[int] = Field(min_length=1, description="List of user IDs participating in the game")


class GameUpdate(BaseModel):
    model_config = {"from_attributes": True}
    current_turn_player_id: Optional[int] = None
    status: Optional[str] = None
    winner_id: Optional[int] = None


class GameResponse(BaseModel):
    id: int
    current_turn_player_id: Optional[int] = None
    status: str
    winner_id: Optional[int] = None
    created_at: str
    updated_at: str

    model_config = ConfigDict(from_attributes=True)


class PlayerStateResponse(BaseModel):
    id: int
    game_id: int
    user_id: int
    current_position: int
    turn_order: int

    model_config = ConfigDict(from_attributes=True)


class RollDiceRequest(BaseModel):
    model_config = {"from_attributes": True}
    dice_roll: int = Field(..., ge=1, le=6, description="The result of the dice roll")

game_router = APIRouter()


@game_router.post("/games", response_model=GameResponse, status_code=status.HTTP_201_CREATED)
def create_game(
    game_in: GameCreate,
    db: Session = Depends(get_db),
    current_user: "User" = Depends(get_current_user)
):
    from app.models.users import User # Lazy import

    # Validate player_ids exist
    for user_id in game_in.player_ids:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")

    new_game = Game(status="pending")
    db.add(new_game)
    db.commit()
    db.refresh(new_game)

    # Initialize player states
    for i, user_id in enumerate(game_in.player_ids):
        player_state = PlayerState(
            game_id=new_game.id,
            user_id=user_id,
            current_position=0,
            turn_order=i + 1
        )
        db.add(player_state)
    db.commit()
    db.refresh(player_state)
    db.refresh(new_game)

    return new_game


@game_router.get("/games", response_model=List[GameResponse])
def get_games(
    status: Optional[str] = Query(None, description="Filter by game status"),
    player_id: Optional[int] = Query(None, description="Filter by player participating in the game"),
    db: Session = Depends(get_db),
    current_user: "User" = Depends(get_current_user)
):
    query = db.query(Game)
    if status:
        query = query.filter(Game.status == status)
    if player_id:
        query = query.join(PlayerState).filter(PlayerState.user_id == player_id)
    games = query.all()
    return games


@game_router.get("/games/{game_id}", response_model=GameResponse)
def get_game(
    game_id: int = Path(..., description="The ID of the game to retrieve"),
    db: Session = Depends(get_db),
    current_user: "User" = Depends(get_current_user)
):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


@game_router.patch("/games/{game_id}", response_model=GameResponse)
def update_game(
    game_id: int = Path(..., description="The ID of the game to update"),
    game_in: GameUpdate = Body(..., description="Game update data"),
    db: Session = Depends(get_db),
    current_user: "User" = Depends(get_current_user)
):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    update_data = game_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(game, key, value)

    game.updated_at = func.now() # Manually update timestamp if not handled by ORM events
    db.add(game)
    db.commit()
    db.refresh(game)
    return game


@game_router.post("/games/{game_id}/roll_dice", response_model=PlayerStateResponse)
def roll_dice(
    game_id: int = Path(..., description="The ID of the game"),
    roll_request: RollDiceRequest = Body(..., description="Dice roll value"),
    db: Session = Depends(get_db),
    current_user: "User" = Depends(get_current_user)
):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    # For simplicity, assume current_user is the one rolling the dice
    player_state = db.query(PlayerState).filter(
        PlayerState.game_id == game_id,
        PlayerState.user_id == current_user.id
    ).first()

    if not player_state:
        raise HTTPException(status_code=404, detail="Player state not found for current user in this game")

    # Basic game logic: update player position
    player_state.current_position += roll_request.dice_roll
    db.add(player_state)
    db.commit()
    db.refresh(player_state)

    # You might want to add more complex game logic here, e.g., checking for winner,
    # updating game status, changing current_turn_player_id in the Game object, etc.
    # For now, just returning the updated player state.

    return player_state


@game_router.get("/games/{game_id}/player_states", response_model=List[PlayerStateResponse])
def get_game_player_states(
    game_id: int = Path(..., description="The ID of the game"),
    db: Session = Depends(get_db),
    current_user: "User" = Depends(get_current_user)
):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    player_states = db.query(PlayerState).filter(PlayerState.game_id == game_id).all()
    return player_states


@game_router.patch("/games/{game_id}/join", response_model=GameResponse)
def join_game(
    game_id: int = Path(..., description="The ID of the game to join"),
    db: Session = Depends(get_db),
    current_user: "User" = Depends(get_current_user)
):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    # Check if user is already in the game
    existing_player_state = db.query(PlayerState).filter(
        PlayerState.game_id == game_id,
        PlayerState.user_id == current_user.id
    ).first()

    if existing_player_state:
        raise HTTPException(status_code=400, detail="User is already in this game")

    # Add new player state for the current user
    # Determine turn order based on existing players
    max_turn_order = db.query(func.max(PlayerState.turn_order)).filter(PlayerState.game_id == game_id).scalar()
    new_turn_order = (max_turn_order or 0) + 1

    player_state = PlayerState(
        game_id=game_id,
        user_id=current_user.id,
        current_position=0,
        turn_order=new_turn_order
    )
    db.add(player_state)
    db.commit()
    db.refresh(player_state)
    db.refresh(game) # Refresh game to reflect potential changes if game logic updates it
    return game


@game_router.patch("/games/{game_id}/leave", response_model=GameResponse)
def leave_game(
    game_id: int = Path(..., description="The ID of the game to leave"),
    db: Session = Depends(get_db),
    current_user: "User" = Depends(get_current_user)
):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    player_state = db.query(PlayerState).filter(
        PlayerState.game_id == game_id,
        PlayerState.user_id == current_user.id
    ).first()

    if not player_state:
        raise HTTPException(status_code=400, detail="User is not a participant in this game")

    db.delete(player_state)
    db.commit()
    db.refresh(game) # Refresh game to reflect potential changes if game logic updates it
    return game
