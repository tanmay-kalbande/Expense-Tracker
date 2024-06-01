document.addEventListener('DOMContentLoaded', () => {
    populateMonthSelector();
    updateExpensesAndSummary();
});

function addExpense() {
    const name = document.getElementById('name').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;
    const addButton = document.getElementById('add-expense-btn');

    addButton.disabled = true;
    addButton.textContent = 'Adding...';

    try {
        if (!name || isNaN(amount) || !date || !category) {
            throw new Error('Please fill in all fields');
        }

        const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        const newExpense = { id: Date.now(), name, amount, date, category };
        expenses.unshift(newExpense); // Add new expense at the beginning
        localStorage.setItem('expenses', JSON.stringify(expenses));

        // Ensure we're showing the month of the newly added expense
        const newExpenseMonth = new Date(date).toISOString().substring(0, 7);
        document.getElementById('month-selector').value = newExpenseMonth;

        updateExpensesAndSummary();
        clearForm();
    } catch (error) {
        alert(error.message);
    } finally {
        addButton.disabled = false;
        addButton.textContent = 'Add Expense';
    }
}


function clearForm() {
    document.getElementById('name').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('date').value = new Date().toISOString().substring(0, 10); // Set to current date
    document.getElementById('category').value = 'Food';
}

document.addEventListener('DOMContentLoaded', () => {
    populateMonthSelector();
    updateExpensesAndSummary();
    clearForm(); // Clear the form on page load
});

function fetchExpenses() {
    const selectedMonth = document.getElementById('month-selector').value;
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const filteredExpenses = expenses.filter(expense => new Date(expense.date).toISOString().substring(0, 7) === selectedMonth);
    const expenseList = document.getElementById('expense-list');
    expenseList.innerHTML = '';

    // Sort expenses by date in descending order
    filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    filteredExpenses.forEach(expense => {
        const li = document.createElement('li');

        const formattedDate = formatDate(expense.date);
        const iconClass = getCategoryIcon(expense.category);

        li.innerHTML = `
            <span class="expense-name">${expense.name}</span>
            <span class="expense-amount">₹${expense.amount.toFixed(2)}</span>
            <span class="expense-category"><i class="fas ${iconClass}"></i></span>
            <span class="expense-date">${formattedDate}</span>
            <button onclick="confirmDeleteExpense(${expense.id})"><i class="fas fa-trash-alt"></i></button>
        `;

        expenseList.appendChild(li);
    });
}


function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
}

function populateMonthSelector() {
    const currentMonth = getCurrentMonth();
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const months = [...new Set(expenses.map(expense => new Date(expense.date).toISOString().substring(0, 7)))];

    if (!months.includes(currentMonth)) {
        months.push(currentMonth);
    }

    months.sort((a, b) => b.localeCompare(a)); // Sort in descending order

    const monthSelector = document.getElementById('month-selector');
    monthSelector.innerHTML = months.map(month => `<option value="${month}">${month}</option>`).join('');
    monthSelector.value = currentMonth;
}

document.addEventListener('DOMContentLoaded', () => {
    populateMonthSelector();
    updateExpensesAndSummary();
    clearForm();
});

function getCategoryIcon(category) {
    switch (category) {
        case 'Food':
            return 'fa-utensils';
        case 'Transportation':
            return 'fa-bus';
        case 'Bills':
            return 'fa-file-invoice-dollar';
        case 'Entertainment':
            return 'fa-film';
        case 'Housing':
            return 'fa-home';
        case 'Groceries':
            return 'fa-shopping-cart';
        case 'Health':
            return 'fa-heartbeat';
        case 'Education':
            return 'fa-graduation-cap';
        case 'Personal Care':
            return 'fa-user';
        case 'Savings':
            return 'fa-piggy-bank';
        case 'Travel':
            return 'fa-plane';
        case 'Other':
        default:
            return 'fa-question-circle';
    }
}


function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

function confirmDeleteExpense(id) {
    if (confirm("Are you sure you want to delete this expense?")) {
        removeExpense(id);
    }
}

function removeExpense(id) {
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    expenses = expenses.filter(expense => expense.id !== id);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    updateExpensesAndSummary();
}

let expenseChart = null; // Global variable to hold the chart instance

function fetchSummary() {
    const selectedMonth = document.getElementById('month-selector').value;
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const filteredExpenses = expenses.filter(expense => new Date(expense.date).toISOString().substring(0, 7) === selectedMonth);
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categoryBreakdown = filteredExpenses.reduce((acc, expense) => {
        acc[expense.category] = acc[expense.category] || 0;
        acc[expense.category] += expense.amount;
        return acc;
    }, {});

    const totalExpensesDiv = document.getElementById('total-expenses');
    totalExpensesDiv.innerHTML = `
        <div class="amount">₹${total.toFixed(2)}</div>
        <div class="month">Total for ${selectedMonth}</div>
    `;

    const ctx = document.getElementById('expense-chart').getContext('2d');

    // Destroy the previous chart if it exists
    if (expenseChart) {
        expenseChart.destroy();
    }

    // Clear the canvas to prevent ghosting
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Create a new chart with updated colors
    expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categoryBreakdown),
            datasets: [{
                data: Object.values(categoryBreakdown),
                backgroundColor: [
                  '#2F4F4F', // Dark Slate Gray - Primary
                  '#4F6363', // Slate Gray - Primary Shade
                  '#333333', // Dark Gray - Secondary
                  '#666666', // Light Gray - Text Light Color
                  '#1C3030', // Dark Cyan - Button Hover
                  '#3E5050', // Grayish Cyan - Button Hover Shade
                  '#F5F5F5', // White Smoke - Background
                  '#E6E6E6', // Light Gray - Background Shade
                  '#FFD700', // Gold - Highlight
                  '#E6C300', // Dark Gold - Highlight Shade
                  '#BFBFBF', // Silver - Neutral Shade
                  '#999999', // Dim Gray - Neutral Shade
                ]
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        color: '#333333' // Match legend text color with page palette
                    }
                }
            }
        }
    });
}


function updateExpensesAndSummary() {
    fetchExpenses();
    fetchSummary();
}


function exportData() {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const csvContent = "data:text/csv;charset=utf-8,"
        + "ID,Name,Amount,Date,Category\n"
        + expenses.map(expense => `${expense.id},${expense.name},${expense.amount},${expense.date},${expense.category}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "expenses.csv");
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
}


function importData() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file to import');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const csvContent = event.target.result;
        const lines = csvContent.split("\n");
        const expenses = [];

        for (let i = 1; i < lines.length; i++) { // Skip header line
            const line = lines[i].trim();
            if (line) {
                const [id, name, amount, date, category] = line.split(",");
                expenses.push({ id: parseInt(id), name, amount: parseFloat(amount), date, category });
            }
        }

        localStorage.setItem('expenses', JSON.stringify(expenses));
        updateExpensesAndSummary();
    };

    reader.readAsText(file);
}
