from pydantic import BaseModel, Field


class Address(BaseModel):
    legal_name: str = Field(..., min_length=1)
    gstin: str = Field(..., pattern=r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$")
    address: str = ""
    city: str = ""
    state: str = ""
    pincode: str = ""
    phone: str = ""
    email: str = ""


class InvoiceItem(BaseModel):
    description: str
    hsn_code: str
    quantity: float = 1.0
    unit: str = "NOS"
    unit_price: float
    discount: float = 0.0
    gst_rate: float = 18.0


class InvoiceRequest(BaseModel):
    invoice_number: str
    invoice_date: str
    supply_type: str = "B2B"
    reverse_charge: str = "N"
    seller: Address
    buyer: Address
    items: list[InvoiceItem]
    is_igst: bool = False
    notes: str = ""


class EWayBillRequest(BaseModel):
    invoice_number: str
    invoice_date: str
    seller: Address
    buyer: Address
    items: list[InvoiceItem]
    is_igst: bool = False
    transporter_id: str = ""
    transporter_name: str = ""
    transport_mode: str = "1"
    vehicle_number: str = ""
    vehicle_type: str = "R"
    distance_km: int = 0
    transport_doc_number: str = ""
    transport_doc_date: str = ""


class BulkInvoiceRow(BaseModel):
    invoice_number: str
    invoice_date: str
    seller_gstin: str
    seller_name: str
    buyer_gstin: str
    buyer_name: str
    item_description: str
    hsn_code: str
    quantity: float
    unit_price: float
    gst_rate: float
    is_igst: bool = False
