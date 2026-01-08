// ========================================
// Biswajith Tracker - Main Application Logic
// ========================================

// Data Storage
let disciplines = [];
let currentEditId = null;
let currentCheckinId = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    loadDisciplines();
    renderDisciplines();
    updateStatistics();
    attachEventListeners();
});

// ========================================
// Local Storage Functions
// ========================================
function loadDisciplines() {
    const stored = localStorage.getItem('biswajithDisciplines');
    if (stored) {
        disciplines = JSON.parse(stored);
    }
}

function saveDisciplines() {
    localStorage.setItem('biswajithDisciplines', JSON.stringify(disciplines));
}

// ========================================
// Event Listeners
// ========================================
function attachEventListeners() {
    // Add Discipline Button
    document.getElementById('addDisciplineBtn').addEventListener('click', openAddModal);
    
    // Modal Close Buttons
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('closeCheckin').addEventListener('click', closeCheckinModal);
    document.getElementById('closeDetail').addEventListener('click', closeDetailModal);
    
    // Form Submit
    document.getElementById('disciplineForm').addEventListener('submit', handleFormSubmit);
    
    // Check-in Actions
    document.getElementById('markCompletedBtn').addEventListener('click', () => markCheckin(true));
    document.getElementById('markMissedBtn').addEventListener('click', () => markCheckin(false));
    
    // Close modals on background click
    document.getElementById('disciplineModal').addEventListener('click', (e) => {
        if (e.target.id === 'disciplineModal') closeModal();
    });
    document.getElementById('checkinModal').addEventListener('click', (e) => {
        if (e.target.id === 'checkinModal') closeCheckinModal();
    });
    document.getElementById('detailModal').addEventListener('click', (e) => {
        if (e.target.id === 'detailModal') closeDetailModal();
    });
}

// ========================================
// Modal Functions
// ========================================
function openAddModal() {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'Add New Discipline';
    document.getElementById('submitBtnText').textContent = 'Create Discipline';
    document.getElementById('disciplineForm').reset();
    document.getElementById('disciplineModal').classList.add('show');
}

function openEditModal(id) {
    const discipline = disciplines.find(d => d.id === id);
    if (!discipline) return;
    
    currentEditId = id;
    document.getElementById('modalTitle').textContent = 'Edit Discipline';
    document.getElementById('submitBtnText').textContent = 'Update Discipline';
    
    // Populate form
    document.getElementById('disciplineName').value = discipline.name;
    document.getElementById('purpose').value = discipline.purpose;
    document.getElementById('dailyAction').value = discipline.dailyAction;
    document.getElementById('timeFrequency').value = discipline.timeFrequency;
    document.getElementById('minimumRequirement').value = discipline.minimumRequirement;
    document.getElementById('trackingMethod').value = discipline.trackingMethod;
    document.getElementById('streakRule').value = discipline.streakRule;
    document.getElementById('reminder').value = discipline.reminder;
    document.getElementById('difficulty').value = discipline.difficulty;
    document.getElementById('reward').value = discipline.reward || '';
    document.getElementById('penalty').value = discipline.penalty || '';
    
    document.getElementById('disciplineModal').classList.add('show');
}

function closeModal() {
    document.getElementById('disciplineModal').classList.remove('show');
    currentEditId = null;
}

function openCheckinModal(id) {
    const discipline = disciplines.find(d => d.id === id);
    if (!discipline) return;
    
    currentCheckinId = id;
    
    const today = new Date().toDateString();
    const todayHistory = discipline.history?.find(h => new Date(h.date).toDateString() === today);
    
    if (todayHistory) {
        alert('You have already checked in for today! ✅');
        return;
    }
    
    document.getElementById('checkinDisciplineInfo').innerHTML = `
        <h3>${discipline.name}</h3>
        <p>${discipline.dailyAction}</p>
        <p style="margin-top: 0.5rem;"><strong>Current Streak:</strong> ${discipline.currentStreak || 0} days 🔥</p>
    `;
    
    document.getElementById('progressNotes').value = '';
    document.getElementById('checkinModal').classList.add('show');
}

function closeCheckinModal() {
    document.getElementById('checkinModal').classList.remove('show');
    currentCheckinId = null;
}

