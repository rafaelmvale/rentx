import dayjs from "dayjs";

import { RentalsRepositoryInMemory } from "@modules/rentals/repositories/In-memory/RentalsRepositoryInMemory";
import { CarsRepositoryInMemory } from "@modules/cars/repositories/In-memory/CarsRepositoryInMemory";
import { CreateRentalUseCase } from "./CreateRentalUseCase";

import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";
import { AppError } from "@shared/errors/AppError";

let createRentalUseCase: CreateRentalUseCase;
let rentalsRepositoryInMemory: RentalsRepositoryInMemory;
let carsRepositoryInMemory: CarsRepositoryInMemory;
let dayjsDateProvider: DayjsDateProvider;

describe("Create Rental", () => {
  const dayAdd24Hours = dayjs().add(1, "day").toDate();

  beforeEach(() => {
    rentalsRepositoryInMemory = new RentalsRepositoryInMemory();
    carsRepositoryInMemory = new CarsRepositoryInMemory();
    dayjsDateProvider = new DayjsDateProvider()
    createRentalUseCase = new CreateRentalUseCase(
      rentalsRepositoryInMemory,
      dayjsDateProvider,
      carsRepositoryInMemory
    );
  });

  it("should be able to create a new Rental", async () => {
    const car = await carsRepositoryInMemory.create({
      name: "test",
      description: "Car Test",
      daily_rate: 100,
      license_plate: "test",
      fine_amount: 40,
      category_id: "123400",
      brand: "brand"
    });
    const rental = await createRentalUseCase.execute({
      user_id: "123456",
      car_id: car.id,
      expected_return_date: dayAdd24Hours,
    });

    expect(rental).toHaveProperty("id");
    expect(rental).toHaveProperty("start_date");
  });

  it("should not be able to create a new Rental if there is another open to the same user", async () => {
    await rentalsRepositoryInMemory.create({
      car_id: "123123151",
      expected_return_date: dayAdd24Hours,
      user_id: "123456",

    })
    expect(createRentalUseCase.execute({
      user_id: "123456",
      car_id: "123123",
      expected_return_date: dayAdd24Hours,
    })
    ).rejects.toEqual(new AppError("There´s a rental in progress for user!"));
  });

  it("should not be able to create a new Rental if there is another open to the same car", async () => {
    await rentalsRepositoryInMemory.create({
      car_id: "123123151",
      expected_return_date: dayAdd24Hours,
      user_id: "123456",

    })
    expect(createRentalUseCase.execute({
      user_id: "654321",
      car_id: "123123",
      expected_return_date: dayAdd24Hours,
    })
    ).rejects.toEqual(new AppError("Car is unavailable"));
  });

  it("should not be able to create a new Rental with invalid return time", async () => {
    expect(createRentalUseCase.execute({
      user_id: "123456",
      car_id: "123123",
      expected_return_date: dayjs().toDate(),
    })).rejects.toEqual(new AppError("Invalid return time!"));
  });
});
