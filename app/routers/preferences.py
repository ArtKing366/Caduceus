"""CRUD endpoints for the authenticated user's dietary preferences."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import DietaryPreference, User
from app.schemas import (
    DietaryPreferenceCreate,
    DietaryPreferenceRead,
    DietaryPreferenceUpdate,
)

router = APIRouter(prefix="/preferences", tags=["Dietary preferences"])


def _get_owned_preference(
    db: Session,
    preference_id: int,
    user_id: int,
) -> DietaryPreference:
    preference = db.scalars(
        select(DietaryPreference).where(
            DietaryPreference.id == preference_id,
            DietaryPreference.user_id == user_id,
        )
    ).first()
    if preference is None:
        # Do not disclose that another user's preference exists.
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dietary preference not found.",
        )
    return preference


def _check_duplicate(
    db: Session,
    *,
    user_id: int,
    preference_type: str,
    preference: str,
    exclude_id: int | None = None,
) -> bool:
    statement = select(DietaryPreference.id).where(
        DietaryPreference.user_id == user_id,
        DietaryPreference.preference_type == preference_type,
        DietaryPreference.preference == preference,
    )
    if exclude_id is not None:
        statement = statement.where(DietaryPreference.id != exclude_id)
    return db.scalar(statement) is not None


@router.get("", response_model=list[DietaryPreferenceRead], summary="List my preferences")
def list_my_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[DietaryPreference]:
    return list(
        db.scalars(
            select(DietaryPreference)
            .where(DietaryPreference.user_id == current_user.id)
            .order_by(DietaryPreference.created_at.desc(), DietaryPreference.id.desc())
        ).all()
    )


@router.post(
    "",
    response_model=DietaryPreferenceRead,
    status_code=status.HTTP_201_CREATED,
    summary="Add a dietary preference",
)
def create_preference(
    payload: DietaryPreferenceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DietaryPreference:
    preference_text = payload.preference.strip()
    if _check_duplicate(
        db,
        user_id=current_user.id,
        preference_type=payload.preference_type,
        preference=preference_text,
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This preference already exists for your account.",
        )

    preference = DietaryPreference(
        user_id=current_user.id,  # Never accept user_id from the request body.
        preference_type=payload.preference_type,
        preference=preference_text,
        is_strict=payload.is_strict,
        notes=payload.notes,
    )
    db.add(preference)
    try:
        db.commit()
        db.refresh(preference)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This preference already exists for your account.",
        )
    return preference


@router.patch(
    "/{preference_id}",
    response_model=DietaryPreferenceRead,
    summary="Update one of my preferences",
)
def update_preference(
    preference_id: int,
    payload: DietaryPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DietaryPreference:
    preference = _get_owned_preference(db, preference_id, current_user.id)
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No preference fields were provided.",
        )

    # Do not allow explicit nulls for non-null database columns.
    for field in ("preference_type", "preference", "is_strict"):
        if field in changes and changes[field] is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Field '{field}' cannot be null.",
            )

    new_type = changes.get("preference_type", preference.preference_type)
    new_text = changes.get("preference", preference.preference).strip()
    if _check_duplicate(
        db,
        user_id=current_user.id,
        preference_type=new_type,
        preference=new_text,
        exclude_id=preference.id,
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This preference already exists for your account.",
        )

    if "preference" in changes:
        changes["preference"] = new_text
    for field, value in changes.items():
        setattr(preference, field, value)

    try:
        db.add(preference)
        db.commit()
        db.refresh(preference)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This preference already exists for your account.",
        )
    return preference


@router.delete(
    "/{preference_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete one of my preferences",
)
def delete_preference(
    preference_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    preference = _get_owned_preference(db, preference_id, current_user.id)
    db.delete(preference)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
