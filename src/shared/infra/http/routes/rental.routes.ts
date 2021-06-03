import { Router } from "express";

import { CreateRentalcontroller } from "@modules/rentals/useCases/createRental/CreateRentalController";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";


const rentalRoutes = Router();

const createRentalController = new CreateRentalcontroller();

rentalRoutes.post("/", ensureAuthenticated, createRentalController.handle);

export { rentalRoutes }