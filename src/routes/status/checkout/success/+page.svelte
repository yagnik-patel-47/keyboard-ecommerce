<script lang="ts">
	import { clearCart } from '$lib/client/cart';
	import { Button } from '$lib/components/ui/button';
	import { CircleCheckBig } from 'lucide-svelte';

	clearCart();
</script>

<div class="h-dvh flex container justify-center items-center flex-col gap-8">
	<CircleCheckBig class="size-20 text-green-500" />
	<h1 class="text-4xl">Thanks for purchasing shitt from our store..</h1>
	<Button href="/">Continue Shopping</Button>
</div>
