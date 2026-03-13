# VremBaniiDeLaHaufe - Imobiliare.ro Scraper

Tool de scraping pentru extragerea datelor de pe [Imobiliare.ro](https://www.imobiliare.ro) - cel mai popular portal de imobiliare din România.

## Funcționalități

- Scraping apartamente, case, garsoniere, terenuri (vânzare și închiriere)
- Suport pentru toate orașele din România
- Export date în format CSV (compatibil Excel)
- Rate limiting configurabil pentru a evita blocarea
- Retry automat la erori de rețea
- Interfață CLI intuitivă

## Date extrase

Pentru fiecare anunț se extrag:
- Titlu, preț, moneda (EUR/RON)
- Număr camere, suprafață utilă/totală
- Etaj, tip imobil, an construcție
- Localitate, zonă, URL anunț

## Instalare

```bash
# Clonează repository-ul
git clone https://github.com/DariusCotrau/VremBaniiDeLaHaufe.git
cd VremBaniiDeLaHaufe

# Instalează dependențele
pip install -r requirements.txt
```

## Utilizare

### Exemple de bază

```bash
# Apartamente de vânzare în București
python main.py --tip apartamente-vanzare --oras bucuresti

# Case de vânzare în Cluj-Napoca (primele 5 pagini)
python main.py --tip case-vanzare --oras cluj-napoca --pagini 5

# Apartamente de închiriat în Timișoara, salvate cu un nume specific
python main.py --tip apartamente-inchiriere --oras timisoara --output chirii_timisoara

# Garsoniere de vânzare în Brașov, cu logging detaliat
python main.py --tip garsoniere-vanzare --oras brasov --verbose
```

### Opțiuni disponibile

```
--tip, -t          Tipul de proprietate (obligatoriu)
--oras, -c         Orașul - slug din URL (obligatoriu)
--pagini, -p       Nr. maxim de pagini de scrapat (implicit: toate)
--output, -o       Numele fișierului CSV (fără extensie)
--output-dir       Directorul de output (implicit: output/)
--delay-min        Delay minim între request-uri, secunde (implicit: 2.0)
--delay-max        Delay maxim între request-uri, secunde (implicit: 5.0)
--verbose, -v      Afișează informații detaliate
--list-tipuri      Afișează tipurile de proprietăți disponibile
--list-orase       Afișează orașele predefinite
```

### Tipuri de proprietăți

| Tip | Descriere |
|-----|-----------|
| `apartamente-vanzare` | Apartamente de vânzare |
| `apartamente-inchiriere` | Apartamente de închiriat |
| `case-vanzare` | Case și vile de vânzare |
| `case-inchiriere` | Case și vile de închiriat |
| `terenuri-vanzare` | Terenuri de vânzare |
| `garsoniere-vanzare` | Garsoniere de vânzare |
| `garsoniere-inchiriere` | Garsoniere de închiriat |

## Structura proiectului

```
VremBaniiDeLaHaufe/
├── main.py                 # Punct de intrare CLI
├── requirements.txt        # Dependențe Python
├── output/                 # Fișiere CSV generate
└── scraper/
    ├── __init__.py
    ├── config.py           # Configurări (URL-uri, headers, delay)
    ├── scraper.py          # Logica principală de scraping
    ├── parser.py           # Parsare HTML și extragere date
    └── exporter.py         # Export CSV
```

## Notă importantă

Acest tool este destinat exclusiv pentru uz personal și educațional. Respectă termenii de utilizare ai site-ului Imobiliare.ro și folosește delay-uri adecvate între request-uri.
