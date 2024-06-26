/* This file sends requests to the server using axios for token-based requests */

import axios from 'axios';
axios.defaults.withCredentials = true; //send the cookie back to the server with token

const serverURL = 'http://localhost:8000';

export async function onCreateMeal(userEmail, mealName, values) {
    return await axios.post(`${serverURL}/inapp/meals/create-meal`, [userEmail, mealName, values]);
};