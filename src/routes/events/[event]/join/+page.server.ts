import { error, redirect } from '@sveltejs/kit';
import { getEvent, joinEvent } from '$lib/server/event';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const eventId = parseInt(params.event, 10);
	if (isNaN(eventId)) {
		error(404, 'Event not found');
	}

	const eventData = await getEvent(eventId);

	if (!eventData) {
		error(404, 'Event not found');
	}

	if (eventData.started) {
		error(400, 'Event has already started');
	}

	return { event: eventData };
};

export const actions = {
	default: async ({ params, request, cookies }) => {
		const eventId = parseInt(params.event, 10);
		if (isNaN(eventId)) {
			error(404, 'Event not found');
		}

		const data = await request.formData();
		const name = data.get('name');

		if (typeof name !== 'string' || !name.trim()) {
			return { error: 'Player name is required' };
		}

		const eventSession = await joinEvent(eventId, name);
		if (eventSession == null) {
			error(500, 'Could not join event');
		}

		cookies.set(`event_${eventSession.eventId}_session`, eventSession.session.token, { path: '/' });

		redirect(303, `/events/${eventId}/play`);
	}
} satisfies Actions;
