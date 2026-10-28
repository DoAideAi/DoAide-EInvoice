import hashlib
import json
import time
import uuid

from app.models.invoice import InvoiceRequest, EWayBillRequest


def _compute_tax(item_total: float, gst_rate: float, is_igst: bool) -> dict:
    tax_amount = round(item_total * gst_rate / 100, 2)
    if is_igst:
        return {"igst": tax_amount, "cgst": 0, "sgst": 0}
    half = round(tax_amount / 2, 2)
    return {"igst": 0, "cgst": half, "sgst": tax_amount - half}


def generate_irn_json(req: InvoiceRequest) -> dict:
    items_out = []
    total_value = 0
    total_taxable = 0
    total_igst = 0
    total_cgst = 0
    total_sgst = 0

    for idx, item in enumerate(req.items, 1):
        item_total = round(item.quantity * item.unit_price - item.discount, 2)
        taxes = _compute_tax(item_total, item.gst_rate, req.is_igst)
        item_tax = taxes["igst"] + taxes["cgst"] + taxes["sgst"]

        items_out.append({
            "SlNo": str(idx),
            "PrdDesc": item.description,
            "IsServc": "N",
            "HsnCd": item.hsn_code,
            "Qty": item.quantity,
            "Unit": item.unit,
            "UnitPrice": item.unit_price,
            "Discount": item.discount,
            "TotAmt": round(item.quantity * item.unit_price, 2),
            "AssAmt": item_total,
            "GstRt": item.gst_rate,
            "IgstAmt": taxes["igst"],
            "CgstAmt": taxes["cgst"],
            "SgstAmt": taxes["sgst"],
            "TotItemVal": round(item_total + item_tax, 2),
        })
        total_taxable += item_total
        total_igst += taxes["igst"]
        total_cgst += taxes["cgst"]
        total_sgst += taxes["sgst"]

    total_value = round(total_taxable + total_igst + total_cgst + total_sgst, 2)

    irn_payload = {
        "Version": "1.1",
        "TranDtls": {
            "TaxSch": "GST",
            "SupTyp": req.supply_type,
            "RegRev": req.reverse_charge,
        },
        "DocDtls": {
            "Typ": "INV",
            "No": req.invoice_number,
            "Dt": req.invoice_date,
        },
        "SellerDtls": {
            "Gstin": req.seller.gstin,
            "LglNm": req.seller.legal_name,
            "Addr1": req.seller.address,
            "Loc": req.seller.city,
            "Stcd": req.seller.state,
            "Pin": int(req.seller.pincode) if req.seller.pincode else 0,
            "Ph": req.seller.phone,
            "Em": req.seller.email,
        },
        "BuyerDtls": {
            "Gstin": req.buyer.gstin,
            "LglNm": req.buyer.legal_name,
            "Addr1": req.buyer.address,
            "Pos": req.buyer.state,
            "Loc": req.buyer.city,
            "Stcd": req.buyer.state,
            "Pin": int(req.buyer.pincode) if req.buyer.pincode else 0,
            "Ph": req.buyer.phone,
            "Em": req.buyer.email,
        },
        "ItemList": items_out,
        "ValDtls": {
            "AssVal": round(total_taxable, 2),
            "IgstVal": round(total_igst, 2),
            "CgstVal": round(total_cgst, 2),
            "SgstVal": round(total_sgst, 2),
            "TotInvVal": total_value,
        },
    }
    return irn_payload


def generate_eway_json(req: EWayBillRequest) -> dict:
    items_out = []
    total_value = 0
    total_taxable = 0
    total_igst = 0
    total_cgst = 0
    total_sgst = 0

    for item in req.items:
        item_total = round(item.quantity * item.unit_price - item.discount, 2)
        taxes = _compute_tax(item_total, item.gst_rate, req.is_igst)
        item_tax = taxes["igst"] + taxes["cgst"] + taxes["sgst"]
        items_out.append({
            "productName": item.description,
            "hsnCode": item.hsn_code,
            "quantity": item.quantity,
            "unit": item.unit,
            "taxableAmount": item_total,
            "gstRate": item.gst_rate,
            "igstAmount": taxes["igst"],
            "cgstAmount": taxes["cgst"],
            "sgstAmount": taxes["sgst"],
        })
        total_taxable += item_total
        total_igst += taxes["igst"]
        total_cgst += taxes["cgst"]
        total_sgst += taxes["sgst"]

    total_value = round(total_taxable + total_igst + total_cgst + total_sgst, 2)

    return {
        "supplyType": "O",
        "subSupplyType": "1",
        "docType": "INV",
        "docNo": req.invoice_number,
        "docDate": req.invoice_date,
        "fromGstin": req.seller.gstin,
        "fromTrdName": req.seller.legal_name,
        "fromAddr1": req.seller.address,
        "fromPlace": req.seller.city,
        "fromStateCode": req.seller.state,
        "fromPincode": int(req.seller.pincode) if req.seller.pincode else 0,
        "toGstin": req.buyer.gstin,
        "toTrdName": req.buyer.legal_name,
        "toAddr1": req.buyer.address,
        "toPlace": req.buyer.city,
        "toStateCode": req.buyer.state,
        "toPincode": int(req.buyer.pincode) if req.buyer.pincode else 0,
        "totalValue": round(total_taxable, 2),
        "cgstValue": round(total_cgst, 2),
        "sgstValue": round(total_sgst, 2),
        "igstValue": round(total_igst, 2),
        "totInvValue": total_value,
        "transporterId": req.transporter_id,
        "transporterName": req.transporter_name,
        "transMode": req.transport_mode,
        "vehicleNo": req.vehicle_number,
        "vehicleType": req.vehicle_type,
        "transDistance": str(req.distance_km),
        "transDocNo": req.transport_doc_number,
        "transDocDate": req.transport_doc_date,
        "itemList": items_out,
    }


def generate_invoice_id() -> str:
    return uuid.uuid4().hex[:12]


def hash_ip(ip: str) -> str:
    return hashlib.sha256(ip.encode()).hexdigest()[:16]
