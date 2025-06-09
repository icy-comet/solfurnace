import http from "http";
import fs from "fs";
import path from "path";
import { URL } from "url";

const PORT = 7000;
const PUBLIC_DIR = "metadata";

const server = http.createServer((req, res) => {
  if (!req.url) return;

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  if (pathname === "/") {
    pathname = "/index.html";
  }

  const filePath = path.join(PUBLIC_DIR, pathname);

  fs.readFile(filePath, (err, data) => {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
      return;
    }

    // Try to guess basic content type
    const ext = path.extname(filePath);
    const contentType =
      {
        ".html": "text/html",
        ".js": "application/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".gif": "image/gif",
      }[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
