"""Modul de export al datelor scrapeate în format CSV."""

import csv
import os
from datetime import datetime

from . import config

# Câmpurile CSV în ordinea dorită
CSV_FIELDS = [
    "titlu",
    "pret",
    "moneda",
    "nr_camere",
    "suprafata_utila_mp",
    "suprafata_totala_mp",
    "etaj",
    "tip_imobil",
    "an_constructie",
    "localitate",
    "zona",
    "oras",
    "tip_proprietate",
    "url",
]


def export_csv(
    listings: list[dict],
    filename: str | None = None,
    output_dir: str | None = None,
) -> str:
    """
    Exportă lista de anunțuri într-un fișier CSV.

    Args:
        listings: Lista de dicționare cu datele anunțurilor.
        filename: Numele fișierului (fără extensie). Auto-generat dacă None.
        output_dir: Directorul de output. Folosește config.OUTPUT_DIR dacă None.

    Returns:
        Calea completă a fișierului CSV creat.
    """
    output_dir = output_dir or config.OUTPUT_DIR
    os.makedirs(output_dir, exist_ok=True)

    if not filename:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"imobiliare_{timestamp}"

    filepath = os.path.join(output_dir, f"{filename}.csv")

    with open(filepath, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_FIELDS, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(listings)

    return filepath
