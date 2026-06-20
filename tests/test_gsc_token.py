"""Tests para scripts/get_gsc_dns_token.py — generación de token GSC."""

from pathlib import Path

from get_gsc_dns_token import DOMAIN, SCOPES


class TestGscConfig:
    """Pruebas de integridad de la configuración del script GSC."""

    def test_domain_is_monedario(self):
        """El dominio debe ser monedario.cl."""
        assert DOMAIN == "monedario.cl"

    def test_scopes_include_siteverification(self):
        """Los scopes deben incluir el de verificación de sitio."""
        assert "https://www.googleapis.com/auth/siteverification" in SCOPES

    def test_service_account_path_respects_env(self, monkeypatch):
        """La ruta del service account debe ser configurable vía variable de entorno."""
        custom_path = "/tmp/custom-sa.json"
        monkeypatch.setenv("GSC_SERVICE_ACCOUNT_FILE", custom_path)

        # Re-importar para que tome la variable de entorno
        import importlib

        import get_gsc_dns_token

        importlib.reload(get_gsc_dns_token)

        assert Path(custom_path) == get_gsc_dns_token.SERVICE_ACCOUNT_FILE

    def test_service_account_default_path(self, monkeypatch):
        """Sin variable de entorno, debe usar la ruta por defecto."""
        monkeypatch.delenv("GSC_SERVICE_ACCOUNT_FILE", raising=False)

        import importlib

        import get_gsc_dns_token

        importlib.reload(get_gsc_dns_token)

        expected = get_gsc_dns_token.SCRIPT_DIR / "credentials" / "gsc-service-account.json"
        assert expected == get_gsc_dns_token.SERVICE_ACCOUNT_FILE
