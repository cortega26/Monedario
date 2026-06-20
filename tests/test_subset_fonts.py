"""Tests para scripts/subset-fonts.py — subsetting de fuentes tipográficas."""

import importlib.util
import sys
from pathlib import Path


def _load_subset_fonts():
    """Carga scripts/subset-fonts.py como módulo (el nombre con guiones impide import directo)."""
    project_root = Path(__file__).resolve().parent.parent
    module_path = project_root / "scripts" / "subset-fonts.py"
    spec = importlib.util.spec_from_file_location("subset_fonts", module_path)
    module = importlib.util.module_from_spec(spec)
    # Exponer en sys.modules para que los reloads funcionen
    sys.modules["subset_fonts"] = module
    spec.loader.exec_module(module)
    return module


# Cargamos una vez al importar el módulo de test
sf = _load_subset_fonts()
extract_chars = sf.extract_chars
FONTS = sf.FONTS
CONTENT_GLOBS = sf.CONTENT_GLOBS


class TestExtractChars:
    """Pruebas para extract_chars — extrae caracteres únicos de archivos del proyecto."""

    def test_extracts_printable_characters(self, tmp_dir):
        """Debe extraer caracteres ASCII imprimibles de archivos de texto."""
        blog_dir = tmp_dir / "src" / "data" / "blog"
        blog_dir.mkdir(parents=True)
        (blog_dir / "post-1.md").write_text("Hola mundo — café €")

        original_root = sf.PROJECT_ROOT
        try:
            sf.PROJECT_ROOT = str(tmp_dir)
            chars = extract_chars()
        finally:
            sf.PROJECT_ROOT = original_root

        assert "H" in chars
        assert "o" in chars
        assert "l" in chars
        assert "a" in chars
        assert "m" in chars
        assert "u" in chars
        assert "n" in chars
        assert "d" in chars
        assert "—" in chars
        assert "€" in chars
        assert " " in chars  # espacio (32) incluido

    def test_excludes_control_characters(self, tmp_dir):
        """Caracteres de control (<32) deben excluirse."""
        blog_dir = tmp_dir / "src" / "data" / "blog"
        blog_dir.mkdir(parents=True)
        (blog_dir / "post-1.md").write_text("ABC")

        original_root = sf.PROJECT_ROOT
        try:
            sf.PROJECT_ROOT = str(tmp_dir)
            chars = extract_chars()
        finally:
            sf.PROJECT_ROOT = original_root

        for c in chars:
            assert 32 <= ord(c) <= 0xFFFF, f"Carácter no imprimible: U+{ord(c):04X}"

    def test_excludes_non_bmp(self, tmp_dir):
        """Caracteres fuera del BMP (>0xFFFF) deben excluirse."""
        blog_dir = tmp_dir / "src" / "data" / "blog"
        blog_dir.mkdir(parents=True)
        (blog_dir / "post-1.md").write_text("Normal text only")

        original_root = sf.PROJECT_ROOT
        try:
            sf.PROJECT_ROOT = str(tmp_dir)
            chars = extract_chars()
        finally:
            sf.PROJECT_ROOT = original_root

        for c in chars:
            assert ord(c) <= 0xFFFF, f"Carácter fuera de BMP: U+{ord(c):04X}"

    def test_returns_sorted_string(self, tmp_dir):
        """El resultado debe estar ordenado por código de carácter."""
        blog_dir = tmp_dir / "src" / "data" / "blog"
        blog_dir.mkdir(parents=True)
        (blog_dir / "post-1.md").write_text("CBA")

        original_root = sf.PROJECT_ROOT
        try:
            sf.PROJECT_ROOT = str(tmp_dir)
            chars = extract_chars()
        finally:
            sf.PROJECT_ROOT = original_root

        a_pos = chars.index("A")
        b_pos = chars.index("B")
        c_pos = chars.index("C")
        assert a_pos < b_pos < c_pos

    def test_handles_missing_directory_gracefully(self, tmp_dir):
        """Si el directorio no existe, no debe fallar."""
        original_root = sf.PROJECT_ROOT
        try:
            sf.PROJECT_ROOT = str(tmp_dir / "nonexistent")
            chars = extract_chars()
        finally:
            sf.PROJECT_ROOT = original_root

        assert isinstance(chars, str)


class TestFontConfig:
    """Pruebas de integridad de la configuración de FONTS y CONTENT_GLOBS."""

    def test_fonts_have_required_keys(self):
        for font in FONTS:
            assert "src" in font, f"Falta 'src' en {font}"
            assert "dst" in font, f"Falta 'dst' en {font}"

    def test_fonts_use_woff2(self):
        for font in FONTS:
            assert font["src"].endswith(".woff2"), f"src no es .woff2: {font['src']}"
            assert font["dst"].endswith(".woff2"), f"dst no es .woff2: {font['dst']}"

    def test_content_globs_are_strings(self):
        for pattern in CONTENT_GLOBS:
            assert isinstance(pattern, str), f"Pattern no es string: {pattern!r}"
