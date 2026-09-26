#!/usr/bin/env python3
from pathlib import Path
import json
import zipfile

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
version = manifest["version"]
DIST = ROOT / "dist"
DIST.mkdir(exist_ok=True)
out = DIST / f"unified-account-colors-{version}.xpi"

runtime_paths = [
    ROOT / "manifest.json",
    ROOT / "background.js",
    ROOT / "LICENSE",
]
for base in [ROOT / "api", ROOT / "_locales"]:
    runtime_paths.extend(p for p in base.rglob("*") if p.is_file())

with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zf:
    for path in sorted(runtime_paths):
        zf.write(path, path.relative_to(ROOT).as_posix())

print(out)
