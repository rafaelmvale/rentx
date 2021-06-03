import { hash } from 'bcrypt';
import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuid } from "uuid";

import { app } from '@shared/infra/http/app';
import createConnection from "@shared/infra/typeorm";

let connection: Connection;
let adminToken: string;

describe("List Categories Controller", () => {
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

    await request(app)
      .post("/categories")
      .send({
        name: "Automated Windows",
        description: "Windows rols down or up with a click of a button",
      })
      .set({
        Authorization: `Bearer ${adminToken}`,
      });

    await request(app)
      .post("/categories")
      .send({
        name: "manual shift",
        description: "Manual Shifit for more control of the car",
      })
      .set({
        Authorization: `Bearer ${adminToken}`,
      });
    await request(app)
      .post("/categories")
      .send({
        name: "Four doors",
        description: "Cars have four doors",
      })
      .set({
        Authorization: `Bearer ${adminToken}`,
      });

  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to list all categories", async () => {
    const response = await request(app)
      .post("/categories")
    console.log(response.body);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(3);
  });
});
