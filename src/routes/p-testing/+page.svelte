<script>
  import { weatherData } from "./getData.js";
  import { JSONEditor } from 'svelte-jsoneditor'

  console.log(weatherData);

  let content = {
    text: undefined,
    json: weatherData
  }
</script>

<h1>Testing</h1>
<div>
  <JSONEditor bind:content />
</div>