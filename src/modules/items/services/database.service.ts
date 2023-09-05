import { PrismaClient } from "@prisma/client";
import { Item, UpdateItem } from "../dtos/item.dto";

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
	
		const expiryDate = new Date(Date.now() + parseInt(expiry));

		const itemData = await this.prisma.inventory.create({
			data: {
				item: item.toLowerCase(),
				quantity: Number(quantity),
				expiry: expiryDate,
			},
		});
		return itemData;
	}

	async sellInventory(item: string) {
		const items = await this.prisma.inventory.aggregate({
			where: {
				item,
				expiry: { gte: new Date() }, // Expiry not reached yet
			},
			_sum: { quantity: true },
		});

		return items;
	}

	async getNonExpiredQuantity(item: string) {
		const nonExpiredQuantity = await this.prisma.inventory.aggregate({
			where: {
				item,
				expiry: { gte: new Date() }, // Expiry not reached yet
			},
			_sum: { quantity: true },
		});
		return nonExpiredQuantity;
	}

	async findInventories(item: string) {
		const inventories = await this.prisma.inventory.findMany({
			where: {
				item,
				expiry: { gte: new Date() }, // Expiry not reached yet
			},
			orderBy: { expiry: "asc" },
		});
		return inventories;
	}

	async UpdateInventory(data: UpdateItem) {
		const inventory = await this.prisma.inventory.update({
			where: { id: data.id },
			data: { quantity: data.quantity, expiry: data.expiry },
		});
		return inventory;
	}

	async findInventory(data: UpdateItem) {
		const inventory = await this.prisma.inventory.findFirst({
			where: {
				item: data.item,
				expiry: { gte: new Date() },
			},
			orderBy: { expiry: "desc" },
			select: { expiry: true },
		});
		return inventory;
	}
}
