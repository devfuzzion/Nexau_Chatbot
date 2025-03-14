import express from "express";

const app = express();

app.use(express.json());

app.get("/ping", (req, res) => {
  res.send("<h1>Pong</h1>");
});

app.get("/", (req, res) => {
  res.send("Love the rizzlicious");
});

app.listen(3000, () => {
  console.log(`Server is listening on 3000`);
});
