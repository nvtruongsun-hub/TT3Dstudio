"""Quiet local preview server; avoids request logs filling a background pipe."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


class PreviewHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, *_args):
        pass


if __name__ == '__main__':
    ThreadingHTTPServer(('127.0.0.1', 8765), PreviewHandler).serve_forever()
