from pathlib import Path
from typing import List, Optional

import pdfkit
from file_utils import filing_exists
from fire import Fire
from tqdm.contrib.itertools import product

DEFAULT_SOURCE_DIR = "data/"
# You can lookup the CIK for a company here: https://www.sec.gov/edgar/searchedgar/companysearch
DEFAULT_CIKS = [ "Bott" ]
DEFAULT_FILING_TYPES = [ "Something", "PnL"]


def _convert_to_pdf(output_dir: str):
    """Converts all html files in a directory to pdf files."""

    data_dir = Path(output_dir) / "sec-edgar-filings"
    for cik_dir in data_dir.iterdir():
        for filing_type_dir in cik_dir.iterdir():
            for filing_dir in filing_type_dir.iterdir():
                filing_doc = filing_dir / "filing-details.html"
                filing_pdf = filing_dir / "filing-details.pdf"
                if filing_doc.exists() and not filing_pdf.exists():
                    print("- Converting {}".format(filing_doc))
                    input_path = str(filing_doc.absolute())
                    output_path = str(filing_pdf.absolute())
                    try:
                        pdfkit.from_file(input_path, output_path, verbose=True)
                    except Exception as e:
                        print(f"Error converting {input_path} to {output_path}: {e}")


def main(
    output_dir: str = DEFAULT_SOURCE_DIR,
    ciks: List[str] = DEFAULT_CIKS,
    file_types: List[str] = DEFAULT_FILING_TYPES,
    before: Optional[str] = None,
    after: Optional[str] = None,
    amount: Optional[int] = 3,
    convert_to_pdf: bool = True,
):
    print('Downloading filings to "{}"'.format(Path(output_dir).absolute()))
    print("File Types: {}".format(file_types))
    for symbol, file_type in product(ciks, file_types):
        try:
            if filing_exists(symbol, file_type, output_dir):
                print(f"- Filing for {symbol} {file_type} already exists, skipping")
            else:
                print(f"- Downloading filing for {symbol} {file_type}")
                # _download_filing(symbol, file_type, output_dir, amount, before, after)
        except Exception as e:
            print(
                f"Error downloading filing for symbol={symbol} & file_type={file_type}: {e}"
            )

    if convert_to_pdf:
        print("Converting html files to pdf files")
        _convert_to_pdf(output_dir)


if __name__ == "__main__":
    Fire(main)
