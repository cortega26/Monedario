"""Tests del gate CSRF mínimo (RM-018): require_same_origin."""

from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app import require_same_origin


def req(site=None):
    headers = {} if site is None else {"sec-fetch-site": site}
    return SimpleNamespace(headers=headers)


def test_ausencia_header_permitida_curl_y_scripts():
    require_same_origin(req(None))


def test_same_origin_permitido():
    require_same_origin(req("same-origin"))


def test_case_insensitive():
    require_same_origin(req("Same-Origin"))


@pytest.mark.parametrize("site", ["cross-site", "same-site", "none"])
def test_sitios_no_mismo_origen_rechazados(site):
    with pytest.raises(HTTPException) as exc:
        require_same_origin(req(site))
    assert exc.value.status_code == 403
