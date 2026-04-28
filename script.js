// Game State
let gameState = {
    balance: 250.00,
    selectedNumbers: [],
    tickets: [],
    totalWinnings: 0.00,
    drawResults: [
        { draw: 1001, numbers: [12, 24, 35, 41, 47, 49], date: '2026-04-25' },
        { draw: 1000, numbers: [5, 18, 28, 33, 42, 45], date: '2026-04-18' },
        { draw: 999, numbers: [3, 19, 29, 37, 43, 48], date: '2026-04-11' }
    ]
};

// User state
let currentUser = null;
let isLoggedIn = false;

// Load game state from localStorage
function loadGameState() {
    const saved = localStorage.getItem('luckyLottoState');
    if (saved) {
        gameState = JSON.parse(saved);
    }
}

// Load user from localStorage
function loadUser() {
    const user = localStorage.getItem('luckyLottoUser');
    if (user) {
        currentUser = JSON.parse(user);
        isLoggedIn = true;
        updateUserDisplay();
    }
}

// Save game state to localStorage
function saveGameState() {
    localStorage.setItem('luckyLottoState', JSON.stringify(gameState));
}

// Save user to localStorage
function saveUser() {
    if (currentUser) {
        localStorage.setItem('luckyLottoUser', JSON.stringify(currentUser));
    }
}

// Initialize the game
function initGame() {
    loadUser();
    
    // If not logged in, show login section
    if (!isLoggedIn) {
        showSection('login');
    } else {
        loadGameState();
        createNumberGrid();
        updateBalance();
        updateTicketCount();
        updateWinnings();
        displayMyTickets();
        showSection('home');
    }
}

// Update user display
function updateUserDisplay() {
    const userDisplayName = document.getElementById('userDisplayName');
    if (userDisplayName && currentUser) {
        userDisplayName.textContent = currentUser.name;
    }
}

// Show/Hide sections
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Switch login tabs
function switchLoginTab(tab) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.login-tab');
    tabs.forEach(t => t.classList.remove('active'));
    
    // Hide all buttons active state
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(b => b.classList.remove('active'));
    
    // Show selected tab and button
    const selectedTab = document.getElementById(tab + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Mark button as active
    event.target.classList.add('active');
    
    // Clear messages
    document.getElementById('signin-message').className = 'message';
    document.getElementById('signup-message').className = 'message';
}

// Handle Sign In
function handleSignIn(event) {
    event.preventDefault();
    
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    const messageDiv = document.getElementById('signin-message');
    
    // Validate inputs
    if (!email || !password) {
        showLoginMessage(messageDiv, 'Please fill in all fields', 'error');
        return;
    }
    
    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem('luckyLottoUsers') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Login successful
        currentUser = {
            name: user.name,
            email: user.email
        };
        isLoggedIn = true;
        saveUser();
        loadGameState();
        updateUserDisplay();
        
        showLoginMessage(messageDiv, '✅ Sign in successful! Redirecting...', 'success');
        
        setTimeout(() => {
            createNumberGrid();
            updateBalance();
            updateTicketCount();
            updateWinnings();
            displayMyTickets();
            showSection('home');
        }, 1000);
    } else {
        showLoginMessage(messageDiv, '❌ Invalid email or password', 'error');
    }
}

// Handle Sign Up
function handleSignUp(event) {
    event.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    const messageDiv = document.getElementById('signup-message');
    
    // Validate inputs
    if (!name || !email || !password || !confirm) {
        showLoginMessage(messageDiv, 'Please fill in all fields', 'error');
        return;
    }
    
    if (password.length < 6) {
        showLoginMessage(messageDiv, 'Password must be at least 6 characters', 'error');
        return;
    }
    
    if (password !== confirm) {
        showLoginMessage(messageDiv, 'Passwords do not match', 'error');
        return;
    }
    
    // Check if email already exists
    const users = JSON.parse(localStorage.getItem('luckyLottoUsers') || '[]');
    if (users.some(u => u.email === email)) {
        showLoginMessage(messageDiv, 'Email already registered', 'error');
        return;
    }
    
    // Create new user
    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('luckyLottoUsers', JSON.stringify(users));
    
    // Auto login
    currentUser = { name, email };
    isLoggedIn = true;
    saveUser();
    
    showLoginMessage(messageDiv, '✅ Account created! Redirecting...', 'success');
    
    setTimeout(() => {
        createNumberGrid();
        updateBalance();
        updateTicketCount();
        updateWinnings();
        displayMyTickets();
        updateUserDisplay();
        showSection('home');
    }, 1000);
}

// Show login message
function showLoginMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
}

// Create number grid (1-49)
function createNumberGrid() {
    const grid = document.getElementById('numberGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    for (let i = 1; i <= 49; i++) {
        const btn = document.createElement('button');
        btn.className = 'number-btn';
        btn.textContent = i;
        
        if (gameState.selectedNumbers.includes(i)) {
            btn.classList.add('selected');
        }
        
        btn.onclick = () => toggleNumber(i, btn);
        grid.appendChild(btn);
    }
}

// Toggle number selection
function toggleNumber(num, btn) {
    if (gameState.selectedNumbers.includes(num)) {
        gameState.selectedNumbers = gameState.selectedNumbers.filter(n => n !== num);
        btn.classList.remove('selected');
    } else {
        if (gameState.selectedNumbers.length < 6) {
            gameState.selectedNumbers.push(num);
            gameState.selectedNumbers.sort((a, b) => a - b);
            btn.classList.add('selected');
        } else {
            showMessage('You can only select 6 numbers!', 'error');
        }
    }
    
    updateSelectedDisplay();
}