function openDetailModal(id) {
    const discipline = disciplines.find(d => d.id === id);
    if (!discipline) return;
    
    document.getElementById('detailTitle').textContent = discipline.name;
    
    const history = discipline.history || [];
    const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let historyHTML = '';
    if (sortedHistory.length > 0) {
        historyHTML = sortedHistory.map(entry => `
            <div class="history-entry">
                <div class="history-entry-header">
                    <span class="history-date">${formatDate(entry.date)}</span>
                    <span class="history-status ${entry.completed ? 'status-completed' : 'status-missed'}">
                        ${entry.completed ? '✔ Completed' : '✘ Missed'}
                    </span>
                </div>
                ${entry.notes ? `<p class="history-notes">"${entry.notes}"</p>` : ''}
            </div>
        `).join('');
    } else {
        historyHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No check-in history yet. Start your journey today!</p>';
    }
    
    document.getElementById('detailContent').innerHTML = `
        <div class="detail-section">
            <h3>📋 Purpose</h3>
            <p>${discipline.purpose}</p>
        </div>
        
        <div class="detail-section">
            <h3>✅ Daily Action</h3>
            <p>${discipline.dailyAction}</p>
        </div>
        
        <div class="detail-section">
            <h3>⏰ Time / Frequency</h3>
            <p>${discipline.timeFrequency}</p>
        </div>
        
        <div class="detail-section">
            <h3>🎯 Minimum Requirement</h3>
            <p>${discipline.minimumRequirement}</p>
        </div>
        
        <div class="detail-section">
            <h3>📊 Tracking Method</h3>
            <p>${getTrackingMethodLabel(discipline.trackingMethod)}</p>
        </div>
        
        <div class="detail-section">
            <h3>🔥 Streak Rule</h3>
            <p>${discipline.streakRule}</p>
        </div>
        
        <div class="detail-section">
            <h3>🔔 Reminder / Trigger</h3>
            <p>${discipline.reminder}</p>
        </div>
        
        ${discipline.reward ? `
            <div class="detail-section">
                <h3>🎁 Reward</h3>
                <p>${discipline.reward}</p>
            </div>
        ` : ''}
        
        ${discipline.penalty ? `
            <div class="detail-section">
                <h3>⚠️ Penalty</h3>
                <p>${discipline.penalty}</p>
            </div>
        ` : ''}
        
        <div class="detail-section">
            <h3>📅 Check-in History</h3>
            ${historyHTML}
        </div>
    `;
    
    document.getElementById('detailModal').classList.add('show');
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('show');
}

// ========================================
// Form Handling
// ========================================
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: currentEditId || generateId(),
        name: document.getElementById('disciplineName').value,
        purpose: document.getElementById('purpose').value,
        dailyAction: document.getElementById('dailyAction').value,
        timeFrequency: document.getElementById('timeFrequency').value,
        minimumRequirement: document.getElementById('minimumRequirement').value,
        trackingMethod: document.getElementById('trackingMethod').value,
        streakRule: document.getElementById('streakRule').value,
        reminder: document.getElementById('reminder').value,
        difficulty: document.getElementById('difficulty').value,
        reward: document.getElementById('reward').value,
        penalty: document.getElementById('penalty').value,
        createdAt: currentEditId ? disciplines.find(d => d.id === currentEditId).createdAt : new Date().toISOString(),
        currentStreak: currentEditId ? disciplines.find(d => d.id === currentEditId).currentStreak : 0,
        longestStreak: currentEditId ? disciplines.find(d => d.id === currentEditId).longestStreak : 0,
        history: currentEditId ? disciplines.find(d => d.id === currentEditId).history : []
    };
    
    if (currentEditId) {
        const index = disciplines.findIndex(d => d.id === currentEditId);
        disciplines[index] = formData;
    } else {
        disciplines.push(formData);
    }
    
    saveDisciplines();
    renderDisciplines();
    updateStatistics();
    closeModal();
    
    showNotification(currentEditId ? 'Discipline updated successfully! ✨' : 'Discipline created successfully! 🎉');
}

// ========================================
// Check-in Handling
// ========================================
function markCheckin(completed) {
    const discipline = disciplines.find(d => d.id === currentCheckinId);
    if (!discipline) return;
    
    const notes = document.getElementById('progressNotes').value;
    const today = new Date();
    
    if (!discipline.history) {
        discipline.history = [];
    }
    
    // Add today's entry
    discipline.history.push({
        date: today.toISOString(),
        completed: completed,
        notes: notes
    });
    
    // Update streak
    if (completed) {
        discipline.currentStreak = (discipline.currentStreak || 0) + 1;
        if (discipline.currentStreak > (discipline.longestStreak || 0)) {
            discipline.longestStreak = discipline.currentStreak;
        }
    } else {
        discipline.currentStreak = 0;
    }
    
    saveDisciplines();
    renderDisciplines();
    updateStatistics();
    closeCheckinModal();
    
    if (completed) {
        showNotification(`Great job! Current streak: ${discipline.currentStreak} days! 🔥`);
    } else {
        showNotification('Marked as missed. Tomorrow is a new opportunity! 💪');
    }
}

