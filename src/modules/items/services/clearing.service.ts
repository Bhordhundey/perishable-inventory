import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearExpiredRecords() {
  try {
    const currentDate = new Date();
    await prisma.inventory.deleteMany({
      where: {
        OR: [
          {
            expiry: {
              lt: currentDate,
            },
          },
          {
            expiry: null,
          },
        ],
      },
    });
    console.log('Expired records and records with null expiry cleared');
  } catch (error) {
    console.error('Error clearing records:', error);
  }
}

export default clearExpiredRecords;





