"""Configurare pentru scraper-ul Imobiliare.ro"""

BASE_URL = "https://www.imobiliare.ro"

# Tipuri de proprietăți și URL-urile corespunzătoare
PROPERTY_TYPES = {
    "apartamente-vanzare": "/vanzare-apartamente",
    "apartamente-inchiriere": "/inchirieri-apartamente",
    "case-vanzare": "/vanzare-case-vile",
    "case-inchiriere": "/inchirieri-case-vile",
    "terenuri-vanzare": "/vanzare-terenuri",
    "garsoniere-vanzare": "/vanzare-garsoniere",
    "garsoniere-inchiriere": "/inchirieri-garsoniere",
}

# Orașe principale disponibile
CITIES = [
    "bucuresti",
    "cluj-napoca",
    "timisoara",
    "iasi",
    "constanta",
    "brasov",
    "sibiu",
    "oradea",
    "craiova",
    "galati",
    "ploiesti",
    "arad",
    "pitesti",
    "targu-mures",
    "baia-mare",
    "buzau",
    "satu-mare",
    "botosani",
    "suceava",
    "alba-iulia",
]

# Headers HTTP pentru a simula un browser real
REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ro-RO,ro;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Cache-Control": "max-age=0",
}

# Delay între request-uri (secunde) pentru a evita blocarea
REQUEST_DELAY_MIN = 2.0
REQUEST_DELAY_MAX = 5.0

# Număr maxim de reîncercări per request
MAX_RETRIES = 3

# Timeout pentru request-uri (secunde)
REQUEST_TIMEOUT = 30

# Directorul implicit pentru output
OUTPUT_DIR = "output"
