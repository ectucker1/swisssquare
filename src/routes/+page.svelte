<script lang="ts">
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<h1>Create Event</h1>

<form method="POST" action="?/host">
	<div>
		<label for="name">Event Name</label>
		<input type="text" id="name" name="name" required />
	</div>

	<div>
		<label for="format">Format</label>
		<input type="text" id="format" name="format" required />
	</div>

	{#if form?.error}
		<p class="error">{form.error}</p>
	{/if}

	<button type="submit">Create Event</button>
</form>

<h2>Join an Event</h2>

{#if data.availableEvents.length === 0}
	<p>No events available to join.</p>
{:else}
	<ul class="events">
		{#each data.availableEvents as event}
			<li>
				<span class="event-info">
					<strong>{event.name}</strong>
					<span class="format">{event.format}</span>
				</span>
				<a href="events/{event.eventId}">
					<button type="button">Join</button>
				</a>
			</li>
		{/each}
	</ul>
{/if}

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 400px;
	}

	div {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	input {
		padding: 0.5rem;
		font-size: 1rem;
	}

	button {
		padding: 0.5rem 1rem;
		font-size: 1rem;
		cursor: pointer;
	}

	.error {
		color: red;
	}

	h2 {
		margin-top: 2rem;
	}

	.events {
		list-style: none;
		padding: 0;
		max-width: 400px;
	}

	.events li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		border: 1px solid #ccc;
		margin-bottom: 0.5rem;
	}

	.event-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.format {
		color: #666;
		font-size: 0.875rem;
	}
</style>
