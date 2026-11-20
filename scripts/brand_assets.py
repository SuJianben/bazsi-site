"""Placements for the original artwork in the storefront's animated sections."""

ART_SIZES = {
    "gamepad": (170, 190),
    "football": (211, 107),
    "whistle": (120, 123),
    "boots": (235, 172),
    "headset": (224, 205),
    "hoodie-mascot": (428, 404),
    "tactics-board": (469, 378),
    "street-player": (385, 550),
}

HERO_ART = ("gamepad", "football", "whistle", "boots", "headset")
BURST_ART = (
    "headset", "football", "boots", "whistle", "gamepad", "football",
    "tactics-board", "hoodie-mascot", "boots", "street-player", "tactics-board", "gamepad",
)
SHOWCASE_ART = (
    (("headset", 803, 59, 225, 205), ("boots", 128, 140, 248, 165),
     ("hoodie-mascot", 426, 288, 225, 222)),
    (("football", 75, 18, 255, 148), ("gamepad", 492, 130, 228, 180),
     ("whistle", 1006, 155, 170, 155), ("hoodie-mascot", 440, 320, 196, 190)),
    (("street-player", 214, 169, 206, 270), ("football", 748, 139, 188, 125),
     ("whistle", 538, 66, 125, 132)),
    (("headset", 191, 93, 188, 185), ("gamepad", 411, 292, 198, 159),
     ("tactics-board", 850, 132, 235, 176), ("football", 913, 364, 143, 92)),
)


def artwork(name, classes):
    width, height = ART_SIZES[name]
    return (
        f'<svg aria-hidden="true" class="{classes}" viewBox="0 0 {width} {height}">'
        f'<image href="@@ROOT@@assets/brand/{name}.webp" width="{width}" height="{height}"/>'
        '</svg>'
    )


def showcase_art(index):
    return "\n".join(
        f'<g id="item-space-{index}-art-{item}"><image class="store-showcase-art" '
        f'href="@@ROOT@@assets/brand/{name}.webp" x="{x}" y="{y}" width="{width}" height="{height}"/></g>'
        for item, (name, x, y, width, height) in enumerate(SHOWCASE_ART[index])
    )
