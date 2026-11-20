"""Compose the authorized reference markup into a static Hungarian storefront."""
from html import escape
from hashlib import sha256
from pathlib import Path
import json
import re
import subprocess

from brand_assets import BURST_ART, HERO_ART, artwork, falling_art, showcase_art

ROOT = Path(__file__).resolve().parents[1]
TEMPLATES = ROOT / "src/reference/templates"
STOREFRONT_SCRIPT = "src/reference/storefront.js"
SCRIPT_VERSION = sha256((ROOT / STOREFRONT_SCRIPT).read_bytes()).hexdigest()[:12]
STOREFRONT_STYLE = "src/reference/storefront.css"
STYLE_VERSION = sha256((ROOT / STOREFRONT_STYLE).read_bytes()).hexdigest()[:12]
products = json.loads(subprocess.check_output([
    "node", "--input-type=module", "-e",
    "import {products} from './src/data/products.js'; console.log(JSON.stringify(products));",
], cwd=ROOT, encoding="utf-8"))
groups = {"felnott": "Felnőtt", "gyerek": "Gyerek"}
COLLECTION_FILTERS = {"all": "Összes termék", "felnott": "Felnőtt", "gyerek": "Gyerek"}
CREATOR_VIDEO_URL = "https://www.youtube.com/watch?v=XmJK0aZdHcw"
RAIL_CARD_LAYOUT = ("w-9/10 shrink-0 pr-3 sm:w-3/5 sm:pr-3 md:w-[calc(50%+0.5em)] "
                    "lg:w-[calc(33.3333%+0.25em)] xl:w-[calc(25%+0.25em)] 3xl:w-[calc(20%+0.25em)]")
FIELD_CLASS = ("store-field w-full rounded border-2 border-light-black bg-white px-4 py-2.5 "
               "text-light-black focus:outline-2 focus:outline-offset-2 focus:outline-light-black")
DROPDOWN_OPTION_CLASS = "store-dropdown-option is-tag rounded-xs px-3 py-3 text-black transition-colors duration-150"
card_styles = {
    "felnott-pulover": ("hot-pink", "pink", "3", "0.9", "M0 350 L0 250 A200 200 0 0 1 400 250 L400 350 Z"),
    "gyerek-pulover": ("light-purple", "purple", "4.6", "1.2", "M50 65 L150 65 L150 155 L250 155 L250 245 L350 245 L350 335 L50 335 Z"),
    "felnott-polo": ("blue-skies", "blue", "3.4", "0.9", "M200 50 L400 350 L0 350 Z"),
    "gyerek-polo": ("red-hot", "red", "2.1", "0.9", "M200 0 L400 200 L200 400 L0 200 Z"),
}


def template(name, **values):
    source = (TEMPLATES / f"{name}.html").read_text(encoding="utf-8")
    for key, value in values.items():
        source = source.replace("@@" + key.upper() + "@@", str(value))
    return source


def form_button(label, color, *, newsletter=False):
    return template("theme-action", action_tag="button", action_layout="block w-full",
                    action_attrs='disabled type="submit"' if newsletter else 'type="submit"',
                    button_label=escape(label), face_color=color,
                    extra_class=" mt-4 lg:mt-6" if newsletter else "")


def theme_link(label, href, color, *, drawer=False):
    layout = "inline-block min-w-0 w-full" if drawer else "store-theme-link inline-block max-w-full"
    return template("theme-action", action_tag="a", action_layout=layout,
                    action_attrs=f'href="{escape(href)}"', button_label=escape(label),
                    face_color=color, extra_class=" [--tilt:0deg] [--turn:90deg]" if drawer else "")


def empty_state(message, *, label="", href=None, attrs="", compact=False):
    action = ""
    if label:
        action = template("theme-action", action_tag="a" if href else "button",
                          action_layout="inline-block min-w-0",
                          action_attrs=f'href="{escape(href)}"' if href else 'type="reset" form="store-search"',
                          button_label=escape(label), face_color="hello-yellow",
                          extra_class=" [--face:3.5em] [--tilt:0deg] [--turn:90deg]")
    return template("empty-state", message=escape(message), action=action, state_attrs=attrs,
                    spacing="p-6" if compact else "px-8 py-12 sm:py-16")


def cart_drawer():
    return template("cart-drawer",
                    empty_state=empty_state("A kosarad jelenleg üres.", compact=True),
                    cart_action=theme_link("Kosár megnyitása", "cart/", "hot-pink", drawer=True),
                    collection_action=theme_link("Összes termék", "collections/all/", "hot-pink", drawer=True),
                    journal_action=theme_link("A napló megnyitása", "blog/", "hot-pink", drawer=True))


