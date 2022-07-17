import {chrome} from 'jest-chrome'
import {chromeStorageLocal, chromeStorageManaged, chromeStorageSync} from "../chrome-storage-store-adapter";

describe('chrome storage store adapter', () => {
    it('should register a store sync', () => {
        const store = chromeStorageSync<string>("test")
        const callback = jest.fn()

        store.subscribe(callback)
        chrome.storage.onChanged.callListeners({test: {newValue: "newTest", oldValue: "test"}}, "sync")

        expect(callback).toHaveBeenCalledWith("newTest")
    })

    it('should register a store local', () => {
        const store = chromeStorageLocal<string>("test")
        const callback = jest.fn()

        store.subscribe(callback)
        chrome.storage.onChanged.callListeners({test: {newValue: "newTest", oldValue: "test"}}, "local")

        expect(callback).toHaveBeenCalledWith("newTest")
    })

    it('should register a store managed', () => {
        const store = chromeStorageManaged<string>("test")
        const callback = jest.fn()

        store.subscribe(callback)
        chrome.storage.onChanged.callListeners({test: {newValue: "newTest", oldValue: ""}}, "managed")

        expect(callback).toHaveBeenCalledWith("newTest")
    })

    it('should set chrome storage local', () => {
        const store = chromeStorageLocal<string>("test")
        store.set("newTest")
        expect(chrome.storage.local.set).toHaveBeenCalledWith({test: "newTest"})
    })

    it('should set chrome storage sync', () => {
        const store = chromeStorageSync<string>("test")
        store.set("newTest")
        expect(chrome.storage.sync.set).toHaveBeenCalledWith({test: "newTest"})
    })

    it('should fail to set managed store', () => {
        const store = chromeStorageManaged<string>("test")
        expect(() => store.set("newValue")).toThrowError()
    })

    it('should update a value', () => {
        const store = chromeStorageLocal<string>("test")
        chrome.storage.local.get.mockImplementation((key, cb) => cb({test: "123"}))
        store.update(value => value + "test")
        expect(chrome.storage.local.set).toHaveBeenCalledWith({test: "123test"})
    })

    it('should unsubscribe', () => {
        const store = chromeStorageLocal<string>("test")
        const callback = jest.fn()

        const unsubscribe = store.subscribe(callback)
        unsubscribe()
        chrome.storage.onChanged.callListeners({test: {newValue: "newTest", oldValue: "test"}}, "local")

        expect(callback).not.toHaveBeenCalledWith("newTest")
    })

    it('should not call if nothing registered', () => {
        chrome.storage.onChanged.callListeners({test: {newValue: "newTest", oldValue: "test"}}, "local")
    })
})
