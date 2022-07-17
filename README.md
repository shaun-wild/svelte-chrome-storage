# Svelte Chrome Storage

A lightweight abstraction between Svelte stores and Chrome extension storage.

## Installation

Install:

```shell
npm i svelte-chrome-storage
```

## Usage

```sveltehtml
<script>
    import {chromeStorageLocal} from "svelte-chrome-storage"
    
    let message = chromeStorageLocal("message")
    $message = "Hello, World!"
</script>

<!-- Any chrome storage updates are reactive! -->
<p>{$message}</p>
```