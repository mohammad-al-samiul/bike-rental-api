import express, { Request, Response } from "express";
import cors from "cors";
import router from "./app/routes";

import notFound from "./app/middleware/notFound";
const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use(notFound);

export default app;
