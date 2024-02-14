import cluster from "cluster";
import os from "os";
import express from "express";
import  { json } from "body-parser";
import "express-async-errors";
import itemRoute from "./routes/item";
import { errorHandler } from "./middlewares/error-handler";
import { NotFoundError } from "./errors/not-found-error";
import cron from "node-cron";
import clearExpiredRecords from "./modules/items/services/clearing.service";

export const app = express();
app.set("trust proxy", true);
app.use(json());

// ROUTES MIDDLEWARE
app.use("/api", itemRoute);

app.all("*", async (req, res) => {
	throw new NotFoundError();
});

app.use(errorHandler);

const numCPUs = os.cpus().length;

// Handle high concurrency
if (cluster.isPrimary) {
	// Fork workers for each CPU core
	for (let i = 0; i < numCPUs; i++) {
		cluster.fork();
	}

	cluster.on("exit", (worker, code, signal) => {
		console.log(`Worker ${worker.process.pid} died`);
	});
} else {

const port = process.env.PORT || 3000;
	app.listen(port, () => {
		console.log(`Server is listening on port ${port}`);
	});
}

// Schedule the clearing function to run daily at midnight
cron.schedule(
	"0 1 * * *",
	clearExpiredRecords,
	{
		scheduled: true,
		timezone: "Europe/London",
	},
);
