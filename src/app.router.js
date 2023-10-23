import cors from "cors";
import connectDB from "../DB/connection.js";
import authRouter from "./modules/auth/auth.router.js";
import unitRouter from "./modules/unit/unit.router.js";
import buildingRouter from "./modules/building/building.router.js";
import compoundRouter from "./modules/compound/compound.router.js";
import companyRouter from "./modules/company/company.router.js";

const appRouter = (app, express) => {
  //************** CORS Policy ****************//
  app.use(cors());

  // connect DB
  connectDB();

  // parsing upcoming data before routing
  app.use(express.json());

  // Routes
  app.use("/auth", authRouter);

  app.use("/unit", unitRouter);

  app.use("/building", buildingRouter);

  app.use("/compound", compoundRouter);

  app.use("/company", companyRouter);

  // not found handler
  app.all("*", (req, res, next) => {
    return next(new Error("Page Not Found!", { cause: 404 }));
  });

  // Handling global errors
  app.use((error, req, res, next) => {
    return res.status(error.cause || 500).json({
      success: false,
      message: error.message,
      error,
      process: process.env.NODE_ENV === "dev" ? error.stack : "",
    });
  });
};

export default appRouter;
