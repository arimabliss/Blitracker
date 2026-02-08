// ========================================
// BliTracker - Enhanced Application Logic
// with Theme Switching and Analytics
// ========================================

// Data Storage
let disciplines = [];
let currentEditId = null;
let currentCheckinId = null;
let charts = {
    weekly: null,
    completion: null,
    streak: null
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    loadDisciplines();
    loadTheme();
    renderDisciplines();
    updateStatistics();
    initializeCharts();
    attachEventListeners();
    setupThemeSwitcher();
});

// ========================================
// Theme Management
// ========================================
function setupThemeSwitcher() {
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            setTheme(theme);
        });
    });
}

function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('selectedTheme', theme);
    
    // Update charts with theme colors
    setTimeout(() => {
        updateCharts();
    }, 300);
    
    showNotification(`Theme changed to ${theme === 'robotic' ? 'Robotic Black' : theme === 'pink' ? 'Aesthetic Pink' : 'High-Tech Jarvis'}! 🎨`);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('selectedTheme') || 'robotic';
    document.body.setAttribute('data-theme', savedTheme);
}

function getThemeColors() {
    const theme = document.body.getAttribute('data-theme');
    
    const themes = {
        robotic: {
            primary: 'rgba(102, 126, 234, 1)',
            secondary: 'rgba(0, 212, 255, 1)',
            success: 'rgba(0, 242, 254, 1)',
            danger: 'rgba(250, 112, 154, 1)',
            background: 'rgba(26, 26, 42, 0.8)',
            text: 'rgba(184, 184, 209, 1)',
            gridColor: 'rgba(102, 126, 234, 0.1)'
        },
        pink: {
            primary: 'rgba(240, 147, 251, 1)',
            secondary: 'rgba(245, 87, 108, 1)',
            success: 'rgba(254, 214, 227, 1)',
            danger: 'rgba(255, 154, 158, 1)',
            background: 'rgba(58, 42, 52, 0.8)',
            text: 'rgba(255, 179, 217, 1)',
            gridColor: 'rgba(240, 147, 251, 0.1)'
        },
        jarvis: {
            primary: 'rgba(0, 212, 255, 1)',
            secondary: 'rgba(0, 255, 198, 1)',
            success: 'rgba(0, 255, 157, 1)',
            danger: 'rgba(255, 51, 102, 1)',
            background: 'rgba(0, 53, 102, 0.8)',
            text: 'rgba(152, 193, 217, 1)',
            gridColor: 'rgba(0, 212, 255, 0.1)'
        }
    };
    
    return themes[theme] || themes.robotic;
}

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
// Chart Initialization
// ========================================
function initializeCharts() {
    const colors = getThemeColors();
    
    // Weekly Progress Chart
    const weeklyCtx = document.getElementById('weeklyChart').getContext('2d');
    charts.weekly = new Chart(weeklyCtx, {
        type: 'bar',
        data: {
            labels: getLast7Days(),
            datasets: [{
                label: 'Completed',
                data: getWeeklyData(),
                backgroundColor: createGradient(weeklyCtx, colors.primary),
                borderColor: colors.primary,
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: colors.background,
                    titleColor: colors.text,
                    bodyColor: colors.text,
                    borderColor: colors.primary,
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `Completed: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: colors.text,
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: colors.gridColor,
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        color: colors.text,
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Completion Rate Chart
    const completionCtx = document.getElementById('completionChart').getContext('2d');
    const completionData = getCompletionData();
    charts.completion = new Chart(completionCtx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Missed', 'Pending'],
            datasets: [{
                data: [completionData.completed, completionData.missed, completionData.pending],
                backgroundColor: [
                    colors.success,
                    colors.danger,
                    colors.text + '40'
                ],
                borderColor: colors.background,
                borderWidth: 3,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: colors.text,
                        padding: 15,
                        font: {
                            size: 12,
                            weight: 600
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: colors.background,
                    titleColor: colors.text,
                    bodyColor: colors.text,
                    borderColor: colors.primary,
                    borderWidth: 1,
                    padding: 12
                }
            }
        }
    });
    
    // Streak Trends Chart
    const streakCtx = document.getElementById('streakChart').getContext('2d');
    charts.streak = new Chart(streakCtx, {
        type: 'line',
        data: {
            labels: getLast30Days(),
            datasets: [{
                label: 'Average Streak',
                data: getStreakTrendData(),
                borderColor: colors.primary,
                backgroundColor: createGradient(streakCtx, colors.primary, true),
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: colors.primary,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: colors.background,
                    titleColor: colors.text,
                    bodyColor: colors.text,
                    borderColor: colors.primary,
                    borderWidth: 1,
                    padding: 12
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: colors.text,
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: colors.gridColor,
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        color: colors.text,
                        maxRotation: 45,
                        minRotation: 45,
                        font: {
                            size: 10
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Generate Heatmap
    generateHeatmap();
}

function createGradient(ctx, color, vertical = false) {
    const gradient = vertical 
        ? ctx.createLinearGradient(0, 0, 0, 400)
        : ctx.createLinearGradient(0, 0, 0, 400);
    
    const rgb = color.match(/\d+/g);
    if (rgb) {
        gradient.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.8)`);
        gradient.addColorStop(1, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.1)`);
    }
    
    return gradient;
}

function updateCharts() {
    if (charts.weekly) {
        const colors = getThemeColors();
        charts.weekly.data.datasets[0].backgroundColor = createGradient(
            charts.weekly.ctx,
            colors.primary
        );
        charts.weekly.data.datasets[0].borderColor = colors.primary;
        charts.weekly.options.scales.y.ticks.color = colors.text;
        charts.weekly.options.scales.x.ticks.color = colors.text;
        charts.weekly.options.scales.y.grid.color = colors.gridColor;
        charts.weekly.update();
    }
    
    if (charts.completion) {
        const colors = getThemeColors();
        charts.completion.data.datasets[0].backgroundColor = [
            colors.success,
            colors.danger,
            colors.text + '40'
        ];
        charts.completion.options.plugins.legend.labels.color = colors.text;
        charts.completion.update();
    }
    
    if (charts.streak) {
        const colors = getThemeColors();
        charts.streak.data.datasets[0].borderColor = colors.primary;
        charts.streak.data.datasets[0].backgroundColor = createGradient(
            charts.streak.ctx,
            colors.primary,
            true
        );
        charts.streak.data.datasets[0].pointBackgroundColor = colors.primary;
        charts.streak.options.scales.y.ticks.color = colors.text;
        charts.streak.options.scales.x.ticks.color = colors.text;
        charts.streak.options.scales.y.grid.color = colors.gridColor;
        charts.streak.update();
    }
    
    generateHeatmap();
}

// ========================================
// Chart Data Functions
// ========================================
function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    return days;
}

function getLast30Days() {
    const days = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return days;
}

function getWeeklyData() {
    const data = new Array(7).fill(0);
    
    disciplines.forEach(discipline => {
        if (discipline.history) {
            discipline.history.forEach(entry => {
                const entryDate = new Date(entry.date);
                const today = new Date();
                const diffDays = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
                
                if (diffDays >= 0 && diffDays < 7 && entry.completed) {
                    data[6 - diffDays]++;
                }
            });
        }
    });
    
    return data;
}

function getCompletionData() {
    let completed = 0;
    let missed = 0;
    let pending = disciplines.length;
    
    const today = new Date().toDateString();
    
    disciplines.forEach(discipline => {
        const todayHistory = discipline.history?.find(h => 
            new Date(h.date).toDateString() === today
        );
        
        if (todayHistory) {
            pending--;
            if (todayHistory.completed) {
                completed++;
            } else {
                missed++;
            }
        }
    });
    
    return { completed, missed, pending };
}

function getStreakTrendData() {
    const data = new Array(30).fill(0);
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        
        let dayTotal = 0;
        let count = 0;
        
        disciplines.forEach(discipline => {
            if (discipline.history) {
                const dayHistory = discipline.history.filter(h => {
                    const entryDate = new Date(h.date);
                    return entryDate.toDateString() === dateStr;
                });
                
                if (dayHistory.length > 0 && dayHistory[0].completed) {
                    dayTotal += (discipline.currentStreak || 0);
                    count++;
                }
            }
        });
        
        data[29 - i] = count > 0 ? Math.round(dayTotal / count) : 0;
    }
    
    return data;
}

function generateHeatmap() {
    const container = document.getElementById('heatmapContainer');
    container.innerHTML = '';
    
    // Generate last 28 days (4 weeks)
    for (let i = 27; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        
        let completedCount = 0;
        disciplines.forEach(discipline => {
            const dayHistory = discipline.history?.find(h => 
                new Date(h.date).toDateString() === dateStr
            );
            if (dayHistory && dayHistory.completed) {
                completedCount++;
            }
        });
        
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        
        const maxDisciplines = disciplines.length || 1;
        const intensity = completedCount / maxDisciplines;
        
        if (intensity > 0.75) {
            cell.classList.add('active-max');
        } else if (intensity > 0.5) {
            cell.classList.add('active-high');
        } else if (intensity > 0.25) {
            cell.classList.add('active-medium');
        } else if (intensity > 0) {
            cell.classList.add('active-low');
        }
        
        cell.title = `${date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        })}: ${completedCount}/${disciplines.length} completed`;
        
        container.appendChild(cell);
    }
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
        showNotification('You have already checked in for today! ✅');
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
// Form Submit Handler
// ========================================
function handleFormSubmit(e) {
    e.preventDefault();
    
    const disciplineData = {
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
        currentStreak: 0,
        longestStreak: 0,
        history: []
    };
    
    if (currentEditId) {
        const index = disciplines.findIndex(d => d.id === currentEditId);
        if (index !== -1) {
            // Preserve streak and history data
            disciplineData.currentStreak = disciplines[index].currentStreak;
            disciplineData.longestStreak = disciplines[index].longestStreak;
            disciplineData.history = disciplines[index].history;
            disciplines[index] = disciplineData;
        }
        showNotification('Discipline updated successfully! 🎉');
    } else {
        disciplines.push(disciplineData);
        showNotification('New discipline created successfully! 🎉');
    }
    
    saveDisciplines();
    renderDisciplines();
    updateStatistics();
    updateCharts();
    closeModal();
}

// ========================================
// Check-in Handler
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
    updateCharts();
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
        updateCharts();
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
    
    grid.innerHTML = disciplines.map((discipline, index) => {
        const today = new Date().toDateString();
        const todayHistory = discipline.history?.find(h => new Date(h.date).toDateString() === today);
        const canCheckIn = !todayHistory;
        
        return `
            <div class="discipline-card" style="animation-delay: ${index * 0.1}s">
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
    
    // Update stat numbers with animation
    animateValue('totalDisciplines', 0, totalDisciplines, 1000);
    animateValue('activeStreaks', 0, activeStreaks, 1000);
    animateValue('completedToday', 0, completedToday, 1000);
    animateValue('longestStreak', 0, longestStreak, 1000);
    
    // Update progress bars
    updateProgressBar('totalProgress', totalDisciplines / 10);
    updateProgressBar('activeProgress', activeStreaks / totalDisciplines);
    updateProgressBar('completedProgress', completedToday / totalDisciplines);
    updateProgressBar('longestProgress', longestStreak / 30);
}

function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, 16);
}

function updateProgressBar(id, percentage) {
    const bar = document.getElementById(id);
    const width = Math.min(percentage * 100, 100);
    setTimeout(() => {
        bar.style.width = width + '%';
    }, 100);
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
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: var(--shadow-lg), var(--shadow-glow-strong);
        z-index: 10000;
        animation: slideInRight 0.4s ease;
        font-weight: 600;
        max-width: 400px;
        border: 1px solid var(--border-glow);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
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
