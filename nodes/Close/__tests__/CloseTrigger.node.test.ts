import { evaluateCustomActivityWebhook } from '../CloseTrigger.node';

describe('CloseTrigger custom activity submit filtering', () => {
	it('suppresses draft update events for nested event payload format', () => {
		const result = evaluateCustomActivityWebhook({
			event: {
				object_type: 'activity.custom_activity',
				action: 'updated',
				data: {
					id: 'acti_123',
					status: 'draft',
				},
				previous_data: {
					status: 'draft',
				},
			},
		});

		expect(result.shouldEmit).toBe(false);
	});

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
			event: {
				object_type: 'activity.custom_activity',
				action: 'updated',
				data: {
					id: 'acti_123',
					status: 'published',
				},
				previous_data: {
					status: 'draft',
				},
			},
		});

		expect(result.shouldEmit).toBe(true);
	});

	it('emits for created event already published', () => {
		const result = evaluateCustomActivityWebhook({
			event: 'custom_activity.created',
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

	it('suppresses custom_activity created draft', () => {
		const result = evaluateCustomActivityWebhook({
			event: {
				object_type: 'activity.custom_activity',
				action: 'created',
				data: {
					id: 'acti_123',
					status: 'draft',
				},
			},
		});

		expect(result.shouldEmit).toBe(false);
	});
});
