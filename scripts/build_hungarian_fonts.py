"""Regenerate the small Hungarian overlays for the bundled display fonts.

This is an asset preparation script. It uses fontTools and brotli and is
independent of the regular storefront build.
"""

from pathlib import Path
from unicodedata import normalize

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont

FONTS = Path(__file__).resolve().parents[1] / "assets/reference/fonts"
LETTERS = "ÁÉÍÓÖŐÚÜŰáéíóöőúüű"
MARKS = {"\u0301": "´", "\u0308": "¨", "\u030b": "˝"}


def outline(glyphs, name):
    drawing = DecomposingRecordingPen(glyphs)
    glyphs[name].draw(drawing)
    return drawing


def bounds(drawing):
    pen = BoundsPen(None)
    drawing.replay(pen)
    return pen.bounds


def build_overlay(filename, family, accent_font):
    source = TTFont(FONTS / f"{filename}.woff2")
    character_map = source.getBestCmap()
    glyphs = source.getGlyphSet()
    accents = {mark: outline(accent_font.getGlyphSet(), accent_font.getBestCmap()[ord(symbol)])
               for mark, symbol in MARKS.items()}
    cmap = {}
    outlines = {".notdef": TTGlyphPen(None).glyph()}
    metrics = {".notdef": (0, 0)}

    for letter in LETTERS:
        if ord(letter) in character_map:
            continue
        base, mark = normalize("NFD", letter)
        original = glyphs[character_map[ord(base)]]
        drawing = outline(glyphs, character_map[ord(base)])
        left, _, right, top = bounds(drawing)
        pen = TTGlyphPen(None)
        drawing.replay(pen)
        accent = accents[mark]
        x1, y1, x2, _ = bounds(accent)
        sx = min(0.8, (original.width * 0.85) / (x2 - x1))
        sy = 0.74
        x = (left + right - (x1 + x2) * sx) / 2
        y = top + 30 - y1 * sy
        accent.replay(TransformPen(pen, (sx, 0, 0, sy, x, y)))
        name = f"uni{ord(letter):04X}"
        glyph = pen.glyph()
        glyph.recalcBounds(None)
        outlines[name] = glyph
        metrics[name] = (original.width, glyph.xMin)
        cmap[ord(letter)] = name

    source_os = source["OS/2"]
    source_header = source["hhea"]
    builder = FontBuilder(source["head"].unitsPerEm, isTTF=True)
    builder.setupGlyphOrder(list(outlines))
    builder.setupCharacterMap(cmap)
    builder.setupGlyf(outlines)
    builder.setupHorizontalMetrics(metrics)
    builder.setupHorizontalHeader(ascent=source_header.ascent, descent=source_header.descent,
                                  lineGap=source_header.lineGap)
    builder.setupNameTable({"familyName": f"{family} Hungarian", "styleName": "Regular"})
    builder.setupOS2(version=source_os.version, usWeightClass=source_os.usWeightClass,
                     usWidthClass=source_os.usWidthClass, sTypoAscender=source_os.sTypoAscender,
                     sTypoDescender=source_os.sTypoDescender,
                     sTypoLineGap=source_os.sTypoLineGap,
                     usWinAscent=source_os.usWinAscent, usWinDescent=source_os.usWinDescent,
                     fsSelection=source_os.fsSelection, sxHeight=source_os.sxHeight,
                     sCapHeight=source_os.sCapHeight)
    builder.setupPost()
    builder.font["head"].macStyle = source["head"].macStyle
    builder.font["head"].created = source["head"].created
    builder.font["head"].modified = source["head"].modified
    builder.font.recalcTimestamp = False
    builder.font.flavor = "woff2"
    builder.save(FONTS / f"{filename}-hu.woff2")


if __name__ == "__main__":
    medium = TTFont(FONTS / "founders-grotesk-medium.woff2")
    build_overlay("founders-grotesk-condensed", "Founders Grotesk Condensed", medium)
    build_overlay("parabole", "Parabole", medium)
