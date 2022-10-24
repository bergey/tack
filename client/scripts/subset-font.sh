#! /usr/bin/env nix-shell
#! nix-shell -i bash
#! nix-shell -p woff2 python3.pgks.fonttools

# replace the icon font we serve with one that has glyphs for exactly
# the specified codepoints

# take codepoints, in hex, from fontawesome.subset.css
CHARSET=U+f1f8,U+f08e

woff2_decompress fa-solid-900.woff2
pyftsubset --unicodes=$CHARSET fa-solid-900.ttf
woff2_compress fa-solid-900.subset.ttf
mv fa-solid-900.subset.woff2 ../../public/assets/fontawesome
rm *.ttf
