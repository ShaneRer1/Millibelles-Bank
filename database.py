from sqlalchemy import create_engine, Column, String, Float
from sqlalchemy.orm import sessionmaker, DeclarativeBase

DATABASE_URL = "sqlite:///./expenses.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind = engine)

class Base(DeclarativeBase):
    pass

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(String, primary_key=True)
    date = Column(String)
    category = Column(String)
    amount = Column(Float)
    description = Column(String)


class Budget(Base):
    __tablename__ = "budgets"
    category = Column(String, primary_key=True)
    amount = Column(Float)

def init_db():
    Base.metadata.create_all(bind= engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()