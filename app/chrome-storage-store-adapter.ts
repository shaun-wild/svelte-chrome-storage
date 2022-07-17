import type {Subscriber, Unsubscriber, Updater, Writable} from "svelte/store";
import AreaName = chrome.storage.AreaName;

type AdapterDictionary = { [key: string]: Array<Subscriber<any>> }

const adapters: { [key in AreaName]: AdapterDictionary } = {
    sync: {},
    local: {},
    managed: {},
    session: {}
}

chrome.storage.onChanged.addListener((changes, area) => {
    const areaAdapters = adapters[area]
    Object.entries(changes).forEach(([key, value]) => {
        areaAdapters[key]?.forEach(run => run(value.newValue))
    })
})

export function chromeStorageLocal<T>(key: string): ChromeStorageStoreAdapter<T> {
    return new ChromeStorageStoreAdapter('local', key)
}

export function chromeStorageSync<T>(key: string): ChromeStorageStoreAdapter<T> {
    return new ChromeStorageStoreAdapter('sync', key)
}

export function chromeStorageManaged<T>(key: string): ChromeStorageStoreAdapter<T> {
    return new ChromeStorageStoreAdapter('managed', key)
}

export function chromeStorageSession<T>(key: string): ChromeStorageStoreAdapter<T> {
    return new ChromeStorageStoreAdapter('session', key)
}

class ChromeStorageStoreAdapter<T> implements Writable<T> {
    constructor(
        private area: AreaName,
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
