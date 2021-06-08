import { ICreateUserDTO } from "@modules/accounts/dtos/ICreateUserDTO";
import { UsersRepositoryInMemory } from "@modules/accounts/repositories/in-memory/UsersRepositoryInMemory";
import { AppError } from "@shared/errors/AppError";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";

import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";


let authenticateUsersUseCase: AuthenticateUserUseCase;
let usersRepositoryInMemory: UsersRepositoryInMemory;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    authenticateUsersUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory);
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);

  });
  it("should be able to authenticate an user", async () => {
    const user: ICreateUserDTO = {
      driver_license: "000123",
      email: "user@teste.com",
      password: "1234",
      name: "User Test"
    };
    await createUserUseCase.execute(user);

    const result = await authenticateUsersUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(result).toHaveProperty("token");

  });
  it("should not be able to authenticate a nonexisting user", async () => {
    await expect(authenticateUsersUseCase.execute({
      email: "false@email.com",
      password: "11234",
    })
    ).rejects.toEqual(new AppError("Email or password incorrect!"))
  });
  it("should not be able to authenticate with incorrect password", async () => {
    const user: ICreateUserDTO = {
      driver_license: "9999",
      email: "user@user.com",
      password: "1234",
      name: "User Test Error"
    }

    await createUserUseCase.execute(user);


    await expect(authenticateUsersUseCase.execute({
      email: user.email,
      password: "incorrectPassword",
    })
    ).rejects.toEqual(new AppError("Email or password incorrect!"))
  })
});