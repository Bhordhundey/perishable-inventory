import assert from "assert";
import sinon from "sinon";
import { describe, it, vi, expect } from "vitest";
import { BadRequestError } from "../../../errors/bad-request-error";
import itemController from "../item.controller";
import utilHelper from "../../../util/helper";
import prisma from "../../../lib/__mocks__/prisma";
import { DatabaseService } from "../services/database.service";
import helper from "../../../util/helper";

const DbService = new DatabaseService();

describe("Item Controller", () => {
	// // Test For expiry timestamp
	it("should check for expiry timestamp", () => {
		const timestamp = 1632048000000; // 19th September 2021
		const result = utilHelper.checkExpiryValidity(timestamp);
		expect(result).toBe(false);
	});

	//Test For epoch converter
	it("should convert date to epoch", () => {
		const date = "2021-09-20";
		const result = utilHelper.epochConverter(date);
		expect(result).toBe(1632096000000);
	});

	it("should fail due to invalid date", async () => {
		// Arrange
		const req: any = {
			params: { item: "example" },
			body: { quantity: 5, expiry: "invalid-date" },
		};
		const res: any = {
			status: sinon.stub().returns({ json: sinon.stub() }),
		};

		// Act & Assert
		await assert.rejects(async () => {
			await itemController.addItems(req, res);
		}, BadRequestError);
	});

	it("should add inventory", async () => {
		const item = "salt";
		const quantity = 10;
		const expiry = helper.epochConverter(
			addDays(new Date(), 10).toString(),
		);
		const mockResponse = {
			created_at: new Date(),
			expiry: new Date(expiry),
			id: "500826d4-bf20-40c4-afea-a6c33c308aa0",
			item: "salt",
			quantity: 10,
			updated_at: new Date(),
		};

		prisma.inventory.create.mockResolvedValue(mockResponse);
		prisma.$transaction.mockImplementation((callback) => callback(prisma));

		const result = await prisma.inventory.create({
			data: {
				item: item.toLowerCase(),
				quantity: Number(quantity),
				expiry: new Date(parseInt(expiry.toString())),
			},
		});

		expect(result).not.toBe(undefined);
		expect(result.item).toBe("salt");
		expect(result.quantity).toBe(10);
		expect(result.expiry).toBeInstanceOf(Date);
		expect(result.id).toBeTypeOf("string");
	});

	it("getNonExpiredQuantity returns aggregated quantity", async () => {
		const mockNonExpiredQuantity: any = {
			_sum: { quantity: 10 },
		};

		prisma.$transaction.mockResolvedValueOnce(mockNonExpiredQuantity);

		prisma.inventory.aggregate.mockResolvedValueOnce(
			mockNonExpiredQuantity,
		);

		const inventories = await DbService.getNonExpiredQuantity(
			prisma,
			"ups",
		);
		expect(inventories).toStrictEqual({
			_sum: { quantity: 10 },
		});
	});

	it("Fetch Inventories", async () => {
		const mockInventories = {
			id: '6c9d61d6-08ad-4cfe-a54e-6d4a376737f6',
			item: 'ups',
			quantity: 10,
			expiry: addDays(new Date(), 10),
			created_at: new Date(),
			updated_at: new Date()
		};
		prisma.$transaction.mockResolvedValueOnce(mockInventories);

		prisma.inventory.findMany.mockResolvedValueOnce([mockInventories]);

		const inventories = await DbService.findInventories(prisma, "ups");
		expect(inventories).toStrictEqual([mockInventories]);
	});
});


function addDays(theDate: Date, days: number) {
	return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
}