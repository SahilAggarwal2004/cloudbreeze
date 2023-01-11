import { randomName } from "random-stuff-js"

export const setStorage = (key, value, local = true) => (local ? localStorage : sessionStorage).setItem(key, JSON.stringify(value))

export const getStorage = (key, fallbackValue, local = true) => {
    let value = (local ? localStorage : sessionStorage).getItem(key)
    if (value) value = JSON.parse(value)
    else if (fallbackValue) {
        value = fallbackValue
        setStorage(key, value, local)
    }
    return value
}

const removeStorage = (key, local = true) => (local ? localStorage : sessionStorage).removeItem(key)

export const resetStorage = (local = true) => {
    setStorage('username', randomName(), local)
    setStorage('type', 'guest', local)
    removeStorage('csrftoken', local)
}