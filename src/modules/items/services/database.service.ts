import { Prisma, PrismaClient } from "@prisma/client";
import { Item, UpdateItem } from "../dtos/item.dto";
import { BadRequestError } from "../../../errors/bad-request-error";

export class DatabaseService {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = new PrismaClient();
	}

	async addInventory(
		item: string,
		quantity: number,
		expiry: string,
	): Promise<Item> {
		const expiryDate = new Date(parseInt(expiry));

		const itemData = await this.prisma.inventory.create({
			data: {
				item: item.toLowerCase(),
				quantity: Number(quantity),
				expiry: expiryDate,
			},
		});
		return itemData;
	}

	async getNonExpiredQuantity(tx: Prisma.TransactionClient, item: string) {
		try {
				// Lock the rows for the specified item and filter by expiry date
				const nonExpiredQuantity = await tx.inventory.aggregate({
					where: {
						item,
						expiry: { gte: new Date() }, // Expiry not reached yet
					},
					_sum: { quantity: true },
				});
				return nonExpiredQuantity;
		} catch (err) {
			// Handle the rollback...
			throw new BadRequestError("Unable to fetch items. Please try again");
		}
	}

	async findInventories(tx: any, item: string) {
		const inventories = await tx.inventory.findMany({
			where: {
				item,
				expiry: { gte: new Date() }, // Expiry not reached yet
			},
			orderBy: { expiry: "asc" },
		});
		console.log("===inventories===", inventories);
		
		return inventories;
	}

	async UpdateInventory(tx: Prisma.TransactionClient, data: UpdateItem) {
		try {
			const inventory = await tx.inventory.update({
				where: { id: data.id },
				data: { quantity: data.quantity, expiry: data.expiry },
			});
			return inventory;
		} catch (err) {
			// Handle the rollback...
			throw new BadRequestError("Unable to sell item. Please try again");
		}
	}

	async findInventory(tx: Prisma.TransactionClient, data: UpdateItem) {
		const inventory = await tx.inventory.findFirst({
			where: {
				item: data.item,
				expiry: { gte: new Date() },
			},
			orderBy: { expiry: "asc" },
			select: { expiry: true },
		});
		return inventory;
	}
}
