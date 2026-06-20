"""Tests para scripts/repo/project_structure.py — generación de árbol de directorios."""

from repo.project_structure import generate_ai_context, get_tree


class TestGetTree:
    """Pruebas para la función get_tree — genera representación de árbol ASCII."""

    def test_single_file(self, tmp_dir):
        """Un directorio con un solo archivo debe mostrarse con └──."""
        (tmp_dir / "README.md").write_text("hello")

        result = get_tree(tmp_dir)

        assert "README.md" in result
        assert "└── README.md" in result

    def test_multiple_items(self, tmp_dir):
        """Directorios y archivos deben aparecer ordenados: carpetas primero, luego archivos."""
        (tmp_dir / "docs").mkdir()
        (tmp_dir / "src").mkdir()
        (tmp_dir / "README.md").write_text("readme")
        (tmp_dir / "package.json").write_text("{}")

        result = get_tree(tmp_dir)

        # Las carpetas deben aparecer antes que los archivos
        docs_pos = result.index("docs/")
        src_pos = result.index("src/")
        readme_pos = result.index("README.md")
        pkg_pos = result.index("package.json")

        assert docs_pos < readme_pos
        assert src_pos < readme_pos
        assert docs_pos < pkg_pos
        assert src_pos < pkg_pos

    def test_nested_directories(self, tmp_dir):
        """Directorios anidados deben indentarse correctamente."""
        (tmp_dir / "src").mkdir()
        (tmp_dir / "src" / "components").mkdir()
        (tmp_dir / "src" / "components" / "Card.astro").write_text("card")

        result = get_tree(tmp_dir)

        assert "src/" in result
        assert "components/" in result
        assert "Card.astro" in result
        # Debe usar caracteres de árbol para la indentación
        assert "──" in result

    def test_ignores_hidden_files(self, tmp_dir):
        """Archivos y directorios que empiezan con . deben omitirse."""
        (tmp_dir / ".git").mkdir()
        (tmp_dir / ".env").write_text("secret")
        (tmp_dir / "visible.txt").write_text("visible")

        result = get_tree(tmp_dir)

        assert "visible.txt" in result
        assert ".git" not in result
        assert ".env" not in result

    def test_ignores_common_dirs(self, tmp_dir):
        """Directorios en IGNORE_LIST (node_modules, dist, etc.) deben omitirse."""
        (tmp_dir / "node_modules").mkdir()
        (tmp_dir / "dist").mkdir()
        (tmp_dir / "src").mkdir()

        result = get_tree(tmp_dir)

        assert "src/" in result
        assert "node_modules" not in result
        assert "dist" not in result

    def test_empty_directory(self, tmp_dir):
        """Un directorio vacío debe devolver string vacío (sin items)."""
        result = get_tree(tmp_dir)

        assert result == ""

    def test_last_item_uses_corner_glyph(self, tmp_dir):
        """El último item de un nivel debe usar └──, no ├──."""
        (tmp_dir / "a.txt").write_text("a")
        (tmp_dir / "z.txt").write_text("z")

        result = get_tree(tmp_dir)

        # El último item (alfabéticamente z.txt) debe usar └──
        assert "└── z.txt" in result
        assert "├── a.txt" in result


class TestGenerateAiContext:
    """Pruebas para generate_ai_context — escribe reporte Markdown a disco."""

    def test_creates_output_file(self, tmp_dir):
        """Debe crear el archivo de salida con contenido Markdown."""
        output = tmp_dir / "structure.md"

        # Usamos project_structure.py con el tmp_dir como root
        generate_ai_context(root_dir=str(tmp_dir), output_file=str(output))

        assert output.exists()
        content = output.read_text()
        assert "# Project Structure:" in content
        assert "```text" in content
        assert "```" in content

    def test_output_includes_root_name(self, tmp_dir):
        """El header debe incluir el nombre del directorio raíz."""
        output = tmp_dir / "out.md"

        generate_ai_context(root_dir=str(tmp_dir), output_file=str(output))

        content = output.read_text()
        assert tmp_dir.name in content
