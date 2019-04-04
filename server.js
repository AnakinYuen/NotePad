const express = require("express");
const expressStaticGzip = require("express-static-gzip");
const path = require("path");

const app = express();
app.use(
  expressStaticGzip(path.join(__dirname, "dist"), {
    enableBrotli: true
  })
);

const port = process.env.PORT || 80;
app.listen(port);
