export interface Item {
	id?: string;
	item: string;
	quantity: number;
	expiry: Date | null;
}

export interface UpdateItem {
	id?: string;
	item?: string;
	quantity?: number;
	expiry?: Date | null;
}
