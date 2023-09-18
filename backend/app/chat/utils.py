from app.schema import (
    Document as DocumentSchema,
    DocumentMetadataKeysEnum,
    DocumentMetadata,
)

def build_title_for_document(document: DocumentSchema) -> str:
    # sec_metadata = DocumentMetadata.parse_obj(
    #     document.metadata_map[DocumentMetadataKeysEnum.SEC_DOCUMENT]
    # )
    # time_period = (
    #     f"{sec_metadata.year} Q{sec_metadata.quarter}"
    #     if sec_metadata.quarter is not None
    #     else str(sec_metadata.year)
    # )
    # return f"{sec_metadata.company_name} ({sec_metadata.company_ticker}) {sec_metadata.doc_type.value} ({time_period})"
    return("some metadata that i will fill later")