def animated_type(label):
    return label[0] + f'<span class="font-heading-special text-[0.9em]">{label[1]}</span>' + label[2:]


def card(product, scope, *, in_rail=False, searching=False, collection=None):
    color, pairing, mask_scale, mask_hover, mask_path = card_styles.get(product["id"], card_styles["felnott-pulover"])
    name = escape(product["name"])
    heading = name.replace(" ", " <br>", 1) if in_rail and product["type"] == "PÓLÓ" else name
    result_attrs = f' data-search-name="{name}"' if searching else ""
    if collection is not None:
        group = product["group"]
        result_attrs = f' data-collection-item="{group}"'
        if collection not in ("all", group):
            result_attrs += " hidden"
    return template("card", product_path=f"products/{product['id']}/",
                    product_name=name, product_heading=heading, product_type=product["type"],
                    product_group=groups[product["group"]], product_image=product["image"],
                    product_marquee=animated_type(product["type"]),
                    product_sizes=" / ".join(product["sizes"]), card_color=color,
                    card_pairing=pairing, mask_path=mask_path, mask_scale=mask_scale,
                    mask_hover=mask_hover, mask_id=f"card-{scope}-{product['id']}",
                    rail_spacing=" store-rail-meta" if in_rail else "",
                    card_layout=RAIL_CARD_LAYOUT if in_rail else "min-w-0",
                    button_min="min-w-[250px]" if in_rail else "min-w-0",
                    result_attrs=result_attrs)


def demo_rail_slides(items, scope, *, repeats):
    return ''.join(card(product, f"{scope}-{position}", in_rail=True)
                   for position, product in enumerate(items * repeats, start=1))


def grid(items, scope, *, searching=False, related=False, collection=None):
    gaps = "gap-6" if related else "gap-4 sm:gap-y-8 lg:gap-x-6 lg:gap-y-12"
    cards = ''.join(card(item, scope, searching=searching, collection=collection) for item in items)
    attrs = ' data-collection-results aria-live="polite"' if collection is not None else ""
    return f'<div class="grid grid-cols-1 {gaps} sm:grid-cols-2 lg:grid-cols-3"{attrs}>{cards}</div>'


def collection_filter(current, *, drawer=False):
    options = []
    for slug, label in COLLECTION_FILTERS.items():
        selected = ' aria-current="page"' if slug == current else ''
        options.append(f'<a class="{DROPDOWN_OPTION_CLASS}" '
                       f'data-events-filter data-collection-option="{slug}" data-no-swup '
                       f'href="collections/{slug}/#collection-results-{slug}"{selected}>{label}</a>')
    active = "" if current == "all" else " data-active"
    return template("dropdown", current_label=COLLECTION_FILTERS[current],
                    width="w-full" if drawer else "w-full sm:w-42",
                    dropdown_attrs=" data-collection-filter" + active,
                    summary_attrs="", label_attrs="", options=''.join(options))


def product_size_dropdown(product):
    sizes = [escape(size) for size in product["sizes"]]
    product_id = product["id"]
    options = ''.join(
        f'<button class="{DROPDOWN_OPTION_CLASS} cursor-pointer" type="button" '
        f'data-size-option="{size}" aria-pressed="{str(index == 0).lower()}">{size}</button>'
        for index, size in enumerate(sizes)
    )
    label_id = f"size-value-{product_id}"
    return template("dropdown", width="w-full", current_label=sizes[0],
                    dropdown_attrs=" data-product-size-picker hidden",
                    summary_attrs=f' aria-labelledby="size-label-{product_id} {label_id}"',
                    label_attrs=f' id="{label_id}"', options=options)


