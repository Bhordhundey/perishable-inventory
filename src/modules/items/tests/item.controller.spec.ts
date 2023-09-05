// test/item.test.ts
import request from "supertest";
import { expect } from "chai";
import { app } from "../../../index";
import { prismaMock, PrismaClientMock } from "../../../tests/testHelper";

import proxyquire from "proxyquire";

proxyquire("../../../index", {
	"@prisma/client": { PrismaClient: PrismaClientMock },
});


describe("Adding a Single Item", () => {
	it("should add a single item", async () => {
		prismaMock.inventory.createMany.resolves({});

		const itemData = {
			quantity: 10,
			expiry: Date.now() + 86400000, // Expiry for 1 day from now
		};

		const response = await request(app)
			.post("/api/stocks/add")
			.send(itemData);

		expect(response.status).to.equal(200);
		expect(response.body).to.deep.equal({});
	});

	it("should handle validation errors", async () => {
		const invalidItemData = {
			quantity: -5,
			expiry: "invalid", // Invalid expiry value
		};

		const response = await request(app)
			.post("/api/shoes/add")
			.send(invalidItemData);

		expect(response.status).to.equal(400);
	});

	it("should handle validation errors if empty body", async () => {
		const response = await request(app).post("/api/shoes/add").send({});
		expect(response.status).to.equal(400);
		expect(response.body.errors.length).to.equal(4);
	});

	it("should handle not found route", async () => {
		const response = await request(app)
			.post("/api/add") // Invalid route
			.send({});

		expect(response.status).to.equal(404);
		expect(response.body.errors[0].message).to.equal("Route Not Found");
	});
});

// describe("Selling inventorys", () => {
// 	it("should sell inventorys", async () => {
// 		let expiredDate = new Date();

// 		// add a day
// 		expiredDate.setDate(expiredDate.getDate() + 1);
// 		console.log("====expiredDate===", expiredDate);
		
// 		prismaMock.inventory.findMany.resolves([
// 			// Mock data for available inventorys
// 			{
// 				id: 1,
// 				name: "item1",
// 				quantity: 10,
// 				expiry: new Date(expiredDate),
// 			},
// 			{
// 				id: 2,
// 				name: "item2",
// 				quantity: 5,
// 				expiry: new Date(expiredDate),
// 			},
// 		]);
// 		prismaMock.inventory.update.resolves({}); // Mock successful update

// 		const saleData = {
// 			quantity: 10,
// 		};

// 		const response = await request(app).post("/api/item1/sell").send(saleData);
// 		// console.log("===response===", response);
		

// 		expect(response.status).to.equal(200);
// 		expect(prismaMock.inventory.findMany.calledOnce).to.be.true;
// 		expect(prismaMock.inventory.update.calledTwice).to.be.true;
// 	});

// 	it("should handle insufficient quantity", async () => {
// 		prismaMock.inventory.findMany.resolves([
// 			// Mock data for available inventorys
// 			{ id: 1, item: "item1", quantity: 5, expiry: new Date() },
// 		]);

// 		const invalidSaleData = {
// 			quantity: 10,
// 		};

// 		const response = await request(app)
// 			.post("/api/item1/sell")
// 			.send(invalidSaleData);

// 		expect(response.status).to.equal(400);
// 		// ... Other assertions ...
// 	});
// });

// describe("Getting Non-Expired Items", () => {
// 	it("should get non-expired items", async () => {
// 		prismaMock.inventory.aggregate.resolves({ sum: 15 }); // Mock total quantity

// 		const response = await request(app).get("/api/bags/quantity").query({});

// 		expect(response.status).to.equal(200);
// 		expect(response.body).to.have.property("quantity", 15);
// 		expect(prismaMock.inventory.aggregate.calledOnce).to.be.true;
// 	});

// 	it("should handle non-existing item", async () => {
// 		prismaMock.inventory.aggregate.resolves({ sum: 0 }); // Mock total quantity

// 		const response = await request(app).get("/api/bags/quantity").query({});

// 		expect(response.status).to.equal(404);
// 		// ... Other assertions ...
// 	});
// });