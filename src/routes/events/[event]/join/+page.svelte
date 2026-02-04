<script lang="ts">
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<h1>Join Event: {data.event.name}</h1>
<p>Format: {data.event.format}</p>

<form method="POST">
	<div>
		<label for="name">Your Name</label>
		<input type="text" id="name" name="name" required />
	</div>

	{#if form?.error}
		<p class="error">{form.error}</p>
	{/if}

	<button type="submit">Join Event</button>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 400px;
		margin-top: 1rem;
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
</style>
