let expenses = [];
document.addEventListener('DOMContentLoaded', () => {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            expenses = data;
            renderExpenses();
            createPaginationButtons();
            calculateTotalAmount();
        })
        .catch(error => {
            console.error('An error occurred while loading the data:', error);
        });
    document.querySelector('.button__search').addEventListener('click', filterExpenses);

});

function renderExpenses() {
    const tableBody = document.querySelector('#expensesTable');
    // tableBody.textContent = '';

    expenses.forEach(expense => {
        const row = document.createElement('tr');
        row.classList.add('expense__item');

        const nameCell = document.createElement('td');
        nameCell.setAttribute('headers', 'name');
        nameCell.classList.add('expenses-list__name');
        nameCell.textContent = expense.name;
        row.appendChild(nameCell);

        const categoryCell = document.createElement('td');
        categoryCell.setAttribute('headers', 'category');
        categoryCell.classList.add('expenses-list__category');
        categoryCell.textContent = expense.category;
        row.appendChild(categoryCell);

        const dateCell = document.createElement('td');
        dateCell.setAttribute('headers', 'date');
        dateCell.classList.add('expenses-list__date');
        dateCell.textContent = expense.date;
        row.appendChild(dateCell);

        const priceCell = document.createElement('td');
        priceCell.setAttribute('headers', 'price');
        priceCell.classList.add('expenses-list__price');

        const amountSpan = document.createElement('span');
        amountSpan.classList.add('expenses-list__amount');
        amountSpan.textContent = expense.price.amount;
        priceCell.appendChild(amountSpan);

        const currencySpan = document.createElement('span');
        currencySpan.classList.add('expenses-list__currency');
        currencySpan.textContent = expense.price.currency;
        priceCell.appendChild(currencySpan);

        row.appendChild(priceCell);

        tableBody.appendChild(row);
    });
}


// createPaginationButtons();
// window.addEventListener('DOMContentLoaded', () => {
//     document.querySelector('.button__search').addEventListener('click', filterExpenses);
//     calculateTotalAmount();
// });
document.querySelector('.button__search').addEventListener('click', filterExpenses);
calculateTotalAmount();
document.querySelector('.button__clear').addEventListener('click', clearForm);


//calculateTotalAmount
function calculateTotalAmount() {
    const amountCells = document.querySelectorAll('.expenses-list__price .expenses-list__amount');
    let totalAmount = 0;

    amountCells.forEach(cell => {
        const amount = parseFloat(cell.textContent);
        if (!isNaN(amount) && cell.closest('.expense__item').style.display !== 'none') {
            totalAmount += amount;
        }
    });
    const totalAmountCell = document.getElementById('totalAmount');
    totalAmountCell.textContent = Math.floor(totalAmount).toString();
}

//filterExpenses
function filterExpenses(event) {
    event.preventDefault();
    const selectedCategory = document.querySelector('.form__select').value;
    const searchText = document.querySelector('.form__input').value.toLowerCase();
    const expenseItems = document.querySelectorAll('.expense__item');
    const startDate = document.querySelectorAll('.form__date')[0].value;
    const endDate = document.querySelectorAll('.form__date')[1].value;
    let matchingItems = 0;

    expenseItems.forEach(item => {
        const category = item.querySelector('.expenses-list__category').textContent;
        const name = item.querySelector('.expenses-list__name').textContent.toLowerCase();
        const date = item.querySelector('.expenses-list__date').textContent;

        const isCategoryMatch = (selectedCategory === 'all' || selectedCategory === category);
        const isNameMatch = name.includes(searchText);


        if (isCategoryMatch && isNameMatch) {
            item.style.display = 'none';
            switch (true) {
                case startDate != "" && endDate != "":
                    if (startDate <= date && endDate >= date) {
                        item.style.display = 'table-row';
                        matchingItems++;
                    }
                    break;
                case startDate === "" && endDate != "":
                    if (endDate >= date) {
                        item.style.display = 'table-row';
                        matchingItems++;
                    }
                    break;
                case startDate != "" && endDate === "":
                    if (startDate <= date) {
                        item.style.display = 'table-row';
                        matchingItems++;
                    }
                    break;
                default:
                    item.style.display = 'table-row';
                    matchingItems++;
                    break;
            }
        } else {
            item.style.display = 'none';
        }
    });

    const noMatchingItems = matchingItems === 0;
    const noexpense = document.querySelector('.expenses-list__noexpense');
    const paginationButtons = document.querySelectorAll('.pagination__button');
    if (startDate >= endDate && endDate != '') {
        const tdElement = noexpense.querySelector('td');
        tdElement.textContent = 'There is no such expense. The start date cannot be greater than the end date.'
    }
    if (noexpense) {
        noexpense.style.display = noMatchingItems ? 'flex' : 'none';
        paginationButtons.forEach(button => {
            button.style.display = noMatchingItems ? 'none' : 'flex';
        });
    }
    calculateTotalAmount()
    createPaginationButtons();
}