def write_page(route, title, content, filename="index.html"):
    depth = len(route.strip("/").split("/")) if route else 0
    prefix = "../" * depth or "./"
    title = escape(title)
    page_key = route.replace("/", "-") or ("home" if filename == "index.html" else "not-found")
    newsletter = template("home-footer-feature", form_id=f"newsletter-{page_key}", field_class=FIELD_CLASS,
                          newsletter_art=artwork("street-player",
                                                "w-full md:top-1/2 md:-translate-y-1/2 md:left-0 md:absolute will-change-transform"),
                          submit_button=form_button("Feliratkozás", "red-pairing", newsletter=True))
    footer = template("footer", wordmark=template("wordmark-paths"), footer_feature=newsletter)
    burst = template("icon-burst", **{
        f"burst_art_{index}": artwork(name, "h-auto w-full will-change-transform")
        for index, name in enumerate(BURST_ART)
    })
    initial = (
        'const storeRoot = new URL(' + json.dumps(prefix) + ', location.href);'
        'document.querySelector("base").href = storeRoot.href;'
    )
    html = f"""<!doctype html>
<html lang="hu">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#101010">
<meta name="color-scheme" content="dark">
<link rel="icon" href="data:,">
<title>{title} | Limitless Essentials</title>
<base href="{prefix}">
<script>{initial}</script>
<link rel="stylesheet" href="assets/reference/theme.css">
<link rel="stylesheet" href="{STOREFRONT_STYLE}?v={STYLE_VERSION}">
<script type="module" src="{STOREFRONT_SCRIPT}?v={SCRIPT_VERSION}"></script>
<script defer src="assets/reference/theme.js"></script>
</head>
<body class="min-h-screen">
<a class="skip-link screen-reader-text sr-only" href="#page-content">Ugrás a tartalomhoz</a>
{template("header")}
{template("backdrop")}
{cart_drawer()}
{burst}
<div id="page-frame">
<main id="page-content" tabindex="-1">{content}</main>
{footer}
</div>
</body>
</html>
"""
    html = html.replace("@@ROOT@@", "")
    if re.search(r"@@[A-Z0-9_]+@@", html):
        raise ValueError(f"Unfilled template in {route or '/'}")
    target = ROOT / route / filename
    target.parent.mkdir(exist_ok=True, parents=True)
    target.write_text(html, encoding="utf-8")


def banner(title, photo="assets/hoodie.png"):
    return template("banner", title=escape(title), banner_image=photo)


def description(title, paragraphs):
    copy = ''.join(f'<p>{escape(p)}</p>' for p in paragraphs)
    return ('<div class="flex flex-col gap-4 border-t border-white/20 py-8 opacity-0 max-lg:border-b lg:py-10 xl:py-12" '
            f'data-banner-reveal="0.3"><h2 class="is-technical-scale">{escape(title)}</h2>'
            f'<div class="block-content text-pretty [&amp;_p]:text-white/70">{copy}</div></div>')


def detail(title, image, tag, body, aside):
    return template("detail", title=escape(title), detail_image=image, detail_tag=escape(tag),
                    detail_body=body, detail_aside=aside)


def story_teaser(*, blog=False):
    return template("home-story", heading_level=2 if blog else 4,
                    link_label="Cikk megnyitása" if blog else "A napló")


def home_film():
    action = template("theme-action", action_tag="a", action_layout="store-theme-link inline-block max-w-full",
                      action_attrs=f'href="{CREATOR_VIDEO_URL}" target="_blank" rel="noopener" data-creator-video-open',
                      button_label="Bazsi videója", face_color="hello-yellow", extra_class="")
    return template("home-film", creator_video_url=CREATOR_VIDEO_URL, film_action=action)


