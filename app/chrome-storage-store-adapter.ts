import type {Subscriber, Unsubscriber, Updater, Writable} from "svelte/store";

type AdapterDictionary = { [key: string]: Array<Subscriber<any>> }

type StorageName = 'sync' | 'local' | 'managed'

const adapters: { [key in StorageName]: AdapterDictionary } = {
    sync: {},
    local: {},
    managed: {},
}

if(!chrome.storage) {
    throw new Error("You are missing the `storage` permission in your manifest.")
}

chrome.storage.onChanged.addListener((changes, area) => {
    // I'm not sure if or when this is the case, but rather be safe than sorry.
    if(area == 'session') return

    const areaAdapters = adapters[area as StorageName]
    Object.entries(changes).forEach(([key, value]) => {
        areaAdapters[key]?.forEach(run => run(value.newValue))
    })
})

/**
 * Creates a new {@link ChromeStorageStoreAdapter} for a given key.
 * Data will be published to/read from chrome.storage.local.
 * This is a {@link Writable} instance, and can be used in place of
 * svelte stores.
 * @param key The key to store in the `local` chrome storage area.
 * @throws If the `storage` permission is not present in your manifest.
 * */
export function chromeStorageLocal<T>(key: string): ChromeStorageStoreAdapter<T> {
    return new ChromeStorageStoreAdapter('local', key)
}

/**
 * Creates a new {@link ChromeStorageStoreAdapter} for a given key.
 * Data will be published to/read from chrome.storage.sync.
 * This is a {@link Writable} instance, and can be used in place of
 * svelte stores.
 * @param key The key to store in the `sync` chrome storage area.
 * @throws If the `storage` permission is not present in your manifest.
 * */
export function chromeStorageSync<T>(key: string): ChromeStorageStoreAdapter<T> {
    return new ChromeStorageStoreAdapter('sync', key)
}

/**
 * Creates a new {@link ChromeStorageStoreAdapter} for a given key.
 * Data will be read from chrome.storage.managed.
 * This is a {@link Writable} instance, and can be used in place of
 * svelte stores.
 *
 * NOTE: You cannot write to a managed storage area; it is read-only.
 * @param key The key to read from the `managed` chrome storage area.
 * @throws If the `storage` permission is not present in your manifest.
 * @throws If you try to write to this storage area.
 * */
export function chromeStorageManaged<T>(key: string): ChromeStorageStoreAdapter<T> {
    return new ChromeStorageStoreAdapter('managed', key)
}

/**
 * {@link Writable} implementation that delegates to a chrome storage area.
 * */
class ChromeStorageStoreAdapter<T> implements Writable<T> {
    constructor(
        private area: StorageName,
        private key: string
    ) {
    }

    set(value: T): void {
        if (this.area === 'managed') {
            throw Error("Cannot set managed area")
        }

        chrome.storage[this.area].set({[this.key]: value})
    }

    subscribe(run: Subscriber<T>): Unsubscriber {
        const subscriberArray = adapters[this.area][this.key] ?? (adapters[this.area][this.key] = [])
        const index = subscriberArray.push(run)
        return () => subscriberArray.splice(index, 1)
    }

    update(updater: Updater<T>): void {
        chrome.storage[this.area].get(this.key, item => {
            const newItem = updater(item[this.key])
            this.set(newItem)
        })
    }
}