function clearForm(event) {
    event.preventDefault();
    const inputElements = document.querySelectorAll('input');
    inputElements.forEach((input) => {
        input.value = '';
    });
    const selectElement = document.querySelector('select');
    if (selectElement) {
        const options = selectElement.querySelectorAll('option');
        if (options.length > 0) {
            selectElement.value = options[0].value;
        }
    }
    createPaginationButtons();
    filterExpenses(event);
}


//pagination
function createPaginationButtons() {
    removePaginationButtons();

    const expenseItems = document.querySelectorAll('.expense__item');
    const selectedItems = []
    expenseItems.forEach(item => {
        if (getComputedStyle(item).display === 'table-row') {
            selectedItems.push(item);
        }
    });


    if (selectedItems !== []) {
        const paginationContainer = document.querySelector('.pagination');
        const itemsPerPage = 8;
        const pageCount = Math.ceil(selectedItems.length / itemsPerPage);
        for (let i = 1; i <= pageCount; i++) {
            const button = document.createElement('button');
            button.innerText = i;
            button.classList.add('pagination__button');
            button.addEventListener('click', () => goToPage(i, selectedItems));
            paginationContainer.appendChild(button);
        }
        goToPage(1, selectedItems);
    }
}

function removePaginationButtons() {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';
}

function goToPage(pageNumber, expenseItems) {

    if (expenseItems.length > 0) {
        const paginationContainer = document.querySelector('.pagination');
        const itemsPerPage = 8;
        const startIndex = (pageNumber - 1) * itemsPerPage;
        const endIndex = pageNumber * itemsPerPage;

        expenseItems.forEach((item, index) => {
            if (index >= startIndex && index < endIndex) {
                item.style.display = 'table-row';
            } else {
                item.style.display = 'none';
            }
        });
        calculateTotalAmount();
        const buttons = paginationContainer.querySelectorAll('button');
        buttons.forEach((button, index) => {
            if (index === pageNumber - 1) {
                button.classList.add('active-page');
            } else {
                button.classList.remove('active-page');
            }
        });
    }
}

//navigation
const toggleButton = document.querySelector('.nav__toggle-button');
const navList = document.querySelector('.nav__list');
const toggleButtonBars = document.querySelectorAll('.nav__toggle-button-bar');
let currentColor = 'var(--text-color-primary-on-background))';

toggleButton.addEventListener('click', () => {
    navList.classList.toggle('active');
    toggleButtonBars.forEach(bar => {
        bar.style.backgroundColor = currentColor;
    });
    currentColor = (currentColor === 'var(--text-color-primary-on-background)')
        ? 'var(--text-color-primary-on-background)'
        : 'var(--secondary-color)';
});

function removeActiveClass() {
    if (navList.classList.contains('active') && window.innerWidth > 767) {
        navList.classList.remove('active');
        currentColor = 'var(--text-color-primary-on-background)';
    }
    toggleButtonBars.forEach(bar => {
        bar.style.backgroundColor = currentColor;
    });
}

window.addEventListener('resize', removeActiveClass);
