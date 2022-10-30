import test from 'ava';
import { newClient } from '../../setupspecs';
import { QueryError } from '../errors';
import { DataType, Rate } from '../telem';
const client = newClient();
test('Channel - create', async (t) => {
    const channel = await client.channel.create({
        name: 'test',
        nodeId: 1,
        rate: Rate.Hz(1),
        dataType: DataType.Float32,
    });
    t.is(channel.name, 'test');
    t.is(channel.nodeId, 1);
    t.deepEqual(channel.rate, Rate.Hz(1));
    t.deepEqual(channel.dataType, DataType.Float32);
});
test('Channel - retrieve by key', async (t) => {
    const channel = await client.channel.create({
        name: 'test',
        nodeId: 1,
        rate: Rate.Hz(1),
        dataType: DataType.Float32,
    });
    const retrieved = (await client.channel.retrieveByKeys(channel.key))[0];
    t.is(retrieved.name, 'test');
    t.is(retrieved.nodeId, 1);
    t.deepEqual(retrieved.rate, Rate.Hz(1));
    t.deepEqual(retrieved.dataType, DataType.Float32);
});
test('Channel - retrieve by key - not found', async (t) => {
    const err = await t.throwsAsync(async () => {
        await client.channel.retrieveByKeys('1-1000');
    });
    t.true(err instanceof QueryError);
});
test('Channel - retrieve by node id', async (t) => {
    const retrieved = await client.channel.retrieveByNodeId(1);
    t.true(retrieved.length > 0);
    retrieved.forEach((ch) => {
        t.is(ch.nodeId, 1);
    });
});
test('Channel - retrieve by name', async (t) => {
    const retrieved = await client.channel.retrieveByNames("test");
    t.true(retrieved.length > 0);
    retrieved.forEach((ch) => {
        t.is(ch.name, "test");
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbm5lbC5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9jaGFubmVsL2NoYW5uZWwuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLElBQUksTUFBTSxLQUFLLENBQUM7QUFFdkIsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDdkMsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFMUMsTUFBTSxNQUFNLEdBQUcsU0FBUyxFQUFFLENBQUM7QUFFM0IsSUFBSSxDQUFDLGtCQUFrQixFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRTtJQUNuQyxNQUFNLE9BQU8sR0FBRyxNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQzFDLElBQUksRUFBRSxNQUFNO1FBQ1osTUFBTSxFQUFFLENBQUM7UUFDVCxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEIsUUFBUSxFQUFFLFFBQVEsQ0FBQyxPQUFPO0tBQzNCLENBQUMsQ0FBQztJQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMzQixDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDeEIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN0QyxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2xELENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLDJCQUEyQixF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