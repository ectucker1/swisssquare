import { db } from '$lib/server/db';
import { and, eq } from 'drizzle-orm';
import { events, eventJoins, eventSessions } from '$lib/server/db/schema';
import { createSession, validateSessionToken, type SessionWithToken } from '$lib/server/session';

export type EventId = number;

export interface ValidatedEventSession {
	sessionId: string;
	isHost: boolean;
	playerName?: string;
}

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

export async function getEventSession(
	eventId: EventId,
	token: string | undefined
): Promise<ValidatedEventSession | null> {
	if (!token) {
		return null;
	}

	const getSession = async (sessionId: string) => {
		const session = db
			.select({ secretHash: eventSessions.secretHash })
			.from(eventSessions)
			.where(and(eq(eventSessions.eventSessionId, sessionId), eq(eventSessions.eventId, eventId)))
			.get();
		if (!session) {
			return null;
		}
		return {
			id: sessionId,
			secretHash: new Uint8Array(session.secretHash as ArrayBuffer)
		};
	};

	const session = await validateSessionToken(token, getSession);
	if (!session) {
		return null;
	}

	const sessionData = db
		.select({ host: eventSessions.host })
		.from(eventSessions)
		.where(eq(eventSessions.eventSessionId, session.id))
		.get();

	if (!sessionData) {
		return null;
	}

	const joinData = db
		.select({ playerName: eventJoins.playerName })
		.from(eventJoins)
		.where(eq(eventJoins.eventSessionId, session.id))
		.get();

	return {
		sessionId: session.id,
		isHost: sessionData.host,
		playerName: joinData?.playerName
	};
}

export function joinEventAsHost(sessionId: string, name: string): void {
	db.insert(eventJoins)
		.values({
			eventSessionId: sessionId,
			playerName: name.trim()
		})
		.run();
}

export function getEventPlayers(eventId: EventId) {
	return db
		.select({ playerName: eventJoins.playerName })
		.from(eventJoins)
		.innerJoin(eventSessions, eq(eventJoins.eventSessionId, eventSessions.eventSessionId))
		.where(eq(eventSessions.eventId, eventId))
		.all();
}
