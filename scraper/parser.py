"""Parser pentru extragerea datelor din paginile Imobiliare.ro"""

import re
from bs4 import BeautifulSoup


def parse_listing_page(html: str) -> list[dict]:
    """Parsează o pagină de rezultate și returnează o listă de anunțuri."""
    soup = BeautifulSoup(html, "lxml")
    listings = []

    # Imobiliare.ro folosește mai multe structuri posibile pentru cardurile de anunțuri.
    # Încercăm mai multe selectoare pentru a fi rezistenți la schimbări.
    cards = _find_listing_cards(soup)

    for card in cards:
        listing = _extract_listing_data(card)
        if listing and listing.get("titlu"):
            listings.append(listing)

    return listings


def parse_total_pages(html: str) -> int:
    """Extrage numărul total de pagini din paginație."""
    soup = BeautifulSoup(html, "lxml")

    # Caută butoanele de paginație
    pagination = soup.find("ul", class_="pagination")
    if not pagination:
        # Încearcă alte selectoare posibile
        pagination = soup.find("div", class_="pagination")
        if not pagination:
            pagination = soup.find("nav", class_="pagination")

    if not pagination:
        return 1

    # Caută ultimul număr de pagină
    page_links = pagination.find_all("a")
    max_page = 1

    for link in page_links:
        text = link.get_text(strip=True)
        if text.isdigit():
            max_page = max(max_page, int(text))

        # Verifică și href-ul pentru pagina maximă
        href = link.get("href", "")
        match = re.search(r"pagina=(\d+)", href)
        if match:
            max_page = max(max_page, int(match.group(1)))

    return max_page


def _find_listing_cards(soup: BeautifulSoup) -> list:
    """Găsește toate cardurile de anunțuri pe pagină."""
    # Lista de selectoare CSS posibile, în ordinea probabilității
    selectors = [
        {"tag": "div", "class_": "box-anunt"},
        {"tag": "div", "class_": "oferta"},
        {"tag": "article", "class_": "oferta"},
        {"tag": "div", "class_": "listing-card"},
        {"tag": "div", "class_": "property-card"},
        {"tag": "li", "class_": "box-anunt"},
    ]

    for selector in selectors:
        cards = soup.find_all(selector["tag"], class_=selector["class_"])
        if cards:
            return cards

    # Fallback: caută orice container cu link spre detalii anunț
    containers = soup.find_all("div", attrs={"data-id": True})
    if containers:
        return containers

    # Alt fallback: caută containere cu prețuri
    price_elements = soup.find_all("span", class_="pret-mare")
    if price_elements:
        return [el.find_parent("div", class_=True) for el in price_elements if el.find_parent("div", class_=True)]

    return []


def _extract_listing_data(card) -> dict:
    """Extrage datele dintr-un card de anunț."""
    if card is None:
        return {}

    data = {
        "titlu": _extract_title(card),
        "pret": _extract_price(card),
        "moneda": _extract_currency(card),
        "suprafata_utila_mp": _extract_area(card, "utila"),
        "suprafata_totala_mp": _extract_area(card, "totala"),
        "nr_camere": _extract_rooms(card),
        "etaj": _extract_floor(card),
        "localitate": _extract_location(card),
        "zona": _extract_zone(card),
        "an_constructie": _extract_year(card),
        "tip_imobil": _extract_building_type(card),
        "url": _extract_url(card),
    }

    # Extrage și din lista de caracteristici
    characteristics = _extract_characteristics(card)
    for key, value in characteristics.items():
        if key in data and not data[key]:
            data[key] = value

    return data


def _extract_title(card) -> str:
    """Extrage titlul anunțului."""
    # Caută în link-uri cu titlu
    for tag in ["h2", "h3", "h4"]:
        el = card.find(tag)
        if el:
            link = el.find("a")
            if link:
                return link.get_text(strip=True)
            return el.get_text(strip=True)

    # Caută link cu clasa specifică
    link = card.find("a", class_="mobile-container-url")
    if link:
        title = link.get("title", "") or link.get_text(strip=True)
        if title:
            return title

    link = card.find("a", class_="titlu-anunt")
    if link:
        return link.get_text(strip=True)

    return ""


def _extract_price(card) -> str:
    """Extrage prețul."""
    # span.pret-mare este selectorul confirmat
    price_el = card.find("span", class_="pret-mare")
    if price_el:
        price_text = price_el.get_text(strip=True)
        return _clean_price(price_text)

    # Alte selectoare posibile
    for cls in ["pret", "price", "oferta-pret"]:
        price_el = card.find(class_=cls)
        if price_el:
            price_text = price_el.get_text(strip=True)
            return _clean_price(price_text)

    return ""


def _clean_price(text: str) -> str:
    """Curăță și normalizează un preț."""
    # Elimină caractere non-numerice cu excepția punctului și virgulei
    cleaned = re.sub(r"[^\d.,]", "", text)
    # Elimină separatorii de mii (punct în format RO)
    cleaned = cleaned.replace(".", "").replace(",", "")
    return cleaned


