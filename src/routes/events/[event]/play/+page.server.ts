import { error } from '@sveltejs/kit';
import { getEvent } from '$lib/server/event';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const eventId = parseInt(params.event, 10);
	if (isNaN(eventId)) {
		error(404, 'Event not found');
	}

	const eventData = await getEvent(eventId);

	if (!eventData) {
		error(404, 'Event not found');
	}

	return { event: eventData };
};
