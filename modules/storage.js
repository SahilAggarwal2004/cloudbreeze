const setStorage = (key, value) => sessionStorage.setItem(key, JSON.stringify(value))
const getStorage = (key, fallbackValue) => {
    let value = sessionStorage.getItem(key)
    if (value) value = JSON.parse(value)
    else if (fallbackValue) {
        value = fallbackValue
        setStorage(key, value)
    }
    return value;
}

export { setStorage, getStorage }