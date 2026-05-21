from __future__ import annotations

import mimetypes
import os
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "Lux Hotel 1"
HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "7200"))


class HotelHandler(BaseHTTPRequestHandler):
    server_version = "LuxHotel/1.0"

    def log_message(self, fmt: str, *args) -> None:
        print("%s - %s" % (self.address_string(), fmt % args))

    def do_GET(self) -> None:
        request_path = self.path.split("?", 1)[0].split("#", 1)[0]
        rel = urllib.parse.unquote(request_path).lstrip("/") or "index.html"
        target = (STATIC_DIR / rel).resolve()
        root = STATIC_DIR.resolve()
        if not str(target).startswith(str(root)) or not target.is_file():
            target = STATIC_DIR / "index.html"

        body = target.read_bytes()
        content_type = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)


def main() -> None:
    server = ThreadingHTTPServer((HOST, PORT), HotelHandler)
    print(f"Lux Hotel frontend running at http://{HOST}:{PORT}")
    print(f"Static root: {STATIC_DIR}")
    server.serve_forever()


if __name__ == "__main__":
    main()
