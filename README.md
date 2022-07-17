# Svelte Chrome Storage

A lightweight abstraction between Svelte stores and Chrome extension storage.

This library makes data synchronization of background and popup scripts super simple,
data changed in one is immediately reflected in the other. 🚀

-----

[![NPM version](https://img.shields.io/npm/v/svelte-chrome-storage)](https://www.npmjs.com/package/svelte-chrome-storage)

## Installation

Install:

```shell
npm i svelte-chrome-storage
```

## Usage

### Reactive Syntax

```sveltehtml
<script>
    import {chromeStorageLocal} from "svelte-chrome-storage"
    
    let message = chromeStorageLocal("message")
    $message = "Hello, World!"
</script>

<!-- Any chrome storage updates are reactive! -->
<p>{$message}</p>
```

### Pub-sub Syntax

```sveltehtml
<script>
    import {chromeStorageSync} from "svelte-chrome-storage"
    
    let message = chromeStorageSync("message")
    message.subscribe(newMessage => console.log(newMessage))
    message.set("Hello, World!")
</script>
```

The examples above set the `message` key on their respective chrome storage
areas.

Values changed using the `chrome.storage` api are also reflected.

```js
chrome.storage.local.set({message: "Hello, World!"})
```

## Contributions

Feel free to open any issues or pull requests for any changes you'd like to see.
