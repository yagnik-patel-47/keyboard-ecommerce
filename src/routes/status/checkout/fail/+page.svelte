<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { CircleX } from 'lucide-svelte';
</script>

<div class="h-dvh flex container justify-center items-center flex-col gap-8">
	<CircleX class="size-20 text-red-500" />
	<h1 class="text-4xl">Some unexpected shit happened while doing stuff..</h1>
	<Button href="/cart">Try Again?</Button>
</div>
