const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;

let storedNumbers = [];

app.use(cors());

const fetchNumbers = async (type) => {
    try {
        const response = await axios.get(`http://20.244.56.144/test/${type}`);
        return response.data.numbers;
    } catch (error) {
        console.error('Error fetching numbers:', error);
        return [];
    }
};

const updateStoredNumbers = (newNumber) => {
    if (storedNumbers.length >= WINDOW_SIZE) {
        storedNumbers.shift(); // Remove oldest number
    }
    storedNumbers.push(newNumber);
};

const calculateAverage = () => {
    const sum = storedNumbers.reduce((acc, val) => acc + val, 0);
    return (sum / storedNumbers.length).toFixed(2);
};

app.get('/numbers/:id', async (req, res) => {
    const type = req.params.id;
    const startTime = Date.now();

    const numbers = await fetchNumbers(type);
    const newNumbers = [...new Set(numbers)]; // Ensure uniqueness

    const endTime = Date.now();
    if (endTime - startTime > 500) {
        return res.status(500).send('Request took too long');
    }

    newNumbers.forEach(updateStoredNumbers);

    const avg = calculateAverage();

    res.json({
        windowPrevState: storedNumbers.slice(0, storedNumbers.length - newNumbers.length),
        windowCurrState: storedNumbers,
        numbers: newNumbers,
        avg,
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
