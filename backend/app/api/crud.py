from typing import Optional, cast, Sequence, List
import sqlalchemy
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update
from sqlalchemy.dialects.postgresql import insert
from app.db.models.base import Conversation, Message, Document, ConversationDocument, KnowledgeGraph
from app.schemas import pydantic_schema


async def fetch_conversation_with_messages(db: AsyncSession, conversation_id: str) -> Optional[pydantic_schema.Conversation]:
    """
    Fetch a conversation with its messages + messagesubprocesses
    return None if the conversation with the given id does not exist
    """

    # Eagerly load required relationships
    stmt = (
        select(Conversation)
        .options(joinedload(Conversation.messages).subqueryload(Message.sub_processes))
        .options(
            joinedload(Conversation.conversation_documents).subqueryload(
                ConversationDocument.document
            )
        )
        .where(Conversation.id == conversation_id)
    )

    result = await db.execute(stmt)  # execute the statement
    conversation = result.scalars().first()  # get the first result
    if conversation is not None:
        convo_dict = {
            **conversation.__dict__,
            "documents": [
                convo_doc.document for convo_doc in conversation.conversation_documents
            ],
        }
        return pydantic_schema.Conversation(**convo_dict)

    return None


async def delete_conversation(db: AsyncSession, conversation_id: str) -> bool:
    stmt = delete(Conversation).where(Conversation.id == conversation_id)
    result = await db.execute(stmt)
    await db.commit()

    return result.rowcount > 0


async def fetch_message_with_sub_processes(db: AsyncSession, message_id: str) -> Optional[pydantic_schema.Message]:
    """
    Fetch a message with its sub processes
    return None if the message with the given id does not exist
    """

    # Eagerly load required relationships
    stmt = (
        select(Message)
        .options(joinedload(Message.sub_processes))
        .where(Message.id == message_id)
    )
    result = await db.execute(stmt)  # execute the statement
    message = result.scalars().first()  # get the first result
    if message is not None:
        return pydantic_schema.Message.from_orm(message)

    return None


async def fetch_documents(
    db: AsyncSession,
    id: Optional[str] = None,
    ids: Optional[List[str]] = None,
    url: Optional[str] = None,
    limit: Optional[int] = None,
) -> Optional[Sequence[pydantic_schema.Document]]:
    """
    Fetch a document by its url or id
    """

    stmt = select(Document)
    if id is not None:
        stmt = stmt.where(Document.id == id)
        limit = 1
    elif ids is not None:
        stmt = stmt.where(Document.id.in_(ids))
    if url is not None:
        stmt = stmt.where(Document.url == url)
    if limit is not None:
        stmt = stmt.limit(limit)
    result = await db.execute(stmt)
    documents = result.scalars().all()

    return [pydantic_schema.Document.from_orm(doc) for doc in documents]


async def upsert_document(db: AsyncSession, document: pydantic_schema.Document) -> pydantic_schema.Document:
    """
    Upsert a document
    """

    stmt = insert(Document).values(**document.dict(exclude_none=True))
    stmt = stmt.on_conflict_do_update(
        index_elements=[Document.url],
        set_=document.dict(include={"metadata_map"}),
    )
    stmt = stmt.returning(Document)
    result = await db.execute(stmt)
    upserted_doc = pydantic_schema.Document.from_orm(result.scalars().first())
    await db.commit()

    return upserted_doc


async def create_conversation(db: AsyncSession, convo_payload: pydantic_schema.ConversationCreate) -> pydantic_schema.Conversation:
    conversation = Conversation()
    convo_doc_db_objects = [
        ConversationDocument(document_id=doc_id, conversation=conversation)
        for doc_id in convo_payload.document_ids
    ]
    db.add(conversation)
    db.add_all(convo_doc_db_objects)
    await db.commit()
    await db.refresh(conversation)

    return await fetch_conversation_with_messages(db, conversation.id)


async def create_kg_index(db: AsyncSession, index_id: str) -> str:
    """
    Create a knowledge graph if it doesn't exist already
    """

    kg = KnowledgeGraph(index_id=index_id)

    # Check if one already exists
    existing = (select(KnowledgeGraph.index_id))
    result = await db.execute(existing)
    
    if(len(result.scalars().all()) == 0):
        db.add(kg)
        await db.commit()
        await db.refresh(kg)

    return fetch_kg_index(db)


async def fetch_kg_index(db: AsyncSession) -> str:
    """
    Fetch the knowledge graph id
    """

    stmt = select(KnowledgeGraph.index_id)
    result = await db.execute(stmt)
    index_ids = result.scalars().all()

    return str(index_ids[0])
