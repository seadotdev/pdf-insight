import { useState, useEffect } from "react";

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(initialValue);

    useEffect(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                console.info(`Fetching: ${key} from local storage`);
                console.info(item);
                setStoredValue(JSON.parse(item) as T);
            }
        } catch (error) {
            console.error(error);
        }
    }, [key]);

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            console.info(`Setting: ${key} to local storage`);
            console.info(value);
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
}

export default useLocalStorage;
