const http = require("http");
const fs = require("fs");
const WebSocket = require("ws");
const cluster = require("cluster");
const os = require("os");

const cpus = os.cpus().length;
const port = 8080;
const index = fs.readFileSync("./index.html");

if (cluster.isMaster) {
  console.log(`Number of CPUs is ${cpus}`);
  console.log(`Master ${process.pid} is running`);

  let requests = 0;
  let childs = [];
  for (let i = 0; i < cpus; i++) {
    let child = cluster.fork();
    child.on("message", (msg) => {
      requests++;
    });
    childs.push(child);
  }

  setInterval(() => {
    for (let child of childs) {
      child.send(requests);
    }
    requests = 0;
  }, 1000);
} else {
  console.log(`Worker ${process.pid} started`);

  const handler = function (req, res) {
    if (req.url == "/dstat") {
      process.send(0);
      res.end();
    } else {
      res.end(index);
    }
  };

  const server = http.createServer(handler);
  const wss = new WebSocket.Server({ server });

  process.on("message", (requests) => {
    wss.clients.forEach((client) => client.send(requests));
  });

  server.listen(port);
}
