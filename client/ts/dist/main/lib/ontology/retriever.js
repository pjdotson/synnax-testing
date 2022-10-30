"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const payload_1 = require("./payload");
const requestSchema = zod_1.z.object({
    ids: zod_1.z.string().array(),
    children: zod_1.z.boolean().optional(),
    parents: zod_1.z.boolean().optional(),
});
const responseSchema = zod_1.z.object({
    resources: payload_1.ontologyResourceSchema.array(),
});
class Retriever {
    constructor(transport) {
        this.client = transport.getClient();
    }
    async execute(request) {
        const [res, err] = await this.client.send(Retriever.ENDPOINT, request, responseSchema);
        if (err)
            throw err;
        return res === null || res === void 0 ? void 0 : res.resources;
    }
    async retrieve(id) {
        return (await this.execute({ ids: [id.toString()] }))[0];
    }
    async retrieveMany(...ids) {
        return await this.execute({ ids: ids.map((id) => id.toString()) });
    }
    async retrieveChildren(...ids) {
        return await this.execute({
            ids: ids.map((id) => id.toString()),
            children: true,
        });
    }
    async retrieveParents(...ids) {
        return await this.execute({
            ids: ids.map((id) => id.toString()),
            parents: true,
        });
    }
}
exports.default = Retriever;
Retriever.ENDPOINT = '/ontology/retrieve';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmV0cmlldmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9vbnRvbG9neS9yZXRyaWV2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSw2QkFBd0I7QUFFeEIsdUNBSW1CO0FBRW5CLE1BQU0sYUFBYSxHQUFHLE9BQUMsQ0FBQyxNQUFNLENBQUM7SUFDN0IsR0FBRyxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUU7SUFDdkIsUUFBUSxFQUFFLE9BQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDaEMsT0FBTyxFQUFFLE9BQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLEVBQUU7Q0FDaEMsQ0FBQyxDQUFDO0FBSUgsTUFBTSxjQUFjLEdBQUcsT0FBQyxDQUFDLE1BQU0sQ0FBQztJQUM5QixTQUFTLEVBQUUsZ0NBQXNCLENBQUMsS0FBSyxFQUFFO0NBQzFDLENBQUMsQ0FBQztBQUVILE1BQXFCLFNBQVM7SUFJNUIsWUFBWSxTQUFvQjtRQUM5QixJQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUN0QyxDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtRQUM1QixNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQ3ZDLFNBQVMsQ0FBQyxRQUFRLEVBQ2xCLE9BQU8sRUFDUCxjQUFjLENBQ2YsQ0FBQztRQUNGLElBQUksR0FBRztZQUFFLE1BQU0sR0FBRyxDQUFDO1FBQ25CLE9BQU8sR0FBRyxhQUFILEdBQUcsdUJBQUgsR0FBRyxDQUFFLFNBQStCLENBQUM7SUFDOUMsQ0FBQztJQUVELEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBYztRQUMzQixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVELEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBRyxHQUFpQjtRQUNyQyxPQUFPLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckUsQ0FBQztJQUVELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEdBQWlCO1FBQ3pDLE9BQU8sTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ3hCLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDbkMsUUFBUSxFQUFFLElBQUk7U0FDZixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLGVBQWUsQ0FBQyxHQUFHLEdBQWlCO1FBQ3hDLE9BQU8sTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ3hCLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDbkMsT0FBTyxFQUFFLElBQUk7U0FDZCxDQUFDLENBQUM7SUFDTCxDQUFDOztBQXRDSCw0QkF1Q0M7QUF0Q2dCLGtCQUFRLEdBQUcsb0JBQW9CLENBQUMifQ==