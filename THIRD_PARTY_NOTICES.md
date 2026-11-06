# Source and asset notices

The project's original application code, game writing, documentation, editable SVG artwork, procedural scene drawing, and synthesized audio code are offered under the root [MIT License](LICENSE). This grant covers the rights held by the project author; third-party material retains its own license.

## Phaser 3.90.0

- Files: `dist/vendor/phaser.min.js` and `dist/vendor/PHASER-LICENSE.txt`.
- Author notice: Copyright (c) 2024 Richard Davey, Phaser Studio Inc.
- License: MIT; the complete upstream notice is retained in [PHASER-LICENSE.txt](dist/vendor/PHASER-LICENSE.txt).
- Source: [Phaser repository, tag v3.90.0](https://github.com/phaserjs/phaser/tree/v3.90.0).
- Distribution: [upstream UMD minified build](https://raw.githubusercontent.com/phaserjs/phaser/v3.90.0/dist/phaser.min.js).
- SHA-256 of the vendored engine: `e92ddef111ba42e92d316979c732311757093688ea1810591cb7aa2858eba7a7`.
- SHA-256 of the retained license: `c3123cd25de4eccf1fd5a5a0a6fc872299116d1dbbb48b00f2554a4c35220a65`.

The upstream license and copyright remain in effect. The root project's author notice does not replace them.

## Illustration, SVG artwork, and audio

`dist/assets/ming-scroll.png` was generated for this project with OpenAI ImageGen from the original text brief recorded in [art-direction.md](research/art-direction.md). No external reference image, book illustration, television frame, or actor photograph was used. The project permits reuse and redistribution of this supplied image under the root MIT terms to the extent it holds applicable rights; this is not a claim of exclusive copyright in AI-generated material or an endorsement by OpenAI.

`dist/portraits.js`, the inline landscapes and scene drawing, and `dist/assets/favicon.svg` were created for this project. Their cartoon appearances do not reproduce a television cast's likenesses. Audio is synthesized in `dist/audio.js` rather than loaded from a third-party recording. No third-party music files or sound sample library are bundled.

The CSS uses fonts already installed on the player's system. No font binaries are redistributed.

## Historical material

The real historical names and events are researched from the ancient *Ming Shi* (《明史》). The ancient original text is public-domain material. Source links and the distinction between historical facts and original game writing appear in [history-sources.md](research/history-sources.md) and the in-game 史料馆.

Downloaded Wikisource HTML pages, extracted text, and local research manifests are excluded from the public game export. The optional research downloader retrieves those pages separately and records their source. Modern annotations and website material remain subject to the source page's own terms; the root MIT license does not relicense them.

The modern book *Ming Chao Na Xie Shi Er* (《明朝那些事儿》) by 当年明月 is not included. This game uses original dialogue, choices, and rules based on historical people and events; it is not an official or full-text adaptation. References and links to the book do not grant rights to reproduce its text, cover, or other protected material.

## Repository research

[repository-research.md](research/repository-research.md) records the repository comparison. Phaser's official `template-importmap` informed the static delivery structure. No template source, demo art, or complete third-party game was copied into this application; the only bundled third-party runtime is the Phaser build listed above. Mentioned alternatives are references, not included dependencies.
