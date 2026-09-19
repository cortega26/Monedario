"""
RM-015 — single ENTRY_RE source for reddit-monitor.

The digest entry format has ONE producer (monitor.render_entry) but had
TWO independent parser copies: weekly_report.py and migrate_history.py,
each with a slightly different regex. This module is the canonical
pattern — both import it (plus monitor.py, which uses it in
entry_sort_key), so the format can never drift between reader and writer
again.

Group names follow weekly_report's convention (time/sub/conf/kw/signals/
link/snippet); migrate_history.py derives `permalink` from `link` and maps
sub->subreddit, conf->confidence, kw->keyword at its single use site.

Notes on the merge (both behavior-preserving on real digests):
- `signals` uses `.*` (migrate_history's version): render_entry always
  emits at least "—", so no real entry ever has an empty signals line;
  the `.*` only makes hand-edited entries with an empty line parseable.
- trailing `\\n?` (migrate_history's version): harmless for finditer.
"""
import re

ENTRY_RE = re.compile(
    r"^### (?P<time>\d{2}:\d{2}) — r/(?P<sub>\S+) \[(?P<conf>Alta|Media|Baja)\]\n"
    r"\*\*Keyword:\*\* (?P<kw>.+)\n"
    r"\*\*Señales de intención:\*\* (?P<signals>.*)\n"
    r"\*\*Enlace:\*\* (?P<link>\S+)\n"
    r"> (?P<snippet>.*)\n?",
    re.MULTILINE,
)

# Prefix stripped by migrate_history.parse_day to recover the permalink path.
REDDIT_LINK_PREFIX = "https://reddit.com"
