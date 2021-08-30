<h1>Welcome to votes</h1>

<ul>
  <li>Setup caddy synch</li>
  <li>Setup login link</li>
  <li>Create backend</li>
  <li>Reconnection strategy</li>
</ul>

<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>


<script>
  import { onMount } from 'svelte'

  onMount(async () => {

    // await fetch('http://app.wolbodo/auth/mercure')
    // The subscriber subscribes to updates for the https://example.com/users/dunglas topic
    // and to any topic matching https://example.com/books/{id}
    const url = new URL('https://mercure.wolbodo.localhost/.well-known/mercure');
    url.searchParams.append('topic', 'http://votes.wolbodo/member');
    // The URL class is a convenient way to generate URLs such as https://localhost/.well-known/mercure?topic=https://example.com/books/{id}&topic=https://example.com/users/dunglas

    const eventSource = new EventSource(url, { withCredentials: true });

    eventSource.addEventListener("notice", function(e) {
      console.log(e.data)
    })

    /* Similarly, this will listen for events
    * with the field `event: update`
    */
    eventSource.addEventListener("update", function(e) {
      console.log(e.data)
    })

    /* The event "message" is a special case, as it
    * will capture events without an event field
    * as well as events that have the specific type
    * `event: message` It will not trigger on any
    * other event type.
    */
    eventSource.addEventListener("message", function(e) {
      console.log(e.data)
    })

    return () => eventSource.close()
  })
</script>