const express = require('express');
const axios = require('axios');
const app = express();
const port = 9876;

const WINDOW_SIZE = 10;
const TIMEOUT = 500; // milliseconds

let storedNumbers = [];

const fetchNumbers = async (type) => {
    const urlMap = {
        'p': 'http://20.244.56.144/test/primes',
        'f': 'http://20.244.56.144/test/fibo',
        'e': 'http://20.244.56.144/test/even',
        'r': 'http://20.244.56.144/test/rand'
    };

    const url = urlMap[type];
    if (!url) throw new Error('Invalid type');

    try {
        const response = await axios.get(url, { timeout: TIMEOUT });
        return response.data.numbers;
    } catch (error) {
        return [];
    }
};

const calculateAverage = (numbers) => {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((a, b) => a + b, 0);
    return sum / numbers.length;
};

app.get('/numbers/:type', async (req, res) => {
    const type = req.params.type;
    const windowPrevState = [...storedNumbers];

    const newNumbers = await fetchNumbers(type);
    newNumbers.forEach(num => {
        if (!storedNumbers.includes(num)) {
            if (storedNumbers.length >= WINDOW_SIZE) {
                storedNumbers.shift(); // Remove the oldest number
            }
            storedNumbers.push(num);
        }
    });

    const windowCurrState = [...storedNumbers];
    const avg = calculateAverage(storedNumbers);

    res.json({
        windowPrevState,
        windowCurrState,
        numbers: newNumbers,
        avg: parseFloat(avg.toFixed(2))
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

