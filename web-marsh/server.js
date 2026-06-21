const http = require("http");

const PORT = Number(process.env.PORT || 3000);
const LOGIN = "1154070";
const TIME_ZONE = "Europe/Moscow";

function partsForToday() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(new Date());

  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const fullYear = byType.year;
  return {
    route: `${byType.day}${byType.month}${fullYear.slice(-2)}`,
    responseDate: `${byType.day}-${byType.month}-${fullYear}`,
  };
}

function send(res, status, contentType, body) {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Cache-Control": "no-store",
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = decodeURIComponent(url.pathname);
  const today = partsForToday();

  if (req.method === "GET" && pathname === "/") {
    send(res, 200, "text/plain; charset=utf-8", "OK");
    return;
  }

  if (req.method === "GET" && pathname === `/${today.route}`) {
    send(
      res,
      200,
      "application/json; charset=utf-8",
      JSON.stringify({ date: today.responseDate, login: LOGIN }),
    );
    return;
  }

  const reverseMatch = pathname.match(/^\/api\/rv\/([a-z]+)$/);
  if (req.method === "GET" && reverseMatch) {
    send(
      res,
      200,
      "text/plain; charset=utf-8",
      [...reverseMatch[1]].reverse().join(""),
    );
    return;
  }

  send(res, 404, "text/plain; charset=utf-8", "Not found");
});

server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
