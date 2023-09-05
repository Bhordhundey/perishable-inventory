import { body, param } from "express-validator";


export const AddItemValidator = [
	param("item").isString().withMessage("Item must be a string"),
	body("quantity").notEmpty().withMessage("Quantity is required"),
	body("quantity")
		.isInt({ min: 1 })
		.withMessage("Quantity must be a positive integer"),
	body("expiry").notEmpty().withMessage("Expiry is required"),
	body("expiry").isNumeric().withMessage("Expiry must be a numeric value"),
];

export const SellItemValidator = [
	param("item").isString().withMessage("Item must be a string"),
	body("quantity")
		.isInt({ min: 1 })
		.withMessage("Quantity must be a positive integer"),
];

export const GetItemsValidator = [
	param("item").isString().withMessage("Item must be a string")
];
