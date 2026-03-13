"""Modulul principal de scraping pentru Imobiliare.ro"""

import logging
import random
import time

import requests

from . import config
from .parser import parse_listing_page, parse_total_pages

logger = logging.getLogger(__name__)


class ImobiliareScraper:
    """Scraper pentru site-ul Imobiliare.ro"""

    def __init__(self, delay_min=None, delay_max=None, max_retries=None):
        self.session = requests.Session()
        self.session.headers.update(config.REQUEST_HEADERS)
        self.delay_min = delay_min or config.REQUEST_DELAY_MIN
        self.delay_max = delay_max or config.REQUEST_DELAY_MAX
        self.max_retries = max_retries or config.MAX_RETRIES

    def scrape(
        self,
        property_type: str,
        city: str,
        max_pages: int | None = None,
    ) -> list[dict]:
        """
        Scrapează anunțuri de pe Imobiliare.ro.

        Args:
            property_type: Tipul proprietății (cheie din PROPERTY_TYPES).
            city: Orașul (slug, ex: "bucuresti", "cluj-napoca").
            max_pages: Număr maxim de pagini de scrapat (None = toate).

        Returns:
            Lista de dicționare cu datele anunțurilor.
        """
        if property_type not in config.PROPERTY_TYPES:
            available = ", ".join(config.PROPERTY_TYPES.keys())
            raise ValueError(
                f"Tip de proprietate invalid: '{property_type}'. "
                f"Opțiuni disponibile: {available}"
            )

        base_path = config.PROPERTY_TYPES[property_type]
        base_url = f"{config.BASE_URL}{base_path}/{city}"

        logger.info("Încep scraping: %s/%s", property_type, city)
        logger.info("URL de bază: %s", base_url)

        # Prima pagină - determinăm și numărul total de pagini
        first_page_html = self._fetch_page(base_url)
        if not first_page_html:
            logger.error("Nu am putut accesa prima pagină: %s", base_url)
            return []

        total_pages = parse_total_pages(first_page_html)
        if max_pages:
            total_pages = min(total_pages, max_pages)

        logger.info("Pagini de procesat: %d", total_pages)

        all_listings = parse_listing_page(first_page_html)
        logger.info("Pagina 1/%d: %d anunțuri găsite", total_pages, len(all_listings))

        # Restul paginilor
        for page_num in range(2, total_pages + 1):
            page_url = f"{base_url}?pagina={page_num}"
            html = self._fetch_page(page_url)

            if not html:
                logger.warning("Nu am putut accesa pagina %d", page_num)
                continue

            listings = parse_listing_page(html)
            all_listings.extend(listings)
            logger.info(
                "Pagina %d/%d: %d anunțuri găsite (total: %d)",
                page_num,
                total_pages,
                len(listings),
                len(all_listings),
            )

            # Delay între request-uri
            self._delay()

        logger.info(
            "Scraping complet: %d anunțuri totale pentru %s/%s",
            len(all_listings),
            property_type,
            city,
        )

        # Adaugă metadata
        for listing in all_listings:
            listing["tip_proprietate"] = property_type
            listing["oras"] = city

        return all_listings

    def _fetch_page(self, url: str) -> str | None:
        """Descarcă o pagină cu retry logic."""
        for attempt in range(1, self.max_retries + 1):
            try:
                response = self.session.get(url, timeout=config.REQUEST_TIMEOUT)
                response.raise_for_status()
                return response.text
            except requests.RequestException as e:
                logger.warning(
                    "Eroare la request (încercarea %d/%d): %s - %s",
                    attempt,
                    self.max_retries,
                    url,
                    e,
                )
                if attempt < self.max_retries:
                    wait_time = 2 ** attempt
                    logger.info("Aștept %ds înainte de reîncercare...", wait_time)
                    time.sleep(wait_time)

        return None

    def _delay(self):
        """Adaugă un delay aleator între request-uri."""
        delay = random.uniform(self.delay_min, self.delay_max)
        time.sleep(delay)

    def close(self):
        """Închide sesiunea HTTP."""
        self.session.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()
