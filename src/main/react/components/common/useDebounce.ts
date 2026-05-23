// src/main/react/components/common/useDebounce.js
import { useState, useEffect } from 'react';

// useDebounce hook definition
export const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Set value after delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Clean up timer with cleanup function
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};