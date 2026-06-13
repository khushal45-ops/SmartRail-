from sqlalchemy.orm import Session

from app.models.train import Train
from app.schemas.train import TrainCreate


class TrainService:
    @staticmethod
    def list_trains(db: Session, skip: int = 0, limit: int = 100) -> list[Train]:
        return db.query(Train).offset(skip).limit(limit).all()

    @staticmethod
    def get_train(db: Session, train_id: int) -> Train | None:
        return db.query(Train).filter(Train.id == train_id).first()

    @staticmethod
    def get_trains_by_zone(db: Session, zone_name: str) -> list[Train]:
        return db.query(Train).filter(Train.zone.ilike(zone_name)).all()

    @staticmethod
    def update_status(db: Session, train_id: int, status: str) -> Train | None:
        train = db.query(Train).filter(Train.id == train_id).first()
        if not train:
            return None
        train.status = status
        db.commit()
        db.refresh(train)
        return train

    @staticmethod
    def create_train(db: Session, train_in: TrainCreate) -> Train:
        train = Train(**train_in.model_dump())
        db.add(train)
        db.commit()
        db.refresh(train)
        return train
