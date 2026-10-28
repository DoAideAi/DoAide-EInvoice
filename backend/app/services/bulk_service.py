import csv
import io

from app.models.invoice import InvoiceRequest, InvoiceItem, Address, BulkInvoiceRow
from app.services.invoice_service import generate_irn_json


def parse_csv(content: str) -> list[BulkInvoiceRow]:
    reader = csv.DictReader(io.StringIO(content))
    rows = []
    for row in reader:
        rows.append(BulkInvoiceRow(
            invoice_number=row.get("invoice_number", "").strip(),
            invoice_date=row.get("invoice_date", "").strip(),
            seller_gstin=row.get("seller_gstin", "").strip(),
            seller_name=row.get("seller_name", "").strip(),
            buyer_gstin=row.get("buyer_gstin", "").strip(),
            buyer_name=row.get("buyer_name", "").strip(),
            item_description=row.get("item_description", "").strip(),
            hsn_code=row.get("hsn_code", "").strip(),
            quantity=float(row.get("quantity", 1)),
            unit_price=float(row.get("unit_price", 0)),
            gst_rate=float(row.get("gst_rate", 18)),
            is_igst=row.get("is_igst", "").strip().lower() in ("true", "1", "yes"),
        ))
    return rows


def bulk_to_irn(rows: list[BulkInvoiceRow]) -> list[dict]:
    grouped: dict[str, list[BulkInvoiceRow]] = {}
    for r in rows:
        grouped.setdefault(r.invoice_number, []).append(r)

    results = []
    for inv_no, items in grouped.items():
        first = items[0]
        req = InvoiceRequest(
            invoice_number=inv_no,
            invoice_date=first.invoice_date,
            seller=Address(legal_name=first.seller_name, gstin=first.seller_gstin),
            buyer=Address(legal_name=first.buyer_name, gstin=first.buyer_gstin),
            items=[
                InvoiceItem(
                    description=it.item_description,
                    hsn_code=it.hsn_code,
                    quantity=it.quantity,
                    unit_price=it.unit_price,
                    gst_rate=it.gst_rate,
                )
                for it in items
            ],
            is_igst=first.is_igst,
        )
        results.append(generate_irn_json(req))
    return results


SAMPLE_CSV = """invoice_number,invoice_date,seller_gstin,seller_name,buyer_gstin,buyer_name,item_description,hsn_code,quantity,unit_price,gst_rate,is_igst
INV-001,28/10/2024,29ABCDE1234F1Z5,ABC Traders,27XYZAB5678C1D6,XYZ Enterprises,Steel Rods,7213,100,450,18,false
INV-001,28/10/2024,29ABCDE1234F1Z5,ABC Traders,27XYZAB5678C1D6,XYZ Enterprises,Cement Bags,2523,50,350,28,false
INV-002,28/10/2024,29ABCDE1234F1Z5,ABC Traders,06PQRST9876U1V2,PQR Industries,Machine Parts,8483,10,5000,18,true"""
