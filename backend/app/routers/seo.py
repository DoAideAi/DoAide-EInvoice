from fastapi import APIRouter
from fastapi.responses import PlainTextResponse, Response

from app.config import settings

router = APIRouter()

ROUTES = [
    "/",
    "/eway",
    "/hsn",
    "/bulk",
    "/pricing",
]


@router.get("/robots.txt", response_class=PlainTextResponse)
def robots():
    return f"User-agent: *\nAllow: /\nSitemap: {settings.site_url}/sitemap.xml"


@router.get("/sitemap.xml")
def sitemap():
    urls = "\n".join(
        f"  <url><loc>{settings.site_url}{r}</loc><changefreq>weekly</changefreq></url>"
        for r in ROUTES
    )
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{urls}
</urlset>"""
    return Response(content=xml, media_type="application/xml")
