<script>
	import { Button } from '$lib/components/ui/button';
	import { PackageSearch, ShoppingCart } from 'lucide-svelte';
</script>

<div class="container mx-auto py-12 flex flex-col items-center gap-4">
	<Button href="/admin/products" class="text-2xl py-8 w-full" variant="outline" size="lg">
		<PackageSearch class="size-7 mr-4" />
		Products
	</Button>
	<Button href="/admin/orders" class="text-2xl py-8 w-full" variant="outline" size="lg">
		<ShoppingCart class="size-7 mr-4" />
		Orders
	</Button>
</div>
