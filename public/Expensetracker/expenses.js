window.addEventListener("DOMContentLoaded",loadexpense);
document.getElementById('myform').addEventListener('submit',function(e){
    e.preventDefault();
const amount=document.getElementById('amount').value;
const description=document.getElementById('desc').value;
const category=document.getElementById('category').value;
const expensesId=document.getElementById('expensesId').value;



if (!amount || !description || category === 'select') {
    document.getElementById('error-message').innerText = 'All fields are required and must be filled out correctly.';
    return;
  }
  document.getElementById('error-message').innerText = '';
  const formdata={
    amount:amount,
    description:description,
   
    category:category
};
const token = localStorage.getItem('token');
if (expensesId) {
  
  axios.put(`http://localhost:3000/expenses/update-expense/${expensesId}`, formdata,{headers:{'Authorization':token}})
      .then(() => {
        loadexpense(expenseCurrentPage);
document.getElementById('amount').value = '';
document.getElementById('desc').value = '';
document.getElementById('category').value = 'select';
document.getElementById('expensesId').value = ''; 
        
      }).catch(err => console.log(err));
} else{

  axios.post("http://localhost:3000/expenses/addexpenses",formdata,{headers:{'Authorization':token}})
    .then((response)=>{
     
      loadexpense(expenseCurrentPage);
    
     document.getElementById('amount').value = '';
        document.getElementById('desc').value = '';
        document.getElementById('category').value = 'select';
    }).catch((err)=>{
        console.log(err);
    })

  } });
//parse jwt token
function parseJwt (token) {
var base64Url = token.split('.')[1];
var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
}).join(''));

return JSON.parse(jsonPayload);
}

function checkToken() {
const token = localStorage.getItem("token"); // Assuming the token is stored with this key

if (!token) {
    alert("User information missing. Please log in again.");
    window.location.href = "login.html"; // Redirect to the login page
}
}


// Pagination state variables with unique names
let expenseCurrentPage = 1;
const expenseItemsPerPageLimit = 10;

function loadexpense(page = expenseCurrentPage) {
checkToken();
const userToken = localStorage.getItem('token');
const decodeToken = parseJwt(userToken);
const isPremium = decodeToken.isPremiumuser;
updatePremiumStatus(isPremium);

axios.get(`http://localhost:3000/expenses/getexpense?page=${page}&limit=${expenseItemsPerPageLimit}`, {
headers: { 'Authorization': userToken }
})
.then((response) => {
const { expenses, totalPages, currentPage } = response.data;
displayExpenseList(expenses);
updateExpensePaginationControls(totalPages, currentPage);
})
.catch((error) => {
console.error('Error loading expenses:', error);
});
}

function displayExpenseList(expenses) {
const expenseProductList = document.getElementById('productlist');
expenseProductList.innerHTML = '';

expenses.forEach(expense => {
const expenseRow = document.createElement('tr');
expenseRow.innerHTML = `
  <td>${expense.category} - ${expense.description}</td>
  <td>${expense.amount}</td>
  <td>
    <button id="expenseEditButton" class="btn btn-sm btn-primary me-1" onclick="editExpense(${expense.id},${expense.amount},'${expense.description}','${expense.category}')">Edit</button>
    <button class="btn btn-sm btn-danger" onclick="deleteExpense('${expense.id}')">Delete</button>
  </td>
`;
expenseProductList.appendChild(expenseRow);
});
}

function updateExpensePaginationControls(totalPages, currentPage) {
// Update the display of the current page number
document.getElementById('currentExpensePageDisplay').textContent = `Page ${currentPage}`;

const expensePrevPageButton = document.getElementById('expensePrevPageButton');
const expenseNextPageButton = document.getElementById('expenseNextPageButton');

// Enable/disable buttons based on the current page
expensePrevPageButton.disabled = currentPage <= 1;
expenseNextPageButton.disabled = currentPage >= totalPages;

// Set click event listeners for pagination buttons
expensePrevPageButton.onclick = () => {
if (expenseCurrentPage > 1) {
  expenseCurrentPage--;
  loadexpense(expenseCurrentPage);
}
};

expenseNextPageButton.onclick = () => {
if (expenseCurrentPage < totalPages) {
  expenseCurrentPage++;
  loadexpense(expenseCurrentPage);
}
};
}

// Call loadexpense initially to load the first page
loadexpense();


function deleteExpense(id) {
const token = localStorage.getItem('token');

if (!id) {
console.error('No ID provided for deletion.');
return;
}
axios.delete(`http://localhost:3000/expenses/delete-expense/${id}`,{headers:{'Authorization':token}})
.then(() => {
  loadexpense(expenseCurrentPage); 
})
.catch((error) => {
  console.error('Error deleting expense:', error);
});
}


function editExpense(id,amount,description,category) {
            document.getElementById('amount').value = amount;
        document.getElementById('desc').value = description;
        document.getElementById('category').value =category;
        document.getElementById('expensesId').value =id;
       const editForm= document.getElementById('mycontainer')
        
        editForm.scrollIntoView({ behavior: 'smooth', block: 'start' });


}

