const http = require("http");
const fs = require("fs");
const WebSocket = require("ws");
const cluster = require("cluster");
const os = require("os");

const cpus = os.cpus().length;

const port = 8080;
let requests = 0;

const index = fs.readFileSync("./index.html");

if (cluster.isMaster) {
  console.log(`Number of CPUs is ${cpus}`);
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < cpus; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log("Let's fork another worker!");
    cluster.fork();
  });
} else {
  console.log(`Worker ${process.pid} started`);

  const handler = function (req, res) {
    if (req.url == "/dstat") {
      requests++;
      res.end();
    } else {
      res.end(index);
    }
  };

  const server = http.createServer(handler);
  const wss = new WebSocket.Server({ server });

  const broadcast = function () {
    wss.clients.forEach((client) => client.send(requests));
    requests = 0;
  };

  setInterval(broadcast, 1000);

  server.listen(port);
}
