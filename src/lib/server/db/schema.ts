import { integer, text, sqliteTable, blob } from 'drizzle-orm/sqlite-core';

// Tournament events
export const events = sqliteTable('events', {
	eventId: integer().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	format: text().notNull(),
	started: integer().notNull().default(0)
});

// User sessions which have connected to an event
export const eventSessions = sqliteTable('event_sessions', {
	eventSessionId: text().notNull().primaryKey(),
	eventId: integer()
		.notNull()
		.references(() => events.eventId),
	secretHash: blob().notNull(),
	host: integer({ mode: 'boolean' }).notNull().default(false)
});

// Players (identified by session) who have joined an event
export const eventJoins = sqliteTable('event_joins', {
	eventSessionId: text()
		.notNull()
		.references(() => eventSessions.eventSessionId)
		.primaryKey(),
	playerName: text().notNull()
});

// Match pairings
export const matches = sqliteTable('matches', {
	matchId: integer().primaryKey({ autoIncrement: true }),
	eventId: integer()
		.notNull()
		.references(() => events.eventId),
	player1Session: integer()
		.notNull()
		.references(() => eventJoins.eventSessionId),
	player2Session: integer()
		.notNull()
		.references(() => eventJoins.eventSessionId)
});