//Razor-pay Integration
document.getElementById('rz-pay').onclick = async function(e){
const token =localStorage.getItem('token');
const response = await axios.get('http://localhost:3000/purchase/premiummembership',{headers:{'Authorization':token}});
//console.log(response);
var options = {
"key":response.data.key_id,
"order_id": response.data.order.id,
"handler": async function (response){
//    console.log( options.order_id);  // Log the order ID
//    console.log( response.razorpay_payment_id);  // Log the payment ID
const updateResponseawait=await axios.post('http://localhost:3000/purchase/updatetransactionstatus',{
    order_id:options.order_id,
    payment_id:response.razorpay_payment_id,

  },{headers:{'Authorization':token}});
  updatePremiumStatus(true);

 
  localStorage.setItem('token',updateResponseawait.data.token);

  alert('You are a Primium user now');

}
}
const rzp1 = new Razorpay(options);
rzp1.open();
e.preventDefault();

rzp1.on('payment.failed',function(response){
//  console.log(response);
alert('somenthing Went Wrong');
})


}



function updatePremiumStatus(isPremium) {
const navbar = document.querySelector('.navbar-nav.ms-auto');
const buyPremiumButton = document.getElementById('rz-pay');

// Remove any existing dynamic elements
const existingPremiumMessage = document.getElementById('premium-message');
const existingReportsLink = document.getElementById('reports');
const existingLeaderboardLink = document.getElementById('Leaderboardmain');

// Remove old elements (if any)
if (existingPremiumMessage) existingPremiumMessage.remove();
if (existingReportsLink) existingReportsLink.remove();
if (existingLeaderboardLink) existingLeaderboardLink.remove();

// Show elements based on premium status
if (isPremium) {
    // Hide the "Buy Premium" button
    buyPremiumButton.style.visibility = 'hidden';

    // Add the "Premium User" message
    const premiumMessageDiv = document.createElement('div');
    premiumMessageDiv.id = 'premium-message';
    premiumMessageDiv.className = 'text-success  d-block text-center';
    premiumMessageDiv.innerHTML = 'You are a Premium User! 💎 &emsp13;&nbsp;&emsp13;&nbsp;';
    
    navbar.insertBefore(premiumMessageDiv, buyPremiumButton);

    // Add the "Reports" link
    const reportsLink = document.createElement('a');
    reportsLink.id = 'reports';
    reportsLink.className = 'nav-link active';
    reportsLink.innerHTML = 'Reports👑';
    reportsLink.style.cursor = 'pointer'; // Make it look clickable  
    reportsLink.addEventListener('click', function() {
      document.getElementById('report-section').style.display = 'block';
    document.getElementById('report-section').scrollIntoView({ behavior: 'smooth' });
    fetchAllExpenses();
    fetchRecentDownloads();
    });
    navbar.insertBefore(reportsLink, buyPremiumButton);

    // Add the "Leaderboard" link
    const leaderboardLink = document.createElement('a');
    leaderboardLink.id = 'Leaderboardmain';
    leaderboardLink.className = 'nav-link';
    leaderboardLink.innerHTML = '<font style="font-family:sans-serif, serif;font-weight: 600;font-size: 18px;">LeaderBoard👑</font>';
    leaderboardLink.style.cursor = 'pointer'; 
    leaderboardLink.addEventListener('click', function() {
        showLeaderboard(); 
    });
    navbar.insertBefore(leaderboardLink, buyPremiumButton);

} else {
    
    buyPremiumButton.style.visibility = 'visible';
}
}

let leaderboardData = []; // Declare leaderboardData globally
let itemsPerPage = 10; // Declare itemsPerPage globally
let leadercurrentPage = 1; // Declare currentPage globally

//leaderBoard logic//////////////////////////////////////////////////////////////////////
// Function to show leaderboard
// Function to show leaderboard
function showLeaderboard() {
leadercurrentPage = 1; // Reset current page when showing leaderboard
// Fetch leaderboard data from backend
const token = localStorage.getItem('token');

axios.get('http://localhost:3000/premium/showLeaderBoard', {
    headers: { 'Authorization': token }
})
.then(response => {
    leaderboardData = response.data; // Get the data directly from the response
    displayLeaderboardPage(leadercurrentPage); // Pass current page only
    document.getElementById('leaderboard-container').style.display = 'block';
    var leaderboardSection = document.getElementById('leaderboard-container');
    leaderboardSection.scrollIntoView({ behavior: 'smooth' });
})
.catch(err => console.error('Error fetching leaderboard:', err));
}

// Function to display leaderboard based on current page
function displayLeaderboardPage(page) {
const leaderboardBody = document.getElementById('leaderboard-body');
leaderboardBody.innerHTML = ''; // Clear previous entries

const startIndex = (page - 1) * itemsPerPage;
const endIndex = page * itemsPerPage;
const currentItems = leaderboardData.slice(startIndex, endIndex);

currentItems.forEach((user, index) => {
    const row = `
        <tr>
            <td>${startIndex + index + 1}</td>
            <td>${user.name}</td>
            <td>${user.total_cost}</td>
        </tr>
    `;
    leaderboardBody.innerHTML += row;
});

// Update pagination controls
document.getElementById('page-info').textContent = `Page ${page}`;
document.getElementById('prev-page').disabled = (page === 1);
document.getElementById('next-page').disabled = (endIndex >= leaderboardData.length);
}

