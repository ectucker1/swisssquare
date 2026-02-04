// Adapted from Lucia Auth https://lucia-auth.com/sessions/basic

export interface Session {
	id: string;
	secretHash: Uint8Array;
}

export interface SessionWithToken extends Session {
	token: string;
}

export type StoreSession = (session: SessionWithToken) => Promise<SessionWithToken | null>;

export type GetSession = (sessionId: string) => Promise<Session | null>;

function generateSecureRandomString(): string {
	// Human readable alphabet (a-z, 0-9 without l, o, 0, 1 to avoid confusion)
	const alphabet = 'abcdefghijkmnpqrstuvwxyz23456789';

	// Generate 24 bytes = 192 bits of entropy.
	// We're only going to use 5 bits per byte so the total entropy will be 192 * 5 / 8 = 120 bits
	const bytes = new Uint8Array(24);
	crypto.getRandomValues(bytes);

	let id = '';
	for (let i = 0; i < bytes.length; i++) {
		// >> 3 "removes" the right-most 3 bits of the byte
		id += alphabet[bytes[i] >> 3];
	}
	return id;
}

async function hashSecret(secret: string): Promise<Uint8Array> {
	const secretBytes = new TextEncoder().encode(secret);
	const secretHashBuffer = await crypto.subtle.digest('SHA-256', secretBytes);
	return new Uint8Array(secretHashBuffer);
}

export async function createSession(storeSession: StoreSession): Promise<SessionWithToken | null> {
	const id = generateSecureRandomString();
	const secret = generateSecureRandomString();
	const secretHash = await hashSecret(secret);

	const token = id + '.' + secret;

	const session: SessionWithToken = {
		id,
		secretHash,
		token
	};

	return storeSession(session);
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.byteLength !== b.byteLength) {
		return false;
	}
	let c = 0;
	for (let i = 0; i < a.byteLength; i++) {
		c |= a[i] ^ b[i];
	}
	return c === 0;
}

export async function validateSessionToken(
	token: string,
	getSession: GetSession
): Promise<Session | null> {
	const tokenParts = token.split('.');
	if (tokenParts.length !== 2) {
		return null;
	}
	const sessionId = tokenParts[0];
	const sessionSecret = tokenParts[1];

	const session = await getSession(sessionId);
	if (!session) {
		return null;
	}

	const tokenSecretHash = await hashSecret(sessionSecret);
	const validSecret = constantTimeEqual(tokenSecretHash, session.secretHash);
	if (!validSecret) {
		return null;
	}

	return session;
}
