// test/mockPrisma.ts
import sinon from "sinon";

const prismaMock = {
	inventory: {
		findMany: sinon.stub(),
		createMany: sinon.stub(),
		update: sinon.stub(),
		deleteMany: sinon.stub(),
		aggregate: sinon.stub(),
	},
};

const PrismaClientMock = sinon.stub().returns(prismaMock);

const resetStubAndSpys = (stubsAndSpysArray: any[]) => {
	stubsAndSpysArray.forEach(function (element) {
		try {
			element.restore();
		} catch (error) {}
	}, this);
};

export { resetStubAndSpys, prismaMock, PrismaClientMock };
