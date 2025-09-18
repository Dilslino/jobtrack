// xdilla - Job Application Tracker
// Main JavaScript functionality

class JobTracker {
    constructor() {
        this.jobs = JSON.parse(localStorage.getItem('xdilla_jobs')) || [];
        this.currentTab = 'dashboard';
        this.currentView = 'month';
        this.currentDate = new Date();
        this.editingJobId = null;
        this.adminPassword = 'xdilla2024'; // Password untuk upload logo kustom
        this.selectedIcon = null;
        this.customLogoData = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateStats();
        this.renderJobs();
        this.renderCalendar();
        this.updateRecentActivity();
        this.setupLogo();
        this.startRealTimeClock();
        
        // Set current date input to today
        document.getElementById('applied-date').value = new Date().toISOString().split('T')[0];
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.closest('.tab-btn').dataset.tab);
            });
        });

        // Add job button
        document.getElementById('add-job-btn').addEventListener('click', () => {
            this.openModal();
        });

        // Modal controls
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.closeModal();
        });

        // Form submission
        document.getElementById('job-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveJob();
        });

        // Status change listener for interview date field
        document.getElementById('status').addEventListener('change', (e) => {
            this.toggleInterviewDateField(e.target.value);
        });

        // Filter jobs
        document.getElementById('status-filter').addEventListener('change', (e) => {
            this.filterJobs(e.target.value);
        });

        // Calendar navigation
        document.getElementById('prev-period').addEventListener('click', () => {
            this.navigateCalendar(-1);
        });

        document.getElementById('next-period').addEventListener('click', () => {
            this.navigateCalendar(1);
        });

        // Calendar view switcher
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchCalendarView(e.target.dataset.view);
            });
        });

        // Confirmation modal
        document.getElementById('confirm-cancel').addEventListener('click', () => {
            this.closeConfirmModal();
        });

        document.getElementById('confirm-ok').addEventListener('click', () => {
            this.confirmDelete();
        });

        // Close modal when clicking outside
        document.getElementById('job-modal').addEventListener('click', (e) => {
            if (e.target.id === 'job-modal') {
                this.closeModal();
            }
        });

        document.getElementById('confirm-modal').addEventListener('click', (e) => {
            if (e.target.id === 'confirm-modal') {
                this.closeConfirmModal();
            }
        });

        // Logo edit functionality removed - logo is permanent
    }

    switchTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to selected tab and content
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;

        // Update content based on tab
        if (tabName === 'dashboard') {
            this.updateStats();
            this.updateRecentActivity();
        } else if (tabName === 'jobs') {
            this.renderJobs();
        } else if (tabName === 'calendar') {
            this.renderCalendar();
        }
    }

    openModal(jobId = null) {
        this.editingJobId = jobId;
        const modal = document.getElementById('job-modal');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('job-form');

        if (jobId) {
            // Edit mode
            title.textContent = 'Edit Lamaran';
            const job = this.jobs.find(j => j.id === jobId);
            this.fillForm(job);
        } else {
            // Add mode
            title.textContent = 'Tambah Lamaran Baru';
            form.reset();
            document.getElementById('applied-date').value = new Date().toISOString().split('T')[0];
            this.toggleInterviewDateField('');
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('job-modal').classList.remove('active');
        document.body.style.overflow = '';
        this.editingJobId = null;
    }

    fillForm(job) {
        document.getElementById('company-name').value = job.company;
        document.getElementById('position').value = job.position;
        document.getElementById('status').value = job.status;
        document.getElementById('source').value = job.source || '';
        document.getElementById('applied-date').value = job.appliedDate;
        document.getElementById('interview-date').value = job.interviewDate || '';
        document.getElementById('notes').value = job.notes || '';
        
        this.toggleInterviewDateField(job.status);
    }

    toggleInterviewDateField(status) {
        const interviewGroup = document.getElementById('interview-date-group');
        if (status === 'interview' || status === 'offer' || status === 'hired') {
            interviewGroup.style.display = 'block';
        } else {
            interviewGroup.style.display = 'none';
        }
    }

    saveJob() {
        const formData = {
            company: document.getElementById('company-name').value.trim(),
            position: document.getElementById('position').value.trim(),
            status: document.getElementById('status').value,
            source: document.getElementById('source').value.trim(),
            appliedDate: document.getElementById('applied-date').value,
            interviewDate: document.getElementById('interview-date').value,
            notes: document.getElementById('notes').value.trim()
        };

        // Validation
        if (!formData.company || !formData.position || !formData.status || !formData.appliedDate) {
            alert('Mohon lengkapi semua field yang wajib diisi!');
            return;
        }

        if (this.editingJobId) {
            // Update existing job
            const jobIndex = this.jobs.findIndex(j => j.id === this.editingJobId);
            this.jobs[jobIndex] = { ...this.jobs[jobIndex], ...formData, updatedAt: new Date().toISOString() };
        } else {
            // Add new job
            const newJob = {
                id: Date.now().toString(),
                ...formData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.jobs.push(newJob);
        }

        this.saveToStorage();
        this.closeModal();
        this.renderJobs();
        this.updateStats();
        this.updateRecentActivity();
        this.renderCalendar();
    }

    deleteJob(jobId) {
        this.jobToDelete = jobId;
        document.getElementById('confirm-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    confirmDelete() {
        this.jobs = this.jobs.filter(job => job.id !== this.jobToDelete);
        this.saveToStorage();
        this.closeConfirmModal();
        this.renderJobs();
        this.updateStats();
        this.updateRecentActivity();
        this.renderCalendar();
        this.jobToDelete = null;
    }

    closeConfirmModal() {
        document.getElementById('confirm-modal').classList.remove('active');
        document.body.style.overflow = '';
    }

    renderJobs() {
        const jobsList = document.getElementById('jobs-list');
        const filter = document.getElementById('status-filter').value;
        
        let filteredJobs = this.jobs;
        if (filter) {
            filteredJobs = this.jobs.filter(job => job.status === filter);
        }

        if (filteredJobs.length === 0) {
            jobsList.innerHTML = '<div class="card"><div class="content-area"><p class="empty-state">Tidak ada lamaran ditemukan.</p></div></div>';
            return;
        }

        // Sort by updated date (newest first)
        filteredJobs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        jobsList.innerHTML = filteredJobs.map(job => this.createJobHTML(job)).join('');
    }

    createJobHTML(job) {
        const formatDate = (dateStr) => {
            if (!dateStr) return '-';
            const date = new Date(dateStr);
            return date.toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
            });
        };

        const formatDateTime = (dateStr) => {
            if (!dateStr) return '-';
            const date = new Date(dateStr);
            return date.toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        const statusLabels = {
            applied: 'Dilamar',
            interview: 'Interview',
            offer: 'Tawaran',
            hired: 'Diterima',
            rejected: 'Ditolak'
        };

        return `
            <div class="job-item">
                <div class="job-header">
                    <div class="job-main-info">
                        <h4>${job.position}</h4>
                        <div class="job-company">${job.company}</div>
                    </div>
                    <div class="job-actions">
                        <button class="action-btn edit-btn" onclick="jobTracker.openModal('${job.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="jobTracker.deleteJob('${job.id}')" title="Hapus">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="job-details">
                    <div class="job-detail">
                        <span class="job-detail-label">Status</span>
                        <span class="job-detail-value">
                            <span class="status-badge status-${job.status}">${statusLabels[job.status]}</span>
                        </span>
                    </div>
                    <div class="job-detail">
                        <span class="job-detail-label">Tanggal Lamar</span>
                        <span class="job-detail-value">${formatDate(job.appliedDate)}</span>
                    </div>
                    ${job.interviewDate ? `
                    <div class="job-detail">
                        <span class="job-detail-label">Interview</span>
                        <span class="job-detail-value">${formatDateTime(job.interviewDate)}</span>
                    </div>
                    ` : ''}
                    ${job.source ? `
                    <div class="job-detail">
                        <span class="job-detail-label">Sumber</span>
                        <span class="job-detail-value">
                            <a href="${job.source}" target="_blank" style="color: #e91e63; text-decoration: none;">
                                <i class="fas fa-external-link-alt"></i> Link
                            </a>
                        </span>
                    </div>
                    ` : ''}
                </div>
                ${job.notes ? `
                <div class="job-notes">
                    <span class="job-detail-label">Catatan:</span>
                    <p style="margin-top: 4px; color: #666; font-size: 14px;">${job.notes}</p>
                </div>
                ` : ''}
            </div>
        `;
    }

    filterJobs(status) {
        this.renderJobs();
    }

    updateStats() {
        const stats = {
            total: this.jobs.length,
            applied: this.jobs.filter(j => j.status === 'applied').length,
            interview: this.jobs.filter(j => j.status === 'interview').length,
            offer: this.jobs.filter(j => j.status === 'offer').length,
            hired: this.jobs.filter(j => j.status === 'hired').length
        };

        document.getElementById('total-applied').textContent = stats.total;
        document.getElementById('total-interviews').textContent = stats.interview;
        document.getElementById('total-offers').textContent = stats.offer;
        document.getElementById('total-hired').textContent = stats.hired;
    }

    updateRecentActivity() {
        const recentContainer = document.getElementById('recent-jobs');
        const recentJobs = this.jobs
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 3);

        if (recentJobs.length === 0) {
            recentContainer.innerHTML = '<p class="empty-state">Belum ada lamaran. Tambahkan lamaran pertama Anda!</p>';
            return;
        }

        const statusLabels = {
            applied: 'Dilamar',
            interview: 'Interview',
            offer: 'Tawaran',
            hired: 'Diterima',
            rejected: 'Ditolak'
        };

        recentContainer.innerHTML = recentJobs.map(job => `
            <div style="padding: 12px 0; border-bottom: 1px solid rgba(233, 30, 99, 0.1); display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 600; color: #2d1b3d; margin-bottom: 4px;">${job.position}</div>
                    <div style="font-size: 14px; color: #666;">${job.company}</div>
                </div>
                <span class="status-badge status-${job.status}" style="font-size: 10px; padding: 2px 8px;">${statusLabels[job.status]}</span>
            </div>
        `).join('');
    }

    // Calendar functionality
    switchCalendarView(view) {
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        this.currentView = view;
        this.renderCalendar();
    }

    navigateCalendar(direction) {
        if (this.currentView === 'month') {
            this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        } else if (this.currentView === 'week') {
            this.currentDate.setDate(this.currentDate.getDate() + (direction * 7));
        } else if (this.currentView === 'day') {
            this.currentDate.setDate(this.currentDate.getDate() + direction);
        }
        this.renderCalendar();
    }

    renderCalendar() {
        if (this.currentView === 'month') {
            this.renderMonthView();
        } else if (this.currentView === 'week') {
            this.renderWeekView();
        } else if (this.currentView === 'day') {
            this.renderDayView();
        }
    }

    renderMonthView() {
        const monthNames = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        
        const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

        document.getElementById('current-period').textContent = 
            `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Get first day of month and how many days in month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDate = firstDay.getDay(); // 0 = Sunday
        
        // Get interviews for this month
        const monthInterviews = this.getInterviewsForMonth(year, month);
        
        let calendarHTML = '';
        
        // Add day headers
        dayNames.forEach(day => {
            calendarHTML += `<div class="calendar-day header">${day}</div>`;
        });
        
        // Add empty cells for days before month starts
        for (let i = 0; i < startDate; i++) {
            const prevMonthDay = new Date(year, month, -(startDate - i - 1));
            calendarHTML += `<div class="calendar-day other-month">${prevMonthDay.getDate()}</div>`;
        }
        
        // Add days of current month
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDay = new Date(year, month, day);
            const isToday = currentDay.toDateString() === today.toDateString();
            const hasInterview = monthInterviews.some(interview => {
                const interviewDate = new Date(interview.interviewDate);
                return interviewDate.getDate() === day;
            });
            
            let classes = 'calendar-day current-month';
            if (isToday) classes += ' today';
            if (hasInterview) classes += ' has-interview';
            
            calendarHTML += `<div class="${classes}" data-date="${year}-${month + 1}-${day}">${day}</div>`;
        }
        
        // Add days from next month to fill the grid
        const totalCells = Math.ceil((startDate + daysInMonth) / 7) * 7;
        const remainingCells = totalCells - (startDate + daysInMonth);
        for (let day = 1; day <= remainingCells; day++) {
            calendarHTML += `<div class="calendar-day other-month">${day}</div>`;
        }
        
        document.getElementById('calendar-grid').innerHTML = calendarHTML;

        // Show month view, hide others
        document.getElementById('month-view').style.display = 'block';
        document.getElementById('week-view').style.display = 'none';
        document.getElementById('day-view').style.display = 'none';
    }

    renderWeekView() {
        // Simplified week view
        document.getElementById('current-period').textContent = 'Minggu ini';
        document.getElementById('month-view').style.display = 'none';
        document.getElementById('week-view').style.display = 'block';
        document.getElementById('day-view').style.display = 'none';
        
        document.getElementById('week-view').innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Tampilan minggu akan segera hadir</p>';
    }

    renderDayView() {
        // Simplified day view
        const today = new Date(this.currentDate);
        document.getElementById('current-period').textContent = today.toLocaleDateString('id-ID', { 
            weekday: 'long',
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
        
        document.getElementById('month-view').style.display = 'none';
        document.getElementById('week-view').style.display = 'none';
        document.getElementById('day-view').style.display = 'block';
        
        // Get interviews for this day
        const dayInterviews = this.jobs.filter(job => {
            if (!job.interviewDate) return false;
            const interviewDate = new Date(job.interviewDate);
            return interviewDate.toDateString() === today.toDateString();
        });
        
        let dayHTML = '';
        if (dayInterviews.length === 0) {
            dayHTML = '<p style="text-align: center; padding: 40px; color: #666;">Tidak ada interview hari ini</p>';
        } else {
            dayHTML = dayInterviews.map(job => `
                <div class="job-item">
                    <h4>${job.position}</h4>
                    <p>${job.company}</p>
                    <p><strong>Waktu:</strong> ${new Date(job.interviewDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                    ${job.notes ? `<p><strong>Catatan:</strong> ${job.notes}</p>` : ''}
                </div>
            `).join('');
        }
        
        document.getElementById('day-view').innerHTML = dayHTML;
    }

    getInterviewsForMonth(year, month) {
        return this.jobs.filter(job => {
            if (!job.interviewDate) return false;
            const interviewDate = new Date(job.interviewDate);
            return interviewDate.getFullYear() === year && interviewDate.getMonth() === month;
        });
    }

    saveToStorage() {
        localStorage.setItem('xdilla_jobs', JSON.stringify(this.jobs));
    }

    setupLogo() {
        const logoCircle = document.querySelector('.logo-circle');
        const logoIcon = document.querySelector('.logo-circle i');
        const customLogo = document.getElementById('custom-logo');
        
        // Array icon yang bisa dipilih
        this.iconOptions = [
            'xdilla-bear', // Logo kustom xdilla bear
            'fas fa-briefcase',
            'fas fa-user-tie', 
            'fas fa-chart-line',
            'fas fa-rocket',
            'fas fa-star',
            'fas fa-heart',
            'fas fa-gem',
            'fas fa-crown'
        ];
        
        // Logo custom adalah permanen dan tidak dapat diubah
        this.loadCustomLogo();
        
        // Logo adalah permanen, tidak ada click handler untuk edit
    }

    // Logo edit functions removed - logo is now permanent

    loadCustomLogo() {
        const customLogo = document.getElementById('custom-logo');
        const logoIcon = document.querySelector('.logo-circle i');
        
        // Menggunakan logo custom dari file joblogo.png
        customLogo.src = 'joblogo.png';
        customLogo.style.display = 'block';
        logoIcon.style.display = 'none';
        
        // Error handler jika logo tidak ditemukan
        customLogo.onerror = () => {
            console.warn('Logo custom tidak ditemukan, menggunakan fallback');
            logoIcon.className = 'fas fa-briefcase';
            customLogo.style.display = 'none';
            logoIcon.style.display = 'block';
        };
    }

    startRealTimeClock() {
        this.updateClock();
        // Update setiap detik
        setInterval(() => {
            this.updateClock();
        }, 1000);
    }

    updateClock() {
        const timeElement = document.querySelector('.status-bar .time');
        if (timeElement) {
            // Waktu Jakarta (WIB = UTC+7)
            const now = new Date();
            const jakartaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Jakarta"}));
            
            const hours = jakartaTime.getHours().toString().padStart(2, '0');
            const minutes = jakartaTime.getMinutes().toString().padStart(2, '0');
            
            timeElement.textContent = `${hours}:${minutes}`;
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.jobTracker = new JobTracker();
});

// Service Worker for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
