from fastapi import APIRouter, Request, UploadFile, File, HTTPException
from fastapi.responses import Response

from app import db
from app.models.invoice import InvoiceRequest, EWayBillRequest
from app.services import hsn_service, invoice_service, bulk_service, gemini_service
from app.services.pdf_service import generate_invoice_pdf

router = APIRouter(prefix="/api")

FREE_LIMIT = 5


def _ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    return forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else "unknown")


@router.get("/hsn/search")
def hsn_search(q: str = "", limit: int = 20):
    return {"results": hsn_service.search_hsn(q, min(limit, 50))}


@router.post("/hsn/suggest")
async def hsn_suggest(body: dict):
    description = body.get("description", "")
    if not description:
        raise HTTPException(400, "description required")
    results = await gemini_service.suggest_hsn(description)
    return {"results": results}


@router.post("/gstin/autofill")
async def gstin_autofill(body: dict):
    gstin = body.get("gstin", "")
    if not gstin:
        raise HTTPException(400, "gstin required")
    result = await gemini_service.gstin_autofill(gstin)
    return {"result": result}


@router.post("/invoice/generate")
def generate_invoice(req: InvoiceRequest, request: Request):
    ip_hash = invoice_service.hash_ip(_ip(request))
    count = db.get_monthly_count(ip_hash)
    if count >= FREE_LIMIT:
        return {"error": "free_limit_reached", "count": count, "limit": FREE_LIMIT}

    irn_json = invoice_service.generate_irn_json(req)
    inv_id = invoice_service.generate_invoice_id()
    db.save_invoice(inv_id, irn_json, "e-invoice", ip_hash)
    db.increment_usage(ip_hash)
    return {"id": inv_id, "irn_json": irn_json, "count": count + 1, "limit": FREE_LIMIT}


@router.post("/invoice/pdf")
def invoice_pdf(req: InvoiceRequest):
    irn_json = invoice_service.generate_irn_json(req)
    pdf_bytes = generate_invoice_pdf(irn_json)
    filename = f"invoice_{req.invoice_number.replace('/', '-')}.pdf"
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="{filename}"'})


@router.post("/eway/generate")
def generate_eway(req: EWayBillRequest, request: Request):
    ip_hash = invoice_service.hash_ip(_ip(request))
    count = db.get_monthly_count(ip_hash)
    if count >= FREE_LIMIT:
        return {"error": "free_limit_reached", "count": count, "limit": FREE_LIMIT}

    eway_json = invoice_service.generate_eway_json(req)
    inv_id = invoice_service.generate_invoice_id()
    db.save_invoice(inv_id, eway_json, "e-way-bill", ip_hash)
    db.increment_usage(ip_hash)
    return {"id": inv_id, "eway_json": eway_json, "count": count + 1, "limit": FREE_LIMIT}


@router.post("/bulk/upload")
async def bulk_upload(request: Request, file: UploadFile = File(...)):
    ip_hash = invoice_service.hash_ip(_ip(request))
    count = db.get_monthly_count(ip_hash)
    if count >= FREE_LIMIT:
        return {"error": "free_limit_reached", "count": count, "limit": FREE_LIMIT}

    content = (await file.read()).decode("utf-8-sig")
    try:
        rows = bulk_service.parse_csv(content)
    except Exception as e:
        raise HTTPException(400, f"CSV parse error: {e}")

    if not rows:
        raise HTTPException(400, "No valid rows found")

    remaining = FREE_LIMIT - count
    invoices_needed = len(set(r.invoice_number for r in rows))
    if invoices_needed > remaining:
        return {"error": "free_limit_reached", "count": count, "needed": invoices_needed, "limit": FREE_LIMIT}

    results = bulk_service.bulk_to_irn(rows)
    for r in results:
        inv_id = invoice_service.generate_invoice_id()
        db.save_invoice(inv_id, r, "bulk-invoice", ip_hash)
        db.increment_usage(ip_hash)

    return {"invoices": results, "count": count + len(results), "limit": FREE_LIMIT}


@router.get("/bulk/sample")
def bulk_sample():
    return Response(content=bulk_service.SAMPLE_CSV.strip(), media_type="text/csv", headers={"Content-Disposition": 'attachment; filename="sample_invoices.csv"'})


@router.get("/invoice/{invoice_id}")
def get_invoice(invoice_id: str):
    data = db.get_invoice(invoice_id)
    if not data:
        raise HTTPException(404, "Invoice not found")
    return {"data": data}


@router.get("/usage")
def get_usage(request: Request):
    ip_hash = invoice_service.hash_ip(_ip(request))
    count = db.get_monthly_count(ip_hash)
    return {"count": count, "limit": FREE_LIMIT}
