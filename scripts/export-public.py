#!/usr/bin/env python3
"""Create a fresh public-source snapshot from an explicit allowlist.

This never copies Git history, hosting identity, credentials, research downloads,
or QA data. The destination must be absent or empty. Run only after final checks.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path

REQUIRED_FILES = (
    'dist/index.html',
    'dist/style.css',
    'dist/app.js',
    'dist/engine.js',
    'dist/content.js',
    'dist/scene.js',
    'dist/portraits.js',
    'dist/audio.js',
    'dist/share.js',
    'dist/assets/ming-scroll.png',
    'dist/assets/favicon.svg',
    'dist/vendor/phaser.min.js',
    'dist/vendor/PHASER-LICENSE.txt',
    'package.json',
    'LICENSE',
    'THIRD_PARTY_NOTICES.md',
    'README.md',
    'scripts/test-engine.mjs',
    'scripts/export-public.py',
    'research/history-sources.md',
    'research/repository-research.md',
    'research/art-direction.md',
    'research/download-sources.py',
)
# Exact optional paths; add a new test here deliberately when its source is reviewed.
OPTIONAL_FILES = ('scripts/test-audio.mjs', 'scripts/test-save.mjs')
PUBLIC_GITIGNORE = '''.DS_Store
node_modules/
.env
.env.*
!.env.example
.openai/
qa/
research/sources/
__pycache__/
*.pyc
*.log
*.tar.gz
*.tgz
'''
TEXT_SUFFIXES = {'.js', '.mjs', '.py', '.json', '.html', '.css', '.svg', '.md', '.txt'}
BLOCKED_PATTERNS = {
    'personal absolute path': re.compile(r'/(?:Users|home)/[^\s<>"\']+|/private/(?:var)/[^\s<>"\']+'),
    'Sites project identity': re.compile(r'appgprj_[A-Za-z0-9]{8,}'),
    'OpenAI API credential': re.compile(r'\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,}'),
    'GitHub credential': re.compile(r'\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})'),
    'private key': re.compile(r'-----BEGIN [A-Z ]*PRIVATE KEY-----'),
    'bearer credential': re.compile(r'Bearer\s+[A-Za-z0-9_.-]{24,}'),
    'credential in URL': re.compile(r'https?://[^\s/@:]+:[^\s/@]+@'),
}

def fail(message):
    raise SystemExit('EXPORT BLOCKED: ' + message)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--target', type=Path, required=True, help='A new or empty output directory')
    args = parser.parse_args()
    source = Path(__file__).resolve().parent.parent
    target = args.target.expanduser().resolve()
    if target == source or source in target.parents or target in source.parents:
        fail('destination must be outside the source tree and not its ancestor')
    if target.exists() and (not target.is_dir() or any(target.iterdir())):
        fail('destination already exists and is not an empty directory')

    paths = list(REQUIRED_FILES) + [p for p in OPTIONAL_FILES if (source / p).is_file()]
    missing = [p for p in REQUIRED_FILES if not (source / p).is_file()]
    if missing:
        fail('required files are missing: ' + ', '.join(missing))
    allowed = set(paths)
    # A new runtime asset must be reviewed and explicitly added, not silently omitted.
    unexpected = [p.relative_to(source).as_posix() for p in (source / 'dist').rglob('*')
                  if p.is_file() and p.name != '.DS_Store'
                  and p.relative_to(source).as_posix() not in allowed]
    if unexpected:
        fail('unreviewed runtime files: ' + ', '.join(unexpected))
    package = json.loads((source / 'package.json').read_text(encoding='utf-8'))
    script_refs = set(re.findall(r'scripts/[A-Za-z0-9_./-]+', ' '.join(package.get('scripts', {}).values())))
    if script_refs - allowed:
        fail('package commands reference files outside the allowlist: ' + ', '.join(sorted(script_refs - allowed)))

    entries = []
    for relative in paths:
        path = source / relative
        if path.is_symlink() or any(parent.is_symlink() for parent in path.parents if parent != source):
            fail('symbolic links are not exported: ' + relative)
        if source not in path.resolve().parents:
            fail('file resolves outside source: ' + relative)
        data = path.read_bytes()
        if path.suffix in TEXT_SUFFIXES or path.name in {'LICENSE', 'README'}:
            value = data.decode('utf-8')
            for label, pattern in BLOCKED_PATTERNS.items():
                if pattern.search(value):
                    fail(f'{label} detected in {relative}; review before publication')
        else:
            # Inspect embedded asset text for the same concrete private-data markers.
            value = data.decode('latin-1')
            for label, pattern in BLOCKED_PATTERNS.items():
                if pattern.search(value):
                    fail(f'{label} detected inside {relative}; review before publication')
        entries.append((relative, data, hashlib.sha256(data).hexdigest()))

    # All checks finish before the destination is created or populated.
    target.mkdir(parents=True, exist_ok=True)
    for relative, data, _digest in entries:
        destination = target / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(data)
    (target / '.gitignore').write_text(PUBLIC_GITIGNORE, encoding='utf-8')
    print(json.dumps({'status': 'exported', 'files': len(entries) + 1,
                      'bytes': sum(len(data) for _, data, _ in entries),
                      'sha256': {relative: digest for relative, _, digest in entries},
                      'excluded': ['Git history', 'hosting identity', 'QA data', 'raw research downloads', 'environment files']},
                     ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
