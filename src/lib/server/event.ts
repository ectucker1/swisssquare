import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { events, eventJoins, eventSessions } from '$lib/server/db/schema';
import { createSession, type SessionWithToken } from '$lib/server/session';

export type EventId = number;

interface EventSessionWithToken {
	session: SessionWithToken;
	eventId: EventId;
}

export async function createEvent(
	name: string,
	format: string
): Promise<EventSessionWithToken | null> {
	let eventId: number | null = null;

	const storeSession = async (session: SessionWithToken) => {
		// TECHDEBT - It would be nice to make this transaction async,
		// but it's blocked on https://github.com/drizzle-team/drizzle-orm/issues/2275
		eventId = db.transaction((tx) => {
			const [event] = tx
				.insert(events)
				.values({ name: name.trim(), format: format.trim() })
				.returning({ eventId: events.eventId })
				.all();
			tx.insert(eventSessions)
				.values({
					eventSessionId: session.id,
					eventId: event!.eventId,
					secretHash: session.secretHash,
					host: true
				})
				.run();
			return event.eventId;
		});
		return session;
	};

	const session = await createSession(storeSession);
	if (session == null) {
		return null;
	}
	if (eventId == null) {
		return null;
	}

	return { session: session, eventId: eventId };
}

export async function joinEvent(
	eventId: EventId,
	name: string
): Promise<EventSessionWithToken | null> {
	const storeSession = async (session: SessionWithToken) => {
		db.transaction((tx) => {
			tx.insert(eventSessions)
				.values({
					eventSessionId: session.id,
					eventId: eventId,
					secretHash: session.secretHash,
					host: false
				})
				.run();
			tx.insert(eventJoins)
				.values({
					eventSessionId: session.id,
					playerName: name
				})
				.run();
			return null;
		});

		return session;
	};

	const session = await createSession(storeSession);
	if (session == null) {
		return null;
	}

	return { session: session, eventId: eventId };
}

export async function getEvent(eventId: EventId) {
	return db.select().from(events).where(eq(events.eventId, eventId)).get();
}

export async function listEvents() {
	return db.select().from(events).where(eq(events.started, 0)).all();
}
