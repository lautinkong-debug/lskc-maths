# Canvas UI — local source integration

Source: https://github.com/DavidHDev/canvas-ui
Revision: a04a99b235299ee79a123a16ccb2e6cf9da74b6b
Retrieved: 15 October 2026

Canvas UI is a component library, not a Codex skill (the source contains no SKILL.md).
The dependency-free WebGL2 Grid engine and its three utilities are installed here.
The original MIT + Commons Clause notice is in LICENSE.md.

Local adaptation: captureHtml is explicitly opt-in and defaults to false. The
homepage uses only the decorative overlay; its interactive graph stays native
SVG/HTML, with no experimental HTML-in-canvas flags. The wrapper loads the engine
on demand, skips reduced-motion devices, and releases resources on unmount.
No idle animation is enabled. CSS graph paper remains if WebGL2 is unavailable.
