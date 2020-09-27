<script>
    import { stores, goto } from '@sapper/app';
    const { page } = stores();

    let posting = false
	let name

	async function identify() {
        try {
            posting = true
            const assemblyId = $page.params.assemblyId
            const response = await fetch('/join', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    assemblyId
                })
            })
            if (response.status !== 200) {
                throw new Error("Could not join assembly")
            }
            goto(`/a-${assemblyId}`)
        } catch (e) {
            throw e
        } finally {
            posting = false
        }
	}
</script>


<svelte:head>
	<title>Assemblies|create</title>
</svelte:head>

<h1>Welcome, to join, identify yourself</h1>

<form on:submit|preventDefault={identify} disabled={posting}>
	<label for='name'>Name</label>
	<input required id='name' bind:value={name} />

	<button>Join</button>
</form>

<style>
    form > * {
        display: block;
    }
</style>