import { Request, Response } from "express";
import { BadRequestError } from "../../errors/bad-request-error";
import { DatabaseService } from "./services/database.service";
// import { PrismaClient } from "@prisma/client";
import utilHelper from "../../util/helper";

// const prisma = new PrismaClient();
import prisma from "../../lib/prisma";

const DbService = new DatabaseService();

const addItems = async (req: Request, res: Response) => {
	const { item } = req.params;
	const { quantity, expiry } = req.body;

	try {
		// Check if the expiry date is in the past
		const isExpiryValid = utilHelper.checkExpiryValidity(parseInt(expiry));

		if (!isExpiryValid) {
			throw new BadRequestError("Expiry timestamp cannot be in the past");
		}
		await DbService.addInventory(item, quantity, expiry);
		res.status(200).json({});
	} catch (error) {
		throw new BadRequestError(
			`Error adding item!! ${(error as Error).message}`,
		);
	}
};

const sellItems = async (req: Request, res: Response) => {
	const { item } = req.params;
	let { quantity } = req.body;
	quantity = Number(quantity);

	try {
		return await prisma.$transaction(async (tx) => {
			// Calculate the total non-expired quantity of the item
			const nonExpiredItem = await DbService.getNonExpiredQuantity(
				tx,
				item,
			);

			console.log("===nonExpiredItem===", nonExpiredItem);

			const nonExpiredQuantity = nonExpiredItem._sum.quantity;

			if (!nonExpiredQuantity || nonExpiredQuantity < quantity) {
				throw new BadRequestError("Not enough quantity available");
			}

			// Fetch the inventories for the item ordered by expiry
			const inventories = await DbService.findInventories(tx, item);

			let remainingQuantity = quantity;

			/** Selling should be optimized so that the maximum quantity of an item can be sold
		 across multiple sell-api calls
		Iterate through the inventories and distribute the sale quantity  */

			for (const inventory of inventories) {
				const sellQuantity = Math.min(
					remainingQuantity,
					inventory.quantity,
				);

				if (sellQuantity > 0) {
					await DbService.UpdateInventory(tx, {
						id: inventory.id,
						quantity: inventory.quantity - sellQuantity,
					});
					remainingQuantity -= sellQuantity;

					// Set expiry to null if quantity becomes 0
					if (inventory.quantity === sellQuantity) {
						await DbService.UpdateInventory(tx, {
							id: inventory.id,
							expiry: null,
						});
					}
				}

				if (remainingQuantity <= 0) {
					break; // Stop when the remaining quantity is sold
				}
			}

			res.status(200).json({});
		});
	} catch (error) {
		throw new BadRequestError(
			`Unable to sell item!! ${(error as Error).message}`,
		);
	}
};

const getNonExpiredItems = async (req: Request, res: Response) => {
	const { item } = req.params;

	try {
		return await prisma.$transaction(async (tx) => {
			// Calculate the total non-expired quantity of the item
			const nonExpiredQuantity = await DbService.getNonExpiredQuantity(
				tx,
				item,
			);

			// Calculate the maximum expiry date among non-expired inventories
			const maxExpiryDate = await DbService.findInventory(tx, {
				item,
			});

			const response = {
				quantity: nonExpiredQuantity._sum.quantity || 0,
				validTill: maxExpiryDate
					? maxExpiryDate.expiry?.getTime()
					: null,
			};

			res.status(200).json(response);
		});
	} catch (error) {
		throw new BadRequestError(
			`Error getting item quantity!! ${(error as Error).message}`,
		);
	}
};

export default {
	addItems,
	sellItems,
	getNonExpiredItems,
	prisma,
	DatabaseService,
};
