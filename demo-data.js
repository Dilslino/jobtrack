// Demo data untuk testing xdilla
// Jalankan di console browser untuk menambah data contoh

const demoJobs = [
    {
        id: "1703123456789",
        company: "PT Teknologi Maju",
        position: "Frontend Developer",
        status: "interview",
        source: "https://www.linkedin.com/jobs/example",
        appliedDate: "2024-12-01",
        interviewDate: "2024-12-20T09:00:00",
        notes: "Interview dengan Tim Lead, persiapkan portfolio React",
        createdAt: "2024-12-01T10:00:00.000Z",
        updatedAt: "2024-12-15T14:30:00.000Z"
    },
    {
        id: "1703123456790",
        company: "Startup Inovasi",
        position: "Full Stack Developer",
        status: "applied",
        source: "https://www.jobstreet.co.id/example",
        appliedDate: "2024-12-10",
        interviewDate: "",
        notes: "Posisi menarik dengan tech stack modern - React, Node.js, MongoDB",
        createdAt: "2024-12-10T08:00:00.000Z",
        updatedAt: "2024-12-10T08:00:00.000Z"
    },
    {
        id: "1703123456791",
        company: "Bank Digital Sejahtera",
        position: "Software Engineer",
        status: "offer",
        source: "https://karir.example.com",
        appliedDate: "2024-11-25",
        interviewDate: "2024-12-05T14:00:00",
        notes: "Tawaran gaji 15jt, benefit menarik, consider carefully",
        createdAt: "2024-11-25T16:00:00.000Z",
        updatedAt: "2024-12-18T10:00:00.000Z"
    },
    {
        id: "1703123456792",
        company: "E-commerce Terbesar",
        position: "Backend Developer",
        status: "rejected",
        source: "",
        appliedDate: "2024-11-20",
        interviewDate: "2024-11-30T10:30:00",
        notes: "Interview berjalan lancar tapi gagal di technical test. Learn more about system design.",
        createdAt: "2024-11-20T12:00:00.000Z",
        updatedAt: "2024-12-02T09:00:00.000Z"
    },
    {
        id: "1703123456793",
        company: "Konsultan IT Terpercaya",
        position: "DevOps Engineer",
        status: "hired",
        source: "https://www.glassdoor.com/example",
        appliedDate: "2024-11-15",
        interviewDate: "2024-11-28T13:00:00",
        notes: "Mulai kerja tanggal 2 Januari 2025. Excited!",
        createdAt: "2024-11-15T14:00:00.000Z",
        updatedAt: "2024-12-01T11:00:00.000Z"
    },
    {
        id: "1703123456794",
        company: "Fintech Revolution",
        position: "Mobile Developer",
        status: "interview",
        source: "https://www.indeed.com/example",
        appliedDate: "2024-12-05",
        interviewDate: "2024-12-22T15:30:00",
        notes: "Interview terakhir dengan CTO, focus on Flutter experience",
        createdAt: "2024-12-05T11:00:00.000Z",
        updatedAt: "2024-12-16T16:00:00.000Z"
    }
];

// Function untuk mengisi demo data
function loadDemoData() {
    localStorage.setItem('xdilla_jobs', JSON.stringify(demoJobs));
    alert('Demo data berhasil dimuat! Refresh halaman untuk melihat data.');
    location.reload();
}

// Function untuk menghapus semua data
function clearAllData() {
    localStorage.removeItem('xdilla_jobs');
    alert('Semua data berhasil dihapus! Refresh halaman.');
    location.reload();
}

console.log('Demo data siap!');
console.log('Jalankan loadDemoData() untuk memuat data contoh');
console.log('Jalankan clearAllData() untuk menghapus semua data');
