"""Renders the social share images (1200x630 JPEG) into assets/img/og/.

Usage:  py scripts/make-og.py
Needs Google Chrome and Pillow (pip install pillow). Re-run after changing
the cards below or scripts/og/card.html, then rebuild the site.
"""

import subprocess
import sys
import tempfile
from pathlib import Path
from urllib.parse import urlencode

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / "scripts" / "og" / "card.html"
OUT = ROOT / "assets" / "img" / "og"
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

# file name (matches the page in src/pages) -> card text and photo
CARDS = {
    "index": dict(
        title="Wills, estates and estate planning, done properly.",
        sub="Local legal help for Wyndham families.",
        photo="signing-will.jpg",
    ),
    "wills-estate-planning": dict(
        title="Wills & estate planning",
        sub="Wills from $550 including GST and your first consultation.",
        photo="signing-document.jpg",
    ),
    "powers-of-attorney": dict(
        title="Powers of attorney",
        sub="Enduring and medical powers, fixed fee $385 including GST.",
        photo="holding-hands.jpg",
    ),
    "deceased-estates": dict(
        title="Deceased estates & probate",
        sub="Practical help for executors and families.",
        photo="white-flower.jpg",
    ),
    "fees": dict(
        title="Fixed fees, published up front",
        sub="Wills from $550. Powers of attorney $385. All fees include GST.",
        photo="grandfather-grandchild.jpg",
    ),
    "about": dict(
        title="A local practice for Wyndham families",
        sub="Principal Solicitor Theresa Sgambaro.",
        photo="family-by-lake.jpg",
        pos="100% 50%",
    ),
    "contact": dict(
        title="Speak with a lawyer today",
        sub="Call or send an enquiry to book a consultation.",
        photo="holding-hands.jpg",
    ),
}


def render(name, card, tmp):
    png = Path(tmp) / f"{name}.png"
    url = TEMPLATE.as_uri() + "?" + urlencode(card)
    subprocess.run(
        [
            CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
            "--allow-file-access-from-files", "--force-device-scale-factor=1",
            "--window-size=1200,630", "--virtual-time-budget=8000",
            f"--screenshot={png}", url,
        ],
        check=True, capture_output=True,
    )
    img = Image.open(png).convert("RGB").crop((0, 0, 1200, 630))
    dest = OUT / f"{name}.jpg"
    img.save(dest, "JPEG", quality=84, optimize=True, progressive=True)
    print(f"{dest.relative_to(ROOT)}  {dest.stat().st_size // 1024} KB")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    only = set(sys.argv[1:])
    with tempfile.TemporaryDirectory() as tmp:
        for name, card in CARDS.items():
            if not only or name in only:
                render(name, card, tmp)


if __name__ == "__main__":
    main()
