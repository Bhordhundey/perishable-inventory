import express from "express";
import { AddItemValidator, GetItemsValidator, SellItemValidator } from "../modules/items/validationSchema/item";
import { validateRequest } from "../middlewares/validate-request";
import itemsController from "../modules/items/item.controller";

const router = express.Router();


// ADD ITEMS
router.post(
	"/:item/add",
	AddItemValidator,
	validateRequest,
	itemsController.addItems,
);

// SELL ITEMS
router.post(
	"/:item/sell",
	SellItemValidator,
	validateRequest,
	itemsController.sellItems,
);

// GET ITEMS
router.get(
	"/:item/quantity",
	GetItemsValidator,
	validateRequest,
	itemsController.getNonExpiredItems,
);


export default router;
