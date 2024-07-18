document.addEventListener('DOMContentLoaded', async () => {
    // elements
    const searchName = document.getElementById('searchName');
    const searchAmount = document.getElementById('searchAmount');
    const tableBody = document.getElementById('customerTableBody');
    const transactionChartCtx = document.getElementById('transactionChart').getContext('2d');
    let chart;

    // fetch local api
    const response = await fetch('https://nasal-cooperative-pentagon.glitch.me/transactions');
    const transactions = await response.json();

    const responseCustomers = await fetch('https://nasal-cooperative-pentagon.glitch.me/customers');
    const customers = await responseCustomers.json();

    // display data inside the customer table
    function displayData(customers, transactions) {
        tableBody.innerHTML = '';
        transactions.forEach(transaction => {
            const customer = customers.find(customer =>
                customer.id === transaction.customer_id
            );
            const row = tableBody.insertRow();
            row.insertCell(0).innerHTML = customer.name;
            row.insertCell(1).innerHTML = transaction.date;
            row.insertCell(2).innerHTML = transaction.amount;
            const button = document.createElement('button');
            button.className = 'btn btn-primary';
            button.textContent = 'Show Graph';
            button.addEventListener('click', () => {
                showGraph(transaction.customer_id);
            });
            row.insertCell(3).appendChild(button);
        });
    }
    displayData(customers, transactions);

    // handle search by name
    searchName.addEventListener('input', function (e) {
        const searchValue = e.target.value.toLowerCase();
        const filteredCustomers = customers.filter(customer => {
            return customer.name.toLowerCase().includes(searchValue);
        });
        const filteredCustomerIds = filteredCustomers.map(customer => customer.id);
        const filteredTransaction = transactions.filter(transaction => filteredCustomerIds.includes(transaction.customer_id));

        displayData(filteredCustomers, filteredTransaction);
    });

    // handle search by transaction amount
    searchAmount.addEventListener('input', function (e) {
        const searchValue = e.target.value;
        const filteredTransactions = transactions.filter(transaction => transaction.amount.toString().includes(searchValue));

        // Get customers associated with filtered transactions
        const filteredCustomerIds = filteredTransactions.map(transaction => transaction.customer_id);
        const filteredCustomers = customers.filter(customer => filteredCustomerIds.includes(customer.id));

        displayData(filteredCustomers, filteredTransactions);
    });

    // function to show graph
    function showGraph(customerId) {
        const customerTransactions = transactions.filter(trans => trans.customer_id === customerId);
        const transactionData = customerTransactions.reduce((acc, curr) => {
            acc[curr.date] = (acc[curr.date] || 0) + curr.amount;
            return acc;
        }, {});

        const labels = Object.keys(transactionData);
        const data = Object.values(transactionData);

        if (chart) {
            chart.destroy();
        }

        chart = new Chart(transactionChartCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Transaction Amount',
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
});
