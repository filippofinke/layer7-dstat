const http = require("http");
const fs = require("fs");
const WebSocket = require("ws");

const port = 8080;
var requests = 0;

const index = fs.readFileSync("./index.html");

const handler = function (req, res) {
	if (req.url == "/dstat") {
		requests++;
		res.end();
	} else {
		res.end(index);
	}
};

const broadcast = function () {
	wss.clients.forEach((client) => client.send(requests));
	requests = 0;
};

const server = http.createServer(handler);
const wss = new WebSocket.Server({ server });

setInterval(broadcast, 1000);

console.log("Server listening on port " + port);
server.listen(port);
