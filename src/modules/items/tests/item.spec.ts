import request from "supertest";
import { app } from "../../../index"; 
import * as assert from "assert";


describe("Handle non existing route", () => {
	it("should handle not found route", async () => {
		const response = await request(app)
			.post("/api/add") // Invalid route
			.send({});

		assert.deepStrictEqual(response.status, 404);
		assert
			.deepStrictEqual(response.body.errors[0].message,
			"Route Not Found");
	});
});


describe("Adding a Single Item", () => {
	it("should add a single item", async () => {
		const itemData = {
			quantity: 10,
			expiry: 600000, // Expiry for 1 day from now
		};

		const response = await request(app).post("/api/salt/add").send(itemData);


		assert.deepStrictEqual(response.status, 200);
		assert.deepStrictEqual(response.body, {});
	});

	it("should handle validation errors", async () => {
		const invalidItemData = {
			quantity: -5,
			expiry: "invalid", // Invalid expiry value
		};

		const response = await request(app)
			.post("/api/salt/add")
			.send(invalidItemData);

			assert.deepStrictEqual(
				response.statusCode,
				400,
			);
			assert.ok(Object.keys(response.body.errors.length).length = 2);
	});
});

describe("Selling an Item", () => {
	it("should sell an item", async () => {
		// Assuming there's an item with enough quantity in the inventory
		const saleData = {
			quantity: 5,
		};

		const response = await request(app).post("/api/salt/sell").send(saleData);

		assert.deepStrictEqual(response.status, 200);
		assert.deepStrictEqual(response.body, {});
	});

	it("should handle insufficient quantity", async () => {
		// Assuming there's not enough quantity to sell
		const invalidSaleData = {
			quantity: 15,
		};

		const response = await request(app)
			.post("/api/salt/sell")
			.send(invalidSaleData);

		assert.deepStrictEqual(response.status, 400);
		assert
			.deepStrictEqual(response.body.errors[0].message,
			"Not enough quantity available");
	});
});


describe("Getting Non-Expired Quantity of an Item", () => {
	it("should get non-expired quantity of an item", async () => {
		// Assuming there are non-expired inventory for the item
		const response = await request(app).get("/api/salt/quantity");

		assert.deepStrictEqual(response.status, 200);
		assert.ok("quantity" in response.body);
		assert.ok("validTill" in response.body);
	});

	it("should handle non-existing item", async () => {
		// Assuming the item doesn't exist in the system
		const response = await request(app).get("/api/pencilll/quantity");
		assert.deepStrictEqual(response.status, 200);
		assert.deepStrictEqual(response.body.quantity, 0);
		assert.deepStrictEqual(response.body.validTill, null);
	});
});