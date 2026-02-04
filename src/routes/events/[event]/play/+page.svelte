<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<h1>{data.event.name}</h1>
<p>Format: {data.event.format}</p>
