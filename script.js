// Global state
let currentPlan = null;
let currentPrice = 0;
let sessionStartTime = null;
let totalDuration = 0; // in seconds
let adminUsers = [
    { phone: '+237 692 123 456', plan: '1h', timeLeft: '45:23', status: 'active' },
    { phone: '+237 699 789 012', plan: '3h', timeLeft: '02:15:47', status: 'active' },
    { phone: '+237 654 321 987', plan: '1d', timeLeft: '18:42:11', status: 'active' },
    { phone: '+237 678 901 234', plan: '1h', timeLeft: '00:00:00', status: 'expired' }
];

// Page navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show target page
    document.getElementById(pageId).classList.add('active');
    
    // Page-specific logic
    if (pageId === 'dashboard') {
        updateDashboard();
    } else if (pageId === 'admin') {
        renderAdminTable();
    }
}

// Plan selection
function selectPlan(plan, price) {
    currentPlan = plan;
    currentPrice = price;
    document.querySelectorAll('.plan-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    
    showPage('payment');
    setTimeout(() => {
        document.getElementById('plan-name').textContent = plan.toUpperCase();
        document.getElementById('plan-price').textContent = price;
    }, 300);
}

// Payment processing (simulation)
function processPayment(method) {
    const phone = document.getElementById('phone').value;
    if (!phone || !currentPlan) {
        alert('Please enter phone number and select a plan');
        return;
    }
    
    // Simulate payment delay
    const btn = event.target;
    btn.textContent = 'Processing...';
    btn.disabled = true;
    
    setTimeout(() => {
        localStorage.setItem('phone', phone);
        localStorage.setItem('currentPlan', currentPlan);
        localStorage.setItem('currentPrice', currentPrice);
        localStorage.setItem('paymentMethod', method);
        
        btn.textContent = 'Payment Successful!';
        btn.style.background = '#48bb78';
        
        setTimeout(() => {
            showPage('success');
            updateSuccessPage();
        }, 1500);
    }, 2000);
}

// Success page update
function updateSuccessPage() {
    const duration = currentPlan === '1h' ? 3600 : currentPlan === '3h' ? 10800 : 86400;
    document.getElementById('success-time').textContent = `You now have ${currentPlan.toUpperCase()} access.`;
}

// Start session
function startSession() {
    sessionStartTime = Date.now();
    totalDuration = currentPlan === '1h' ? 3600 : currentPlan === '3h' ? 10800 : 86400;
    localStorage.setItem('sessionStart', sessionStartTime);
    localStorage.setItem('totalDuration', totalDuration);
    
    showPage('dashboard');
    startTimer();
}

// Dashboard and timer
let timerInterval;
function updateDashboard() {
    const phone = localStorage.getItem('phone');
    const plan = localStorage.getItem('currentPlan') || 'None';
    const startTime = parseInt(localStorage.getItem('sessionStart'));
    const duration = parseInt(localStorage.getItem('totalDuration'));
    
    document.getElementById('dashboard-plan').textContent = plan || 'No active plan';
    
    if (startTime &amp;&amp; duration) {
        updateTimer();
    } else {
        document.getElementById('session-status').textContent = 'No Active Session';
        document.getElementById('session-status').className = '';
        document.getElementById('remaining-time').textContent = '00:00:00';
        if (timerInterval) clearInterval(timerInterval);
    }
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    updateTimer();
}

function updateTimer() {
    if (!sessionStartTime || !totalDuration) return;
    
    const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
    let remaining = totalDuration - elapsed;
    
    if (remaining < 0) {
        remaining = 0;
        document.getElementById('session-status').textContent = 'Expired';
        document.getElementById('session-status').className = 'status-expired';
        document.getElementById('warning').classList.add('hidden');
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        return;
    }
    
    document.getElementById('session-status').textContent = 'Active';
    document.getElementById('session-status').className = 'status-active';
    
    // Warning for last 5 minutes
    if (remaining <= 300) {
        document.getElementById('warning').classList.remove('hidden');
        if (remaining <= 60) {
            document.getElementById('warning').textContent = '⏰ Session ending soon!';
        }
    } else {
        document.getElementById('warning').classList.add('hidden');
    }
    
    // Format time
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;
    document.getElementById('remaining-time').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function refreshStatus() {
    updateDashboard();
    updateTimer();
}

function logout() {
    if (confirm('Logout and clear session?')) {
        localStorage.clear();
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        showPage('welcome');
    }
}

// Admin table
function renderAdminTable() {
    const tbody = document.getElementById('admin-users');
    tbody.innerHTML = '';
    
    adminUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.phone}</td>
            <td>${user.plan}</td>
            <td>${user.timeLeft}</td>
            <td class="${user.status === 'active' ? 'status-active' : 'status-expired'}">${user.status}</td>
        `;
        tbody.appendChild(row);
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Check for existing session
    const startTime = localStorage.getItem('sessionStart');
    if (startTime) {
        sessionStartTime = parseInt(startTime);
        totalDuration = parseInt(localStorage.getItem('totalDuration'));
        showPage('dashboard');
        startTimer();
    } else {
        showPage('welcome');
    }
});

