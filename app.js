// Main application data structure
let appData = {
    initialBalance: 0,
    expenses: []
};

// DOM Elements
const elements = {
    balanceInput: document.getElementById('balanceInput'),
    remainingBalance: document.getElementById('remainingBalance'),
    expenseDescription: document.getElementById('expenseDescription'),
    expenseAmount: document.getElementById('expenseAmount'),
    expenseDate: document.getElementById('expenseDate'),
    expenseTime: document.getElementById('expenseTime'),
    transactionList: document.getElementById('transactionList')
};

// Save data to Firebase
function saveData() {
    firebase.database().ref('spendTrackerData').set(appData);
}

// Load data from Firebase
function loadData() {
    firebase.database().ref('spendTrackerData').once('value').then(snapshot => {
        const savedData = snapshot.val();
        if (savedData) {
            appData = savedData;
        }
        renderApp();
    });
}

// Calculate remaining balance
function calculateRemainingBalance() {
    const totalExpenses = appData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    return appData.initialBalance - totalExpenses;
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Render the entire application
function renderApp() {
    // Update remaining balance
    elements.remainingBalance.textContent = formatCurrency(calculateRemainingBalance());

    // Clear and render transaction list
    elements.transactionList.innerHTML = '';
    appData.expenses.slice().reverse().forEach(expense => {
        const expenseElement = document.createElement('div');
        expenseElement.className = 'flex justify-between items-center p-3 bg-white rounded shadow';
        expenseElement.innerHTML = `
            <div>
                <span class="text-gray-800 font-semibold">${expense.description}</span><br>
                <span class="text-xs text-gray-500">${expense.date} ${expense.time}</span>
            </div>
            <span class="font-semibold text-red-500">${formatCurrency(expense.amount)}</span>
        `;
        elements.transactionList.appendChild(expenseElement);
    });
}

// Event Handlers
function handleSetBalance() {
    const balance = parseFloat(elements.balanceInput.value);
    if (!isNaN(balance) && balance >= 0) {
        appData.initialBalance = balance;
        saveData();
        renderApp();
        elements.balanceInput.value = '';
    } else {
        alert('Please enter a valid positive number');
    }
}

function handleAddExpense() {
    const description = elements.expenseDescription.value.trim();
    const amount = parseFloat(elements.expenseAmount.value);
    const date = elements.expenseDate.value;
    const time = elements.expenseTime.value;

    if (description && !isNaN(amount) && amount > 0 && date && time) {
        appData.expenses.push({
            description,
            amount,
            date,
            time
        });
        saveData();
        renderApp();
        elements.expenseDescription.value = '';
        elements.expenseAmount.value = '';
        elements.expenseDate.value = '';
        elements.expenseTime.value = '';
    } else {
        alert('Please enter a valid description, amount, date, and time');
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});