console.log('stock_details.js loaded');

import { auth, db, onAuthStateChanged, doc, updateDoc, arrayUnion } from './aboutusscript.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    fetchLivePrice('{{ stock[0] }}');

    document.getElementById('order-type').addEventListener('change', (event) => {
        const priceLimitSection = document.getElementById('price-limit-section');
        if (event.target.value === 'limit') {
            priceLimitSection.style.display = 'block';
        } else {
            priceLimitSection.style.display = 'none';
        }
    });

    window.submitOrder = submitOrder;
    console.log('submitOrder function defined globally');
});

function fetchLivePrice(symbol) {
    console.log('fetchLivePrice called with symbol:', symbol);
    const apiKey = 'cqfir39r01qle0e3q9k0cqfir39r01qle0e3q9kg'; // Replace with your actual Finnhub API key
    fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            if (data.c !== undefined && data.c !== 0) {
                document.getElementById('price').textContent = `Price: $${data.c}`;
                const change = ((data.c - data.pc) / data.pc * 100).toFixed(2);
                document.getElementById('change').textContent = `Change: ${change}%`;
                document.getElementById('change').style.color = change >= 0 ? 'green' : 'red';
            } else {
                document.getElementById('price').textContent = `Price: $0 (Unable to fetch live price)`;
                document.getElementById('change').textContent = `Change: N/A`;
                document.getElementById('change').style.color = 'black';
            }
        })
        .catch(error => {
            console.error('Error fetching live price:', error);
            document.getElementById('price').textContent = `Price: $0 (Error fetching price)`;
            document.getElementById('change').textContent = `Change: N/A`;
            document.getElementById('change').style.color = 'black';
        });
}

function submitOrder(stockId,stockSymbol , stockName) {
    console.log('submitOrder called with stockId:', stockId);
    const action = document.getElementById('order-action').value;
    const mode = document.getElementById('order-mode').value;
    const type = document.getElementById('order-type').value;
    const quantity = document.getElementById('quantity').value;
    const priceLimit = type === 'limit' ? document.getElementById('price-limit').value : null;

    const orderDetails = {
        stockId: stockId,
        stockName: stockName,
        stockSymbol: stockSymbol,
        action: action,
        mode: mode,
        type: type,
        quantity: quantity,
        priceLimit: type === 'limit' ? priceLimit : null,
        timestamp: new Date()
    };

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, "users", user.uid);

            await updateDoc(userDocRef, {
                orders: arrayUnion(orderDetails)
            });

            console.log('Order submitted successfully:', orderDetails);
            alert('Order submitted successfully!');
        } else {
            console.log('No user is signed in.');
            alert('No user is signed in.');
        }
    });
}
