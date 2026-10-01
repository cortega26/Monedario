"""Reproducibility checks; these are not an independent financial audit."""

import json
import re
from decimal import Decimal

import pytest
from render_compound_interest_charts import (
    ROOT,
    accessible_text,
    checked_output_directory,
    closing_conversion,
    es_number,
    load_data,
)


def write_modified_data(tmp_path, mutate):
    data = load_data()
    mutate(data)
    target = tmp_path / "data.json"
    target.write_text(json.dumps(data), encoding="utf-8")
    return target


def test_declared_checkpoints_match_article_table_without_certifying_origin():
    article = (ROOT / "src/data/blog/el-poder-del-interes-compuesto.mdx").read_text()
    table = re.findall(r"\|\s*(?:\*\*)?Dic (\d{4})(?:\*\*)?\s*\|\s*(?:\*\*)?\$([\d.]+)", article)
    expected = [(f"{year}-12-31", int(value.replace(".", ""))) for year, value in table]
    actual = [(row["date"], row["usd"]) for row in load_data()["checkpoints"]]
    assert actual == expected
    assert len(actual) == 7


def test_closing_conversion_is_exact_decimal_with_explicit_rounding():
    assert closing_conversion(load_data()) == {
        "usd": "129495",
        "clpPerUsd": "911.18",
        "clpExact": "117993254.10",
        "clpRounded": "117993254",
        "clpMillions": "118.0",
        "rounding": "ROUND_HALF_UP",
        "scope": "conversion_of_declared_checkpoint_only",
    }


@pytest.mark.parametrize("value", [-1, 4.5, True, float("nan")])
def test_rejects_unsupported_checkpoint_values(tmp_path, value):
    path = write_modified_data(tmp_path, lambda data: data["checkpoints"][0].update(usd=value))
    with pytest.raises(ValueError, match="nonnegative integer"):
        load_data(path)


@pytest.mark.parametrize("value", ["NaN", "Infinity", "0", "-911.18"])
def test_rejects_invalid_fx(tmp_path, value):
    path = write_modified_data(tmp_path, lambda data: data["closingFx"].update(clpPerUsd=value))
    with pytest.raises(ValueError, match="finite and positive"):
        load_data(path)


def test_rejects_missing_provenance_and_date_drift(tmp_path):
    path = write_modified_data(
        tmp_path, lambda data: data["checkpoints"][0].update(sourceRef="missing")
    )
    with pytest.raises(ValueError, match="provenance"):
        load_data(path)
    path = write_modified_data(
        tmp_path, lambda data: data["checkpoints"][0].update(date="2025-12-31")
    )
    with pytest.raises(ValueError, match="unique, increasing"):
        load_data(path)
    path = write_modified_data(tmp_path, lambda data: data.update(cutoffDate="2026-12-31"))
    with pytest.raises(ValueError, match="final checkpoint"):
        load_data(path)


def test_rejects_interpolation_and_non_review_status(tmp_path):
    path = write_modified_data(tmp_path, lambda data: data.update(interpolation="linear"))
    with pytest.raises(ValueError, match="no interpolation"):
        load_data(path)
    path = write_modified_data(tmp_path, lambda data: data.update(status="PASS"))
    with pytest.raises(ValueError, match="pending-review"):
        load_data(path)


def test_output_guard_rejects_public_and_src_including_symlinks(tmp_path):
    for path in (ROOT / "public", ROOT / "public/images/hero", ROOT / "src/generated"):
        with pytest.raises(ValueError, match="cannot be written"):
            checked_output_directory(path)
    (tmp_path / "public-alias").symlink_to(ROOT / "public", target_is_directory=True)
    with pytest.raises(ValueError, match="cannot be written"):
        checked_output_directory(tmp_path / "public-alias/graphs")
    assert checked_output_directory(tmp_path / "review") == tmp_path / "review"


def test_accessible_description_keeps_values_limits_and_review_status():
    text = accessible_text(load_data())
    assert "pendiente de auditoría independiente" in text
    assert "129.495" in text
    assert "117993254.10" in text
    assert "no una simulación reejecutada" in text
    assert "ni crisis entre checkpoints" in text
    assert "24 meses sin aporte" in text
    assert es_number(Decimal("911.18"), 2) == "911,18"
    assert es_number(129495) == "129.495"


def test_plots_have_only_documented_bars_zero_baseline_and_no_connected_curve():
    pytest.importorskip("matplotlib")
    from matplotlib import pyplot as plt
    from render_compound_interest_charts import build_figure

    data = load_data()
    for variant in ("hero", "inline"):
        fig = build_figure(data, variant)
        ax = fig.axes[0]
        assert not ax.lines
        assert len(ax.patches) == len(data["checkpoints"])
        values = [row["usd"] for row in data["checkpoints"]]
        if variant == "hero":
            assert [bar.get_height() for bar in ax.patches] == values
            assert ax.get_ylim()[0] == 0
        else:
            assert [bar.get_width() for bar in ax.patches] == values
            assert ax.get_xlim()[0] == 0
        assert any("AUDITORÍA PENDIENTE" in label.get_text() for label in fig.texts)
        plt.close(fig)
