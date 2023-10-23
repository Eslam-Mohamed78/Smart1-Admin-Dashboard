import express from "express";
import dotenv from "dotenv";
import appRouter from "./src/app.router.js";
dotenv.config();

const app = express();
const port = process.env.PORT;

appRouter(app, express);

app.listen(port, () => console.log(`Server listening on port ${port}`));
