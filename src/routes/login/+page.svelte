<script>
	import { Button } from '$lib/components/ui/button';
	import { Github } from 'lucide-svelte';
</script>

<div class="min-h-dvh w-full flex justify-center items-center">
	<Button href="/auth/github" size="lg" class="gap-3 text-lg">
		<Github />
		Sign in with Github
	</Button>
</div>