// ========================================
// Delete Discipline
// ========================================
function deleteDiscipline(id) {
    const discipline = disciplines.find(d => d.id === id);
    if (!discipline) return;
    
    if (confirm(`Are you sure you want to delete "${discipline.name}"? This action cannot be undone.`)) {
        disciplines = disciplines.filter(d => d.id !== id);
        saveDisciplines();
        renderDisciplines();
        updateStatistics();
        showNotification('Discipline deleted successfully.');
    }
}

// ========================================
// Render Functions
// ========================================
function renderDisciplines() {
    const grid = document.getElementById('disciplinesGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (disciplines.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.add('show');
        return;
    }
    
    emptyState.classList.remove('show');
    
    grid.innerHTML = disciplines.map(discipline => {
        const today = new Date().toDateString();
        const todayHistory = discipline.history?.find(h => new Date(h.date).toDateString() === today);
        const canCheckIn = !todayHistory;
        
        return `
            <div class="discipline-card" style="animation-delay: ${Math.random() * 0.2}s">
                <div class="discipline-header">
                    <div>
                        <h3 class="discipline-title">${discipline.name}</h3>
                        <span class="difficulty-badge difficulty-${discipline.difficulty}">
                            ${discipline.difficulty}
                        </span>
                    </div>
                </div>
                
                <p class="discipline-purpose">${discipline.purpose}</p>
                
                <div class="discipline-meta">
                    <div class="meta-item">
                        <span class="meta-icon">⏰</span>
                        <span>${discipline.timeFrequency}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-icon">🎯</span>
                        <span>${discipline.minimumRequirement}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-icon">🔔</span>
                        <span>${discipline.reminder}</span>
                    </div>
                </div>
                
                <div class="streak-display">
                    <div class="streak-number">${discipline.currentStreak || 0}</div>
                    <div class="streak-label">
                        Day Streak 🔥
                        ${todayHistory ? (todayHistory.completed ? '<br><span style="color: #4caf50;">✔ Completed Today</span>' : '<br><span style="color: #f44336;">✘ Missed Today</span>') : ''}
                    </div>
                </div>
                
                <div class="card-actions">
                    <button class="btn-small btn-checkin" onclick="openCheckinModal('${discipline.id}')" ${!canCheckIn ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                        ${canCheckIn ? '✔ Check-in' : '✓ Done Today'}
                    </button>
                    <button class="btn-small btn-view" onclick="openDetailModal('${discipline.id}')">
                        👁️ View
                    </button>
                    <button class="btn-small btn-edit" onclick="openEditModal('${discipline.id}')">
                        ✏️ Edit
                    </button>
                    <button class="btn-small btn-delete" onclick="deleteDiscipline('${discipline.id}')">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function updateStatistics() {
    const totalDisciplines = disciplines.length;
    const activeStreaks = disciplines.filter(d => (d.currentStreak || 0) > 0).length;
    const longestStreak = Math.max(...disciplines.map(d => d.longestStreak || 0), 0);
    
    const today = new Date().toDateString();
    const completedToday = disciplines.filter(d => {
        const todayHistory = d.history?.find(h => new Date(h.date).toDateString() === today);
        return todayHistory?.completed;
    }).length;
    
    document.getElementById('totalDisciplines').textContent = totalDisciplines;
    document.getElementById('activeStreaks').textContent = activeStreaks;
    document.getElementById('completedToday').textContent = completedToday;
    document.getElementById('longestStreak').textContent = longestStreak;
}

// ========================================
// Utility Functions
// ========================================
function generateId() {
    return 'discipline_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function getTrackingMethodLabel(method) {
    const labels = {
        'checkmark': '✔ Completed / ✘ Missed',
        'time': 'Time Spent (minutes)',
        'percentage': 'Percentage Completion'
    };
    return labels[method] || method;
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideInRight 0.4s ease;
        font-weight: 600;
        max-width: 400px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 400);
    }, 3000);
}

// Add animation keyframes dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);
