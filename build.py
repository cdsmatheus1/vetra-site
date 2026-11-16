#!/usr/bin/env python3
"""Inlines the shared SVG icon sprite into each page. Run: python3 build.py"""
from pathlib import Path
root = Path(__file__).parent
sprite = (root / "src/sprite.svg").read_text()
for name in ("index", "quote"):
    html = (root / f"src/{name}.src.html").read_text().replace("{{SPRITE}}", sprite)
    (root / f"{name}.html").write_text(html)
    print("built", name + ".html")
