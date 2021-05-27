import { CreateCarController } from "@modules/cars/useCases/createCar/CreateCarController";
import { Router } from "express";
import { ensureAdmin } from "../middlewares/ensureAdmin";
import { ensureAuthenticate } from "../middlewares/ensureAuthenticate";


const carsRoutes = Router();

const createCarController = new CreateCarController();

carsRoutes.post("/",
  ensureAuthenticate,
  ensureAdmin,
  createCarController.handle);

export { carsRoutes }