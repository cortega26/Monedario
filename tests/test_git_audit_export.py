"""Tests para scripts/repo/git_audit_export.py — funciones puras del exportador de auditoría git."""

import pytest
from repo.git_audit_export import filter_hint, md_code_block, section, validate_git_args


class TestValidateGitArgs:
    """Pruebas para validate_git_args — sanitización de argumentos de git."""

    def test_passthrough_valid_args(self):
        """Argumentos normales deben pasarse sin modificación."""
        result = validate_git_args(["log", "--oneline", "-n", "5"])
        assert result == ["log", "--oneline", "-n", "5"]

    def test_empty_list(self):
        """Lista vacía debe devolver lista vacía."""
        assert validate_git_args([]) == []

    def test_rejects_null_byte(self):
        """Bytes nulos en argumentos deben rechazarse."""
        with pytest.raises(RuntimeError, match="control characters"):
            validate_git_args(["-- harmless", "arg\x00evil"])

    def test_rejects_newline(self):
        """Saltos de línea en argumentos deben rechazarse (previene inyección)."""
        with pytest.raises(RuntimeError, match="control characters"):
            validate_git_args(["safe", "arg\n--not-ok"])

    def test_rejects_carriage_return(self):
        """Retornos de carro en argumentos deben rechazarse."""
        with pytest.raises(RuntimeError, match="control characters"):
            validate_git_args(["safe", "arg\rbad"])

    def test_rejects_non_string_args(self):
        """Argumentos que no son strings deben rechazarse."""
        with pytest.raises(RuntimeError, match="must be strings"):
            validate_git_args(["ok", 123])  # type: ignore[arg-type]


class TestMdCodeBlock:
    """Pruebas para md_code_block — formatea bloques de código Markdown."""

    def test_default_no_lang(self):
        """Sin lenguaje especificado, debe usar fences vacíos."""
        result = md_code_block("hello")
        assert result == "```\nhello\n```\n"

    def test_with_language(self):
        """Con lenguaje, debe incluir el identificador después de los fences."""
        result = md_code_block("const x = 1;", lang="typescript")
        assert result == "```typescript\nconst x = 1;\n```\n"

    def test_strips_trailing_whitespace(self):
        """Debe limpiar espacios al final del contenido."""
        result = md_code_block("line1  \nline2  ")
        assert result == "```\nline1  \nline2\n```\n"

    def test_multiline_content(self):
        """Contenido multilínea debe preservar saltos de línea."""
        result = md_code_block("a\nb\nc")
        assert result == "```\na\nb\nc\n```\n"


class TestSection:
    """Pruebas para section — genera headers Markdown."""

    def test_default_h2(self):
        """Por defecto debe generar ## (h2)."""
        result = section("Resumen")
        assert result == "\n## Resumen\n\n"

    def test_custom_level(self):
        """Debe respetar el nivel especificado."""
        result = section("Título", level=3)
        assert result == "\n### Título\n\n"

    def test_h1(self):
        """Nivel 1 debe generar un solo #."""
        result = section("Principal", level=1)
        assert result == "\n# Principal\n\n"

    def test_empty_title(self):
        """Título vacío debe funcionar (aunque no es deseable)."""
        result = section("", level=2)
        assert result == "\n## \n\n"


class TestFilterHint:
    """Pruebas para filter_hint — une rutas con espacio para display."""

    def test_single_path(self):
        assert filter_hint(["src/pages"]) == "src/pages"

    def test_multiple_paths(self):
        assert filter_hint(["src", "public", "astro.config.*"]) == "src public astro.config.*"

    def test_empty_list(self):
        assert filter_hint([]) == ""