def main():
    showcase_products = {
        "felnott-pulover": None,
        "felnott-polo": "Fekete póló a mindennapokra, apró Limitless Essentials emblémával.",
    }
    products_by_id = {product["id"]: product for product in products}
    # One viewport for the sticky frame, then two viewports of travel per product.
    spaces = {"scroll_height": 100 + 200 * len(showcase_products)}
    for i, (product_id, note) in enumerate(showcase_products.items()):
        product = products_by_id[product_id]
        label = f'{groups[product["group"]]} {product["type"].lower()}'
        spaces.update({f"space_image_{i}": product["image"],
                       f"space_name_{i}": escape(product["name"]),
                       f"space_label_{i}": escape(label), f"space_note_{i}": escape(note or product["description"]),
                       f"space_path_{i}": f"products/{product['id']}/",
                       f"space_art_{i}": showcase_art(i)})
    wordmark = template("wordmark-paths")
    about = template("home-about", wordmark=wordmark, crest_id="home-brand-crest")
    kids = [product for product in products if product["group"] == "gyerek"]
    hero = template("home-hero", **{
        f"hero_{name}": artwork(name, "h-full w-auto will-change-transform") for name in HERO_ART
    })
    banner_art_classes = "w-1/2 md:w-full md:top-1/2 md:-translate-y-1/2 md:left-0 md:absolute"
    home = (hero + home_film()
            + template("home-rail", all_slides=demo_rail_slides(products, "home-all", repeats=2),
                       kids_slides=demo_rail_slides(kids, "home-kids", repeats=4))
            + template("home-drop", drop_art=artwork("hoodie-mascot", banner_art_classes))
            + template("tiles", tile_scope="home")
            + template("home-journal", journal_art=artwork("tactics-board", banner_art_classes))
            + template("home-spaces", **spaces) + about + story_teaser())
    write_page("", "Bazsi", home)
    write_page("collections", "Sorozatok", banner("Sorozatok") + template("tiles", tile_scope="collections"))
    for slug, title in [("all", "Összes termék"), ("felnott", "Felnőtt kollekció"), ("gyerek", "Gyerek kollekció")]:
        filters = ('<nav aria-label="Korosztály" class="grid w-full grid-cols-2 items-center gap-1 sm:flex sm:flex-wrap" '
                   'data-events-filters-inline>' + collection_filter(slug) + '</nav>')
        drawer = template("collection-filter-drawer", scope=slug, filter=collection_filter(slug, drawer=True))
        listing = (f'<section class="overflow-hidden pt-10! text-white lg:pt-16!" data-events-archive '
                   f'data-collection-archive="{slug}" id="collection-results-{slug}">'
                   '<div class="container flex flex-col gap-8 lg:gap-14">'
                   + filters + grid(products, f"collection-{slug}", collection=slug) + '</div>' + drawer + '</section>')
        write_page(f"collections/{slug}", title, banner(title) + listing)
    for product in products:
        sizes = ''.join(f'<option class="bg-white text-black" value="{escape(size)}">{escape(size)}</option>'
                        for size in product["sizes"])
        form = template("form-product", product_id=product["id"], sizes=sizes, field_class=FIELD_CLASS,
                        size_dropdown=product_size_dropdown(product),
                        submit_button=form_button("Kosárba teszem", "pink-pairing"))
        panel = '<h2 class="is-section-label">Termékadatok</h2><p>Szín: fekete</p>' + form
        related = ('<section class="-mt-px bg-light-black"><div class="container flex flex-col gap-12">'
                   '<h2 class="is-section-label text-white">További termékek</h2>'
                   + grid([p for p in products if p["id"] != product["id"]], f'product-{product["id"]}', related=True)
                   + '</div></section>')
        write_page(f'products/{product["id"]}', product["name"],
                   detail(product["name"], product["image"], groups[product["group"]],
                          description("Leírás", [product["description"]]), panel) + related)
    write_page("blog", "Napló", banner("A napló", "assets/tshirt.png") + story_teaser(blog=True))
    article = detail("Határok nélkül", "assets/tshirt.png", "NAPLÓ",
                     description("Limitless Essentials × Bazsi",
                                 ["A stílus nem szabályokról szól. Hanem arról, hogy önmagad lehess, bármerre is indulsz.",
                                  "Alapdarabok a mindennapokra."]),
                     '<h2 class="is-section-label">Napló</h2>' + theme_link("A kollekció", "collections/all/", "pink-pairing"))
    write_page("blog/hatartalan", "Határok nélkül", article)
    about_page = template("home-about", wordmark=wordmark, crest_id="about-brand-crest")
    write_page("about", "A márka", banner("A márka") + about_page.replace('href="@@ROOT@@about/"',
               'href="@@ROOT@@collections/all/"').replace('A történetünk', 'A kollekció') + story_teaser())
    search_form = template("form-search", field_class=FIELD_CLASS)
    search_empty = empty_state("Nincs találat. Próbálj másik kifejezést.",
                               label="Keresés törlése", attrs=" data-search-status hidden")
    search_results = f'<div id="search-results">{grid(products, "search", searching=True)}{search_empty}</div>'
    write_page("search", "Keresés", template("tool-page", title="Keresés",
               body=search_form + search_results))
    basket = template("cart-page",
                      empty_state=empty_state("A kosarad jelenleg üres.",
                                              label="Vissza a kollekcióhoz", href="collections/all/"),
                      continue_link=theme_link("Vissza a kollekcióhoz", "collections/all/", "pink-pairing"))
    write_page("cart", "Kosár", template("tool-page", title="A kosarad", body=basket))
    not_found = template("not-found", falling_art=falling_art(),
                         home_action=theme_link("Vissza a főoldalra", "./", "hello-yellow"))
    write_page("", "Az oldal nem található", not_found, filename="404.html")


if __name__ == "__main__":
    main()
