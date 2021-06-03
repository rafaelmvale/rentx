import { hash } from 'bcrypt';
import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuid } from "uuid";

import { app } from '@shared/infra/http/app';
import createConnection from "@shared/infra/typeorm";

let connection: Connection;
let adminToken: string;
describe("Create Category Controller",() => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuid();
    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, "isAdmin", create_at, driver_license)
        values('${id}', 'admin', 'admin@rentx.com.br', '${password}, true, 'now()', 'XXXXX')
      `);

    const { body: responseToken } = await request(app)
      .post('/sessions')
      .send({
        email: "admin@rentx.com",
        password: "admin",
      })
    adminToken = responseToken.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to create a new category", async () => {
    
    const response = await request(app)
    .post("/categories")
    .send({
      name: "Category Supertest",
      description: "Category Supertest",
    })
    .set({
      Authorization: `Bearer ${adminToken}`,
    });

    expect(response.status).toBe(201);
  });

  it("should not be able to create a new category with name exists", async () => {
    
    const response = await request(app)
    .post("/categories")
    .send({
      name: "Category Supertest",
      description: "Category Supertest",
    })
    .set({
      Authorization: `Bearer ${adminToken}`,
    });
    expect(response.status).toBe(400);
  });
});
