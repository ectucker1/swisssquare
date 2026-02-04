import { error, redirect } from '@sveltejs/kit';
import { produce } from 'sveltekit-sse';
import {
	getEvent,
	getEventPlayers,
	getEventSession,
	joinEvent,
	joinEventAsHost
} from '$lib/server/event';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const eventId = parseInt(params.event, 10);
	if (isNaN(eventId)) {
		error(404, 'Event not found');
	}

	const eventData = await getEvent(eventId);
	if (!eventData) {
		error(404, 'Event not found');
	}

	const token = cookies.get(`event_${eventId}_session`);
	const session = await getEventSession(eventId, token);
	const players = getEventPlayers(eventId);

	return {
		event: eventData,
		session,
		players
	};
};

export const actions = {
	join: async ({ params, request, cookies }) => {
		const eventId = parseInt(params.event, 10);
		if (isNaN(eventId)) {
			error(404, 'Event not found');
		}

		const eventData = await getEvent(eventId);
		if (!eventData) {
			error(404, 'Event not found');
		}

		if (eventData.started) {
			return { error: 'Event has already started' };
		}

		const data = await request.formData();
		const name = data.get('name');

		if (typeof name !== 'string' || !name.trim()) {
			return { error: 'Player name is required' };
		}

		const token = cookies.get(`event_${eventId}_session`);
		const existingSession = await getEventSession(eventId, token);

		if (existingSession?.isHost && !existingSession.playerName) {
			joinEventAsHost(existingSession.sessionId, name);
			redirect(303, `/events/${eventId}`);
		}

		const eventSession = await joinEvent(eventId, name);
		if (eventSession == null) {
			error(500, 'Could not join event');
		}

		cookies.set(`event_${eventSession.eventId}_session`, eventSession.session.token, { path: '/' });

		redirect(303, `/events/${eventId}`);
	}
} satisfies Actions;
