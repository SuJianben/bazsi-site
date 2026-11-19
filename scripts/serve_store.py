"""Serve the static demo locally, including its themed 404 response."""
from argparse import ArgumentParser
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]


class StoreHandler(SimpleHTTPRequestHandler):
    def send_error(self, code, message=None, explain=None):
        # Keep missing scripts and images as ordinary HTTP errors.
        path = urlsplit(self.path).path
        if code != HTTPStatus.NOT_FOUND or Path(path.rstrip("/")).suffix:
            return super().send_error(code, message, explain)

        html = (ROOT / "404.html").read_text(encoding="utf-8")
        html = html.replace('<base href="./">', '<base href="/">', 1)
        html = html.replace('const storeRoot = new URL("./",', 'const storeRoot = new URL("/",', 1)
        body = html.encode("utf-8")
        self.send_response(HTTPStatus.NOT_FOUND)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)


def main():
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("--port", default=4173, type=int)
    args = parser.parse_args()
    handler = partial(StoreHandler, directory=str(ROOT))
    with ThreadingHTTPServer(("127.0.0.1", args.port), handler) as server:
        print(f"Demo: http://localhost:{args.port}/", flush=True)
        server.serve_forever()


if __name__ == "__main__":
    main()
