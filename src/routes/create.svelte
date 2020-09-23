<script>
	import { stores, goto } from '@sapper/app';

    const { session } = stores();
    
    let creating = false

	let name = 'Dexter'
	let email = 'dexter@dxlb.nl'

	async function createMeeting() {
        try {
            creating = true
            const response = await fetch('/create', {
                method: 'post',
                data: JSON.stringify({
                    name, email
                })
            })
            if (response.status !== 201) {
                throw new Error("Could not create meeting")
            }
            const { meetingId } = await response.json()
            goto(`/m-${meetingId}`)
        } catch (e) {
            throw e
        } finally {
            creating = false
        }
	}
</script>


<svelte:head>
	<title>Meetings|create</title>
</svelte:head>

<h1>Welcome, create a new meeting!</h1>

<form on:submit|preventDefault={createMeeting} disabled={creating}>
	<label for='name'>Name</label>
	<input id='name' bind:value={name} />

	<label for='email'>Email</label>
	<input id='email' type='email' bind:value={email} />

	<button on:click={createMeeting}>Start meeting</button>
</form>

<style>
    form > * {
        display: block;
    }
</style>