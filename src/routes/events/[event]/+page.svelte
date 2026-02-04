<script lang="ts">
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<h1>{data.event.name}</h1>
<p>Format: {data.event.format}</p>

<section class="players">
	<h2>Players ({data.players.length})</h2>
	{#if data.players.length === 0}
		<p>No players have joined yet.</p>
	{:else}
		<ul>
			{#each data.players as player}
				<li>{player.playerName}</li>
			{/each}
		</ul>
	{/if}
</section>

{#if data.session?.isHost}
	<section class="manage">
		<h2>Manage Event</h2>
	</section>
{/if}

{#if data.session?.playerName}
	<section class="play">
		<h2>Play</h2>
		<p>Playing as: {data.session.playerName}</p>
	</section>
{:else}
	<section class="join">
		<h2>Join Event</h2>

		<form method="POST" action="?/join">
			<div>
				<label for="name">Your Name</label>
				<input type="text" id="name" name="name" required />
			</div>

			{#if form?.error}
				<p class="error">{form.error}</p>
			{/if}

			<button type="submit">Join Event</button>
		</form>
	</section>
{/if}

<style>
	section {
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 1px solid #ccc;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 400px;
		margin-top: 1rem;
	}

	form div {
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

	.players ul {
		list-style: none;
		padding: 0;
		margin: 0.5rem 0;
	}

	.players li {
		padding: 0.25rem 0;
	}
</style>