// Update selected numbers display
function updateSelectedDisplay() {
    const display = document.getElementById('selectedDisplay');
    
    if (gameState.selectedNumbers.length === 0) {
        display.innerHTML = '<span class="empty-state">No numbers selected yet</span>';
    } else {
        display.innerHTML = gameState.selectedNumbers
            .map(num => `<span class="selected-number">${num}</span>`)
            .join('');
    }
}

// Clear all selections
function clearNumbers() {
    gameState.selectedNumbers = [];
    createNumberGrid();
    updateSelectedDisplay();
}

// Generate random numbers
function generateRandom() {
    gameState.selectedNumbers = [];
    const numbers = new Set();
    
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 49) + 1);
    }
    
    gameState.selectedNumbers = Array.from(numbers).sort((a, b) => a - b);
    createNumberGrid();
    updateSelectedDisplay();
}

// Submit ticket
function submitTicket() {
    if (gameState.selectedNumbers.length !== 6) {
        showMessage('Please select exactly 6 numbers!', 'error');
        return;
    }
    
    if (gameState.balance < 5) {
        showMessage('Insufficient balance! You need $5 to buy a ticket.', 'error');
        return;
    }
    
    // Deduct balance
    gameState.balance -= 5;
    
    // Create ticket
    const ticket = {
        id: gameState.tickets.length + 1,
        numbers: [...gameState.selectedNumbers],
        date: new Date().toLocaleDateString(),
        cost: 5.00,
        winnings: 0
    };
    
    gameState.tickets.push(ticket);
    
    // Check for winnings immediately (simulated)
    checkWinnings(ticket);
    
    // Save state
    saveGameState();
    
    // Update UI
    updateBalance();
    updateTicketCount();
    updateWinnings();
    displayMyTickets();
    
    // Clear selections
    gameState.selectedNumbers = [];
    createNumberGrid();
    updateSelectedDisplay();
    
    showMessage('🎉 Ticket purchased successfully! Cost: $5.00', 'success');
}

// Check for winnings
function checkWinnings(ticket) {
    // Use the latest draw
    const latestDraw = gameState.drawResults[0];
    
    let matches = 0;
    ticket.numbers.forEach(num => {
        if (latestDraw.numbers.includes(num)) {
            matches++;
        }
    });
    
    let prize = 0;
    switch(matches) {
        case 6:
            prize = 500000;
            break;
        case 5:
            prize = 50000;
            break;
        case 4:
            prize = 5000;
            break;
        case 3:
            prize = 500;
            break;
        default:
            prize = 0;
    }
    
    ticket.winnings = prize;
    ticket.matches = matches;
    
    if (prize > 0) {
        gameState.balance += prize;
        gameState.totalWinnings += prize;
    }
}

// Update balance display
function updateBalance() {
    document.getElementById('balance').textContent = gameState.balance.toFixed(2);
}

// Update ticket count
function updateTicketCount() {
    document.getElementById('ticketCount').textContent = gameState.tickets.length;
}

// Update winnings display
function updateWinnings() {
    document.getElementById('winnings').textContent = gameState.totalWinnings.toFixed(2);
}

// Display my tickets
function displayMyTickets() {
    const ticketsList = document.getElementById('myTickets');
    
    if (gameState.tickets.length === 0) {
        ticketsList.innerHTML = '<p class="empty-state">No tickets purchased yet</p>';
        return;
    }
    
    let html = '';
    gameState.tickets.forEach((ticket, index) => {
        const numbersStr = ticket.numbers.join(', ');
        let winningInfo = '';
        
        if (ticket.matches && ticket.matches > 0) {
            winningInfo = ` ✅ Won $${ticket.winnings.toFixed(2)} (${ticket.matches} matches)`;
        }
        
        html += `
            <div class="ticket-item">
                <div>
                    <div class="ticket-numbers">#${ticket.id}: ${numbersStr}</div>
                    <div class="ticket-date">${ticket.date}${winningInfo}</div>
                </div>
                <div>$${ticket.cost.toFixed(2)}</div>
            </div>
        `;
    });
    
    ticketsList.innerHTML = html;
}

// Add funds
function addFunds() {
    const amount = prompt('How much would you like to add? (minimum $10):');
    
    if (amount === null) return;
    
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount < 10) {
        showMessage('Please enter a valid amount ($10 or more)', 'error');
        return;
    }
    
    gameState.balance += numAmount;
    saveGameState();
    updateBalance();
    showMessage(`✅ Added $${numAmount.toFixed(2)} to your balance!`, 'success');
}

// Show message
function showMessage(message, type) {
    const messageDiv = document.getElementById('ticketMessage');
    if (!messageDiv) return;
    
    messageDiv.textContent = message;
    messageDiv.className = `message show ${type}`;
    
    setTimeout(() => {
        messageDiv.classList.remove('show');
    }, 3000);
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        saveGameState();
        localStorage.removeItem('luckyLottoUser');
        isLoggedIn = false;
        currentUser = null;
        gameState = {
            balance: 250.00,
            selectedNumbers: [],
            tickets: [],
            totalWinnings: 0.00,
            drawResults: [
                { draw: 1001, numbers: [12, 24, 35, 41, 47, 49], date: '2026-04-25' },
                { draw: 1000, numbers: [5, 18, 28, 33, 42, 45], date: '2026-04-18' },
                { draw: 999, numbers: [3, 19, 29, 37, 43, 48], date: '2026-04-11' }
            ]
        };
        showSection('login');
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', initGame);
