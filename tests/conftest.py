"""Fixtures compartidos para todos los tests del proyecto."""

import tempfile
from pathlib import Path

import pytest


@pytest.fixture
def tmp_dir():
    """Directorio temporal que se limpia automáticamente al finalizar el test."""
    with tempfile.TemporaryDirectory() as d:
        yield Path(d)


@pytest.fixture
def project_root():
    """Ruta absoluta a la raíz del proyecto Monedario."""
    return Path(__file__).resolve().parent.parent


@pytest.fixture
def fake_repo(tmp_dir):
    """Estructura mínima de directorios que simula un proyecto."""
    (tmp_dir / "src").mkdir()
    (tmp_dir / "src" / "pages").mkdir()
    (tmp_dir / "src" / "components").mkdir()
    (tmp_dir / "public").mkdir()
    (tmp_dir / "README.md").write_text("# Test Repo")
    (tmp_dir / "src" / "pages" / "index.astro").write_text("---\n---")
    return tmp_dir
