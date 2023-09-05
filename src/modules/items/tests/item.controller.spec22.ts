const request = require("supertest");
const { expect } = require("chai");
const sinon = require("sinon");
const httpMocks = require("node-mocks-http");
import { resetStubAndSpys } from "../../../tests/testHelper";

import * as assert from "assert";
import itemController from "../item.controller";
const { app } = require("../../../index"); // Import your Express app instance

describe("Adding a Single Item", () => {
	  const sandBox = sinon.createSandbox();
		afterEach(() => {
			resetStubAndSpys([sandBox]);
		});
		beforeEach(() => {
			resetStubAndSpys([sandBox]);
		});

	it("should handle validation errors if empty body", async () => {
		// const itemData = {
		// 	quantity: 10,
		// 	expiry: Date.now() + 86400000, // Expiry for 1 day from now
		// };
		// const req = { body: {}, params: {item: "clothes"} };
		// console.log("===request===", req);

		// const response = httpMocks.createResponse();
		// console.log("===response===", response);

		// itemController.addItems(req, response);
		//     assert.deepStrictEqual(
		// 		response.statusCode,
		// 		400,
		// 	);

		const response = await request(app).post("/api/shoes/add").send({});

		expect(response.status).to.equal(400);
		expect(response.body.errors.length).to.equal(4);
	});

	it("should handle validation errors for invalid request", async () => {
		const invalidItemData = {
			quantity: -5,
			expiry: "invalid", // Invalid expiry value
		};

		const response = await request(app)
			.post("/api/shoes/add")
			.send(invalidItemData);

		expect(response.status).to.equal(400);
		expect(response.body.errors.length).to.equal(2); // Assuming 2 validation errors
	});

	it("Add Items", async () => {
		const itemData = {
			quantity: 10,
			expiry: Date.now() + 86400000, // Expiry for 1 day from now
		};
		const request = { body: itemData, params: { item: "pigs" } };

		const response = httpMocks.createResponse();
		sandBox
			.stub(itemController, "addItems")
			.resolves(itemData);

		await itemController.addItems(request, response);
		// console.log("===_getJSONData===", response._getJSONData());
		const responseData = response._getData();
		assert.deepStrictEqual(response.statusCode, 200);

		console.log("===get===", response._getData());

		//  assert.deepStrictEqual(response.body, {});
	});
});
