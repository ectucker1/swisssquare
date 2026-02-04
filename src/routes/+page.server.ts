import { error, redirect } from '@sveltejs/kit';
import { createEvent, listEvents } from '$lib/server/event';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const availableEvents = listEvents();
	return { availableEvents };
};

export const actions = {
	host: async ({ request, cookies }) => {
		const data = await request.formData();
		const name = data.get('name');
		const format = data.get('format');

		if (typeof name !== 'string' || !name.trim()) {
			return { error: 'Event name is required' };
		}
		if (typeof format !== 'string' || !format.trim()) {
			return { error: 'Format is required' };
		}

		const eventSession = await createEvent(name, format);
		if (eventSession == null) {
			error(500, 'Could not create event');
		}

		cookies.set(`event_${eventSession.eventId}_session`, eventSession.session.token, { path: '/' });

		redirect(303, `events/${eventSession.eventId}/manage`);
	}
} satisfies Actions;
