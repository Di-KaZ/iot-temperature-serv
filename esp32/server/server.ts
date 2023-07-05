import express from "express";
import bodyParser from "body-parser";
import { Request, Response } from "express";

const app = express();
app.use(bodyParser.json());
const port = 3000;

// difine a post route that get a payload in form {"freq": 5, "interval": 30, "temps": [55, 65, 23]}
app.get("/api/esp32/config", (req: Request, res: Response) => {
  console.log("requested config");
  res.send({ freq: 5, interval: 30 });
});

app.post("/api/esp32/send", (req: Request, res: Response) => {
  console.log(req.body);
  res.send({ status: "ok" });
});

app.listen(port, () => {
  console.log(`ESP32 temprature server listening at http://localhost:${port}`);
});