// Pagination controls
document.getElementById('prev-page').addEventListener('click', () => {
if (leadercurrentPage > 1) {
    leadercurrentPage--;
    displayLeaderboardPage(leadercurrentPage);
}
});

document.getElementById('next-page').addEventListener('click', () => {
if ((leadercurrentPage * itemsPerPage) < leaderboardData.length) {
    leadercurrentPage++;
    displayLeaderboardPage(leadercurrentPage);
}
});
//report one 
let allExpenses = {};
let monthlyExpenses = {};
document.getElementById('month-select').addEventListener('change', function () {
    const selectedMonth = this.value;
    displayExpenses(monthlyExpenses[selectedMonth]);
});

function fetchAllExpenses() {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:3000/expenses/getexpense', { headers: { 'Authorization': token } })
        .then(response => {
            if (response.data.success) {
                allExpenses = response.data.expenses;
                organizeExpensesByMonth(allExpenses);
                setDefaultMonth();
            }
        })
        .catch(error => console.error('Error fetching expenses:', error));
}

function organizeExpensesByMonth(expenses) {
    monthlyExpenses = {};
    for (const expenseId in expenses) {
        const expense = expenses[expenseId];
        const month = new Date(expense.createdAt).toLocaleString('en-US', { month: 'short' }).toLowerCase();
        if (!monthlyExpenses[month]) {
            monthlyExpenses[month] = [];
        }
        monthlyExpenses[month].push(expense);
    }
}

function setDefaultMonth() {
    const currentMonth = new Date().toLocaleString('en-US', { month: 'short' }).toLowerCase();
    document.getElementById('month-select').value = currentMonth;
    displayExpenses(monthlyExpenses[currentMonth]);
}

function displayExpenses(expenses) {
    const tbody = document.getElementById('expense-table').querySelector('tbody');
    tbody.innerHTML = ''; // Clear previous data
    let totalAmount = 0;
    
    if (expenses && expenses.length > 0) {
        document.getElementById('no-data-message').style.display = 'none';
        expenses.forEach(expense => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(expense.createdAt).toLocaleDateString()}</td>
                <td>${expense.category}</td>
                <td>${expense.description}</td>
                <td>${expense.amount.toFixed(2)}</td>
            `;
            tbody.appendChild(row);
            totalAmount += expense.amount;
        });
        document.getElementById('total-amount').innerHTML = `Total Amount: ${totalAmount.toFixed(2)}`;
    } else {
        showNoDataMessage('Sorry, no expenses found for this month.');
    }
}

function showNoDataMessage(message) {
    document.getElementById('expense-table').querySelector('tbody').innerHTML = '';
    document.getElementById('total-amount').innerHTML = '';
    const noDataMessage = document.getElementById('no-data-message');
    noDataMessage.textContent = message;
    noDataMessage.style.display = 'block';
}

function downloadExpenses() {
  const token = localStorage.getItem('token');
const downloadButton = document.getElementById('download-expenses');
const spinner = document.getElementById('download-spinner');

downloadButton.disabled = true;
spinner.style.display = 'inline-block';

axios.get("http://localhost:3000/expenses/download", { headers: { 'Authorization': token } })
    .then((response) => {
        if (response.status === 200) {
            var a = document.createElement('a');
            a.href = response.data.fileURL;
            a.download = 'myexpense.csv';
            a.click();
           
        }
    })
    .catch((error) => {
        console.error('Error Downloading expenses:', error);
    })
    .finally(() => {
        downloadButton.disabled = false;
        spinner.style.display = 'none';
    });
}


document.getElementById('download-expenses').onclick = function () {
   
    downloadExpenses();
};
//previous downloads links
function fetchRecentDownloads() {
const token = localStorage.getItem('token');
const recentDownloadsContainer = document.getElementById('recent-downloads');

axios.get("http://localhost:3000/expenses/previousdownloads", { headers: { 'Authorization': token } })
    .then(response => {
        recentDownloadsContainer.innerHTML = ''; 

        if (response.data.success && response.data.downloads.length > 0) {
         
            const header = document.createElement('h5');
            header.textContent = 'Recent Downloads';
            recentDownloadsContainer.appendChild(header);

           
            const downloadList = document.createElement('ul');
            downloadList.classList.add('list-unstyled');
           

            response.data.downloads.slice(0, 5).forEach(download => {
                const listItem = document.createElement('li');
                const createdDate = new Date(download.createdAt);
                const date = createdDate.toLocaleDateString();
                const time = createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                listItem.innerHTML = `<a href="${download.fileURL}" target="_self">Download on ${date} at ${time}</a>`;
                downloadList.appendChild(listItem);
            });

          
            recentDownloadsContainer.appendChild(downloadList);
        } 
       
    })
    .catch(error => console.error('Error fetching recent downloads:', error));
}




//logut button

document.getElementById('logout').addEventListener('click', function() {
localStorage.removeItem('token');
window.location.href = '/Login/login.html'; 
});