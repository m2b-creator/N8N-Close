import { evaluateCustomActivityWebhook } from '../CloseTrigger.node';

describe('CloseTrigger custom activity submit filtering', () => {
	it('suppresses draft update events', () => {
		const result = evaluateCustomActivityWebhook({
			event: 'activity.custom_activity.updated',
			data: {
				id: 'acti_123',
				status: 'draft',
			},
		});

		expect(result.shouldEmit).toBe(false);
	});

	it('emits on draft to published transition', () => {
		const result = evaluateCustomActivityWebhook({
			event: 'activity.custom_activity.updated',
			data: {
				id: 'acti_123',
				status: 'published',
				old_status: 'draft',
			},
		});

		expect(result.shouldEmit).toBe(true);
	});

	it('emits for created event already published', () => {
		const result = evaluateCustomActivityWebhook({
			event: 'activity.custom_activity.created',
			data: {
				id: 'acti_123',
				status: 'published',
			},
		});

		expect(result.shouldEmit).toBe(true);
	});

	it('suppresses published to published updates', () => {
		const result = evaluateCustomActivityWebhook(
			{
				event: 'activity.custom_activity.updated',
				data: {
					id: 'acti_123',
					status: 'published',
				},
			},
			'published',
		);

		expect(result.shouldEmit).toBe(false);
	});
});
