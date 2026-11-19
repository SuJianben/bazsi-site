"""Compose the authorized reference markup into a static Hungarian storefront."""
from html import escape
from hashlib import sha256
from pathlib import Path
import json
import re
import subprocess

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
FIELD_CLASS = ("store-field w-full rounded border-2 border-light-black bg-white px-4 py-2.5 "
               "text-light-black focus:outline-2 focus:outline-offset-2 focus:outline-light-black")
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


def small_link(label, href):
    return f'<a class="is-tag inline-block rounded-xs bg-white px-5 py-3 text-black transition-colors hover:bg-hello-yellow" href="{href}">{label}</a>'


def form_button(label, color, *, newsletter=False):
    return template("form-submit", button_label=escape(label), face_color=color,
                    extra_class=" mt-4 lg:mt-6" if newsletter else "",
                    button_state="disabled" if newsletter else "")


def animated_type(label):
    return label[0] + f'<span class="font-heading-special text-[0.9em]">{label[1]}</span>' + label[2:]


def card(product, scope, *, in_rail=False):
    color, pairing, mask_scale, mask_hover, mask_path = card_styles.get(product["id"], card_styles["felnott-pulover"])
    name = escape(product["name"])
    heading = name.replace(" ", " <br>", 1) if in_rail and product["type"] == "PÓLÓ" else name
    return template("card", product_path=f"products/{product['id']}/",
                    product_name=name, product_heading=heading, product_type=product["type"],
                    product_group=groups[product["group"]], product_image=product["image"],
                    product_marquee=animated_type(product["type"]),
                    product_sizes=" / ".join(product["sizes"]), card_color=color,
                    card_pairing=pairing, mask_path=mask_path, mask_scale=mask_scale,
                    mask_hover=mask_hover, mask_id=f"card-{scope}-{product['id']}",
                    rail_spacing=" store-rail-meta" if in_rail else "")


def demo_rail_slides(items, scope, *, repeats):
    return ''.join(card(product, f"{scope}-{position}", in_rail=True)
                   for position, product in enumerate(items * repeats, start=1))


def grid(items, scope, searching=False):
    attrs = ' id="search-results"' if searching else ''
    cards = []
    for item in items:
        data = f' data-search-name="{escape(item["name"])}"' if searching else ''
        cards.append(f'<div class="min-w-0"{data}>{card(item, scope)}</div>')
    return f'<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"{attrs}>' + ''.join(cards) + '</div>'


def section(content, extra=""):
    return f'<section class="bg-light-black text-white {extra}"><div class="container">{content}</div></section>'


def write_page(route, title, content, filename="index.html"):
    depth = len(route.strip("/").split("/")) if route else 0
    prefix = "../" * depth or "./"
    title = escape(title)
    page_key = route.replace("/", "-") or ("home" if filename == "index.html" else "not-found")
    newsletter = template("home-footer-feature", form_id=f"newsletter-{page_key}", field_class=FIELD_CLASS,
                          submit_button=form_button("Feliratkozás", "red-pairing", newsletter=True))
    footer = template("footer", wordmark=template("wordmark-paths"), footer_feature=newsletter)
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
{template("cart-drawer")}
{template("icon-burst")}
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
    return (f'<div class="block-content max-w-125 text-pretty"><h2 class="is-h4">{title}</h2>'
            + "".join(f'<p>{paragraph}</p>' for paragraph in paragraphs) + '</div>')


def detail(title, image, tag, body, aside):
    return template("detail", title=escape(title), detail_image=image, detail_tag=escape(tag),
                    detail_body=body, detail_aside=aside)


def main():
    spaces = {}
    tee_notes = {
        "felnott-polo": "Fekete póló a mindennapokra, apró Limitless Essentials emblémával.",
        "gyerek-polo": "Egy mindennapi alapdarab gyerekeknek. A fekete póló mellkasán, bal oldalt apró Limitless Essentials embléma látható.",
    }
    for i, product in enumerate(products):
        label = f'{groups[product["group"]]} {product["type"].lower()}'
        note = escape(tee_notes.get(product["id"], product["description"]))
        spaces.update({f"space_image_{i}": product["image"],
                       f"space_name_{i}": escape(product["name"]),
                       f"space_label_{i}": escape(label), f"space_note_{i}": note,
                       f"space_path_{i}": f"products/{product['id']}/"})
    wordmark = template("wordmark-paths")
    about = template("home-about", wordmark=wordmark, crest_id="home-brand-crest")
    kids = [product for product in products if product["group"] == "gyerek"]
    home = (template("home-hero") + template("home-film")
            + template("home-rail", all_slides=demo_rail_slides(products, "home-all", repeats=2),
                       kids_slides=demo_rail_slides(kids, "home-kids", repeats=4))
            + template("home-drop") + template("tiles", tile_scope="home") + template("home-journal")
            + template("home-spaces", **spaces) + about + template("home-story"))
    write_page("", "Bazsi", home)
    write_page("collections", "Sorozatok", banner("Sorozatok") + template("tiles", tile_scope="collections"))
    for slug, title in [("all", "Összes termék"), ("felnott", "Felnőtt kollekció"), ("gyerek", "Gyerek kollekció")]:
        switches = '<nav class="flex flex-wrap gap-2 pb-8" aria-label="Sorozatok">' + ''.join(
            small_link(label, f"collections/{key}/")
            for key, label in [("all", "Összes"), ("felnott", "Felnőtt"), ("gyerek", "Gyerek")]) + '</nav>'
        items = [item for item in products if slug == "all" or item["group"] == slug]
        write_page(f"collections/{slug}", title, banner(title) + section(switches + grid(items, f"collection-{slug}")))
    for product in products:
        sizes = ''.join(f'<option class="bg-white text-black" value="{size}">{size}</option>' for size in product["sizes"])
        form = template("form-product", product_id=product["id"], sizes=sizes, field_class=FIELD_CLASS,
                        submit_button=form_button("Kosárba teszem", "pink-pairing"))
        panel = '<h2 class="is-section-label">Termékadatok</h2><p>Szín: fekete</p>' + form
        related = section('<h2 class="is-h4 pb-8">További termékek</h2>' +
                          grid([p for p in products if p["id"] != product["id"]], f'product-{product["id"]}'))
        write_page(f'products/{product["id"]}', product["name"],
                   detail(product["name"], product["image"], groups[product["group"]],
                          description("Limitless Essentials", [product["description"]]), panel) + related)
    write_page("blog", "Napló", banner("A napló", "assets/tshirt.png") + template("home-story"))
    article = detail("Határok nélkül", "assets/tshirt.png", "NAPLÓ",
                     description("Limitless Essentials × Bazsi",
                                 ["A stílus nem szabályokról szól. Hanem arról, hogy önmagad lehess, bármerre is indulsz.",
                                  "Alapdarabok a mindennapokra."]),
                     '<h2 class="is-section-label">Napló</h2>' + small_link("A kollekció", "collections/all/"))
    write_page("blog/hatartalan", "Határok nélkül", article)
    about_page = template("home-about", wordmark=wordmark, crest_id="about-brand-crest")
    write_page("about", "A márka", banner("A márka") + about_page.replace('href="@@ROOT@@about/"',
               'href="@@ROOT@@collections/all/"').replace('A történetünk', 'A kollekció') + template("home-story"))
    search_form = template("form-search", field_class=FIELD_CLASS)
    write_page("search", "Keresés", banner("Keresés") + section(search_form + grid(products, "search", searching=True)))
    basket = ('<div data-cart-list class="flex flex-col gap-4" aria-live="polite"></div>'
              '<div class="pt-8">' + small_link("Vissza a kollekcióhoz", "collections/all/") + '</div>')
    write_page("cart", "Kosár", banner("A kosarad") + section(basket))
    write_page("", "Az oldal nem található", template("not-found")
               + section(small_link("Vissza a főoldalra", "./")), filename="404.html")


if __name__ == "__main__":
    main()
