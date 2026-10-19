# Department website fonts

The existing IBM Plex Sans and Spectral Latin fonts are bundled unchanged and loaded
through `next/font/local`. This avoids the build-time Google Fonts URL parsing failure
tracked in [Next.js #99114](https://github.com/vercel/next.js/issues/99114), without
changing the department's typography or adding a dependency. KaTeX retains its own fonts.

Downloaded on 19/10/2026 from the Google Fonts stylesheets for IBM Plex Sans weights
400/500/600 and Spectral weights 400/600. IBM Plex Sans is a variable font; the same
file serves each requested weight. The accompanying SIL Open Font Licence files are
copied from the [Google Fonts repository](https://github.com/google/fonts/tree/main/ofl).

| Local file | Original file | SHA-256 |
|---|---|---|
| `ibm-plex-sans-latin.woff2` | [IBM Plex Sans v23](https://fonts.gstatic.com/s/ibmplexsans/v23/zYXzKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1syxeKYbSB4Zh.woff2) | `056e4e2459f57a0033c8c9c844ff19d6e42ac8602027803d4345823bcc939818` |
| `spectral-latin-400.woff2` | [Spectral v15 regular](https://fonts.gstatic.com/s/spectral/v15/rnCr-xNNww_2s0amA9M5knjsS_ul.woff2) | `bcb83e9c56d40c5111a2bbdc3d8bdabf66bd31337e968f1c223b61879b8d3cad` |
| `spectral-latin-600.woff2` | [Spectral v15 semibold](https://fonts.gstatic.com/s/spectral/v15/rnCs-xNNww_2s0amA9vmtm3BafaPWnII.woff2) | `1fb6ca29fc243e8bfdfce12d8d6806f322bcc62d38036986812be28fb1f41f0a` |