def _extract_currency(card) -> str:
    """Extrage moneda (EUR/RON)."""
    price_container = card.find("span", class_="pret-mare")
    if not price_container:
        price_container = card.find(class_="pret")

    if price_container:
        parent = price_container.parent if price_container else card
    else:
        parent = card

    text = parent.get_text() if parent else ""
    text_upper = text.upper()
    if "EUR" in text_upper or "€" in text:
        return "EUR"
    if "RON" in text_upper or "LEI" in text_upper:
        return "RON"
    if "USD" in text_upper or "$" in text:
        return "USD"
    return "EUR"  # Default pe imobiliare.ro


def _extract_area(card, area_type: str) -> str:
    """Extrage suprafața (utilă sau totală)."""
    text = card.get_text()

    if area_type == "utila":
        patterns = [
            r"(\d+[\.,]?\d*)\s*mp?\s*util",
            r"Suprafață utilă[:\s]*(\d+[\.,]?\d*)",
            r"(\d+[\.,]?\d*)\s*m²?\s*util",
            r"SU[:\s]*(\d+[\.,]?\d*)",
        ]
    else:
        patterns = [
            r"(\d+[\.,]?\d*)\s*mp?\s*total",
            r"Suprafață totală[:\s]*(\d+[\.,]?\d*)",
            r"(\d+[\.,]?\d*)\s*m²?\s*total",
            r"ST[:\s]*(\d+[\.,]?\d*)",
        ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).replace(",", ".")

    # Fallback: caută în lista de caracteristici
    chars = card.find("ul", class_="caracteristici")
    if chars:
        for li in chars.find_all("li"):
            li_text = li.get_text()
            for pattern in patterns:
                match = re.search(pattern, li_text, re.IGNORECASE)
                if match:
                    return match.group(1).replace(",", ".")

    return ""


def _extract_rooms(card) -> str:
    """Extrage numărul de camere."""
    text = card.get_text()

    patterns = [
        r"(\d+)\s*camer[eăa]",
        r"(\d+)\s*cam\b",
        r"nr\.?\s*camere[:\s]*(\d+)",
        r"garsonier[aă]",
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            if "garsonier" in pattern:
                return "1"
            # Unele pattern-uri au grupul în poziții diferite
            groups = match.groups()
            for g in groups:
                if g and g.isdigit():
                    return g

    # Verifică dacă o cameră este menționată ca "o cameră"
    if re.search(r"\bo\s+camer[aă]", text, re.IGNORECASE):
        return "1"

    return ""


def _extract_floor(card) -> str:
    """Extrage etajul."""
    text = card.get_text()

    patterns = [
        r"[Ee]taj[:\s]*(\d+)",
        r"[Ee]t\.?\s*(\d+)",
        r"[Pp]arter",
        r"[Dd]emisol",
        r"[Mm]ansard[aă]",
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            if "arter" in pattern:
                return "0"
            if "emisol" in pattern:
                return "-1"
            if "ansard" in pattern:
                return "M"
            groups = match.groups()
            for g in groups:
                if g:
                    return g

    return ""


def _extract_location(card) -> str:
    """Extrage localitatea."""
    # Caută în elemente specifice de locație
    for cls in ["localizare", "location", "zona-locatie", "locatie"]:
        el = card.find(class_=cls)
        if el:
            return el.get_text(strip=True)

    return ""


def _extract_zone(card) -> str:
    """Extrage zona/cartierul."""
    for cls in ["zona", "cartier", "neighborhood"]:
        el = card.find(class_=cls)
        if el:
            return el.get_text(strip=True)

    return ""


def _extract_year(card) -> str:
    """Extrage anul construcției."""
    text = card.get_text()
    match = re.search(r"[Aa]n\s*construc[tț]ie[:\s]*(\d{4})", text)
    if match:
        return match.group(1)

    match = re.search(r"[Cc]onstruit\s*[îi]n\s*(\d{4})", text)
    if match:
        return match.group(1)

    return ""


def _extract_building_type(card) -> str:
    """Extrage tipul imobilului."""
    text = card.get_text().lower()

    if "decomandat" in text:
        return "decomandat"
    if "semidecomandat" in text:
        return "semidecomandat"
    if "nedecomandat" in text or "circular" in text:
        return "nedecomandat"

    return ""


def _extract_url(card) -> str:
    """Extrage URL-ul anunțului."""
    link = card.find("a", href=True)
    if link:
        href = link["href"]
        if href.startswith("http"):
            return href
        if href.startswith("/"):
            return f"https://www.imobiliare.ro{href}"
    return ""


def _extract_characteristics(card) -> dict:
    """Extrage caracteristicile din lista ul.caracteristici."""
    data = {}
    chars_list = card.find("ul", class_="caracteristici")
    if not chars_list:
        return data

    for li in chars_list.find_all("li"):
        text = li.get_text(strip=True)

        # Suprafața
        match = re.search(r"(\d+[\.,]?\d*)\s*m[p²]", text)
        if match and "util" in text.lower():
            data["suprafata_utila_mp"] = match.group(1).replace(",", ".")
        elif match and "total" in text.lower():
            data["suprafata_totala_mp"] = match.group(1).replace(",", ".")

        # Camere
        match = re.search(r"(\d+)\s*camer", text, re.IGNORECASE)
        if match:
            data["nr_camere"] = match.group(1)

        # Etaj
        match = re.search(r"[Ee]taj[:\s]*(\d+)", text)
        if match:
            data["etaj"] = match.group(1)
        elif "parter" in text.lower():
            data["etaj"] = "0"

    return data
