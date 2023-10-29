from sqlalchemy import UUID, Column, DateTime, create_engine, func
from sqlalchemy.orm import declarative_base


Base = declarative_base()
class KnowledgeGraph(Base):
    __tablename__ = "knowledgegraph"

    id = Column(UUID, primary_key=True, index=True, default=func.uuid_generate_v4())
    index_id = Column(UUID(as_uuid=True), nullable=False, unique=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)


try:
    engine = create_engine("postgresql://raccoon:GZ6OukLei5O5N9fCS0MPNtzeNbRJQlNa@dpg-ckunsamb0mos73c3hn10-a.frankfurt-postgres.render.com/seadotdev_db")
    Base.metadata.create_all(engine)
except Exception as e:
    print('Unable to access postgresql database', repr(e))
