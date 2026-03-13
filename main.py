#!/usr/bin/env python3
"""
Imobiliare.ro Scraper - Tool de scraping pentru date imobiliare din România.

Utilizare:
    python main.py --tip apartamente-vanzare --oras bucuresti
    python main.py --tip case-vanzare --oras cluj-napoca --pagini 5
    python main.py --tip apartamente-inchiriere --oras timisoara --output rezultate
    python main.py --list-tipuri
    python main.py --list-orase
"""

import argparse
import logging
import sys

from scraper.config import CITIES, PROPERTY_TYPES
from scraper.exporter import export_csv
from scraper.scraper import ImobiliareScraper


def setup_logging(verbose: bool = False):
    """Configurează logging-ul."""
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(levelname)s] %(message)s",
        datefmt="%H:%M:%S",
    )


def parse_args():
    """Parsează argumentele din linia de comandă."""
    parser = argparse.ArgumentParser(
        description="Scraper pentru anunțuri imobiliare de pe Imobiliare.ro",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemple de utilizare:
  python main.py --tip apartamente-vanzare --oras bucuresti
  python main.py --tip case-vanzare --oras cluj-napoca --pagini 5
  python main.py --tip apartamente-inchiriere --oras timisoara -o rezultate
  python main.py --list-tipuri
  python main.py --list-orase

Tipuri de proprietăți disponibile:
  apartamente-vanzare      Apartamente de vânzare
  apartamente-inchiriere   Apartamente de închiriat
  case-vanzare             Case și vile de vânzare
  case-inchiriere          Case și vile de închiriat
  terenuri-vanzare         Terenuri de vânzare
  garsoniere-vanzare       Garsoniere de vânzare
  garsoniere-inchiriere    Garsoniere de închiriat
        """,
    )

    parser.add_argument(
        "--tip",
        "-t",
        choices=list(PROPERTY_TYPES.keys()),
        help="Tipul de proprietate de scrapat",
    )
    parser.add_argument(
        "--oras",
        "-c",
        help="Orașul (ex: bucuresti, cluj-napoca, timisoara)",
    )
    parser.add_argument(
        "--pagini",
        "-p",
        type=int,
        default=None,
        help="Număr maxim de pagini de scrapat (implicit: toate)",
    )
    parser.add_argument(
        "--output",
        "-o",
        default=None,
        help="Numele fișierului CSV de output (fără extensie)",
    )
    parser.add_argument(
        "--output-dir",
        default=None,
        help="Directorul de output (implicit: output/)",
    )
    parser.add_argument(
        "--delay-min",
        type=float,
        default=None,
        help="Delay minim între request-uri în secunde (implicit: 2.0)",
    )
    parser.add_argument(
        "--delay-max",
        type=float,
        default=None,
        help="Delay maxim între request-uri în secunde (implicit: 5.0)",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Afișează informații detaliate (debug)",
    )
    parser.add_argument(
        "--list-tipuri",
        action="store_true",
        help="Afișează tipurile de proprietăți disponibile",
    )
    parser.add_argument(
        "--list-orase",
        action="store_true",
        help="Afișează orașele disponibile",
    )

    return parser.parse_args()


def main():
    args = parse_args()
    setup_logging(args.verbose)

    if args.list_tipuri:
        print("Tipuri de proprietăți disponibile:")
        for key in PROPERTY_TYPES:
            print(f"  - {key}")
        return

    if args.list_orase:
        print("Orașe disponibile:")
        for city in CITIES:
            print(f"  - {city}")
        print("\nPoți folosi și alte orașe/localități sub forma slug-ului din URL.")
        return

    if not args.tip or not args.oras:
        print("Eroare: --tip și --oras sunt obligatorii.")
        print("Folosește --help pentru mai multe informații.")
        sys.exit(1)

    logger = logging.getLogger(__name__)

    with ImobiliareScraper(
        delay_min=args.delay_min,
        delay_max=args.delay_max,
    ) as scraper:
        listings = scraper.scrape(
            property_type=args.tip,
            city=args.oras,
            max_pages=args.pagini,
        )

    if not listings:
        logger.warning("Nu au fost găsite anunțuri.")
        return

    filepath = export_csv(
        listings,
        filename=args.output,
        output_dir=args.output_dir,
    )

    print(f"\n{'=' * 50}")
    print(f"Scraping finalizat!")
    print(f"Anunțuri găsite: {len(listings)}")
    print(f"Fișier CSV salvat: {filepath}")
    print(f"{'=' * 50}")


if __name__ == "__main__":
    main()
