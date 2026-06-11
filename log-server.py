#!/usr/bin/env python3
"""Micro log server for workspace.html — receives POST /log and appends to file."""
import json, sys, os
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime, timezone, timedelta

KST = timezone(timedelta(hours=9))
LOG_FILE = os.path.expanduser("~/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/workspace-debug.log")

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/log':
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length).decode('utf-8')
            timestamp = datetime.now(KST).strftime('%H:%M:%S.%f')[:-3]
            with open(LOG_FILE, 'a') as f:
                f.write(f"[{timestamp}] {body}\n")
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(b'OK')
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'OK')
        elif self.path == '/logs':
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            try:
                with open(LOG_FILE) as f:
                    self.wfile.write(f.read().encode('utf-8'))
            except FileNotFoundError:
                self.wfile.write(b'(empty)')
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        pass  # suppress stderr logging

PORT = 9876
print(f"Log server: http://localhost:{PORT}  →  {LOG_FILE}")
HTTPServer(('127.0.0.1', PORT), Handler).serve_forever()
