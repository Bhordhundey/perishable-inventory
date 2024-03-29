// Date to Epoch Converter
const epochConverter = (date: string) => {
	return Date.parse(date);
}

// Check for expiry timestamp
const checkExpiryValidity = (timestamp: number) => {
	const currentDate = new Date();
	const expiryDate = new Date(timestamp);
	return currentDate.getTime() < expiryDate.getTime();
}

export default {
	epochConverter,
	checkExpiryValidity,
};