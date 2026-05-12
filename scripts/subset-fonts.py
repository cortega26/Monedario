#!/usr/bin/env python3
"""Subset fonts to Spanish-only characters used in the project.

Reduces font file size by removing unused glyphs (other Latin languages,
obsolete characters, etc.). Run when content changes significantly or
fonts are updated.

Requires: pip install fonttools brotli

Usage: python3 scripts/subset-fonts.py
"""

import glob
import os
import subprocess
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

FONTS = [
    {
        "src": "public/fonts/source-sans-3-latin-400-600.7a19a702.woff2",
        "dst": "public/fonts/source-sans-3-latin-es-400-600.woff2",
    },
    {
        "src": "public/fonts/fraunces-latin-400-700.7234ed86.woff2",
        "dst": "public/fonts/fraunces-latin-es-400-700.woff2",
    },
]

CONTENT_GLOBS = [
    "src/data/blog/*.md",
    "src/data/blog/*.mdx",
    "src/data/glossary/*.md",
    "src/data/laws/*.md",
    "src/components/*.astro",
    "src/layouts/*.astro",
    "src/pages/**/*.astro",
    "src/styles/*.css",
]


def extract_chars():
    """Extract all unique printable characters used in the project."""
    chars: set[str] = set()
    for pattern in CONTENT_GLOBS:
        for path in glob.glob(os.path.join(PROJECT_ROOT, pattern), recursive=True):
            try:
                with open(path, "r", errors="ignore") as f:
                    chars.update(f.read())
            except Exception as e:
                print(f"  Warning: skipping {path}: {e}")

    # Filter to printable BMP characters
    result = "".join(
        sorted(c for c in chars if 32 <= ord(c) <= 0xFFFF)
    )
    return result


def subset_font(characters: str):
    """Run pyftsubset on each font."""
    chars_file = "/tmp/subset-chars.txt"
    with open(chars_file, "w") as f:
        f.write(characters)

    for font in FONTS:
        src = os.path.join(PROJECT_ROOT, font["src"])
        dst = os.path.join(PROJECT_ROOT, font["dst"])

        if not os.path.exists(src):
            print(f"  Skip: {font['src']} not found")
            continue

        result = subprocess.run(
            [
                "pyftsubset",
                src,
                f"--text-file={chars_file}",
                f"--output-file={dst}",
                "--flavor=woff2",
            ],
            capture_output=True,
            text=True,
        )

        if result.returncode == 0:
            src_size = os.path.getsize(src)
            dst_size = os.path.getsize(dst)
            pct = (1 - dst_size / src_size) * 100
            print(
                f"  {font['dst']}: "
                f"{src_size // 1024} KB -> {dst_size // 1024} KB "
                f"({pct:.0f}% reduction)"
            )
        else:
            print(f"  Error processing {font['src']}: {result.stderr}")
            sys.exit(1)

    os.remove(chars_file)


def main():
    print("Extracting characters from content...")
    chars = extract_chars()
    print(f"  Found {len(chars)} unique characters")

    print("Subsetting fonts...")
    subset_font(chars)

    total_original = sum(
        os.path.getsize(os.path.join(PROJECT_ROOT, f["src"]))
        for f in FONTS
        if os.path.exists(os.path.join(PROJECT_ROOT, f["src"]))
    )
    total_subset = sum(
        os.path.getsize(os.path.join(PROJECT_ROOT, f["dst"]))
        for f in FONTS
        if os.path.exists(os.path.join(PROJECT_ROOT, f["dst"]))
    )
    total_pct = (1 - total_subset / total_original) * 100
    print(
        f"\nTotal: {total_original // 1024} KB -> {total_subset // 1024} KB "
        f"({total_pct:.0f}% reduction)"
    )
    print("Done. Update @font-face src and preload href to point to new files.")


if __name__ == "__main__":
    main()
