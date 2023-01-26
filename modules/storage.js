import { randomName } from "random-stuff-js"

export const setStorage = (key, value, local = true) => (local ? localStorage : sessionStorage).setItem(key, JSON.stringify(value))

export const removeStorage = (key, local = true) => (local ? localStorage : sessionStorage).removeItem(key)

export const getStorage = (key, fallbackValue, local = true) => {
    let value = (local ? localStorage : sessionStorage).getItem(key)
    try {
        if (!value) throw new Error("Value doesn't exist")
        value = JSON.parse(value)
    } catch {
        if (fallbackValue) {
            value = fallbackValue
            setStorage(key, value, local)
        } else {
            value = null
            removeStorage(key, local)
        }
    }
    return value
}

export const resetStorage = (local = true) => {
    setStorage('username', randomName(), local)
    setStorage('type', 'guest', local)
    removeStorage('csrftoken', local)
}