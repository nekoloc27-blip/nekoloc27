let allData = [];
let currentCategory = 'all';
let searchQuery = '';

// Các elements
const grid = document.getElementById('videoGrid');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const tabBtns = document.querySelectorAll('.tab-btn');

// Elements của Modal
const modalOverlay = document.getElementById('modalOverlay');
const closeModalBtn = document.getElementById('closeModal');
const modalTitle = document.getElementById('modalTitle');
const modalImage = document.getElementById('modalImage');
const modalAuthor = document.getElementById('modalAuthor');
const modalType = document.getElementById('modalType');
const codeFileName = document.getElementById('codeFileName');
const codeContent = document.getElementById('codeContent');
const copyBtn = document.getElementById('copyBtn');

// 1. Tải dữ liệu từ file data.json
async function fetchData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        
        // Gắn thêm type vào dữ liệu để dễ xử lý
        const executors = data.executors.map(item => ({ ...item, type: 'executor' }));
        const scripts = data.scripts.map(item => ({ ...item, type: 'script' }));
        
        allData = [...executors, ...scripts];
        renderWeb();
    } catch (error) {
        console.error("Lỗi tải data.json:", error);
        grid.innerHTML = `<div style="text-align:center; grid-column:1/-1; color:red;">Lỗi: Không thể đọc file data.json. Nếu bạn đang mở file trực tiếp, hãy dùng Local Server hoặc Blink.</div>`;
    }
}

// 2. Hiển thị ra màn hình
function renderWeb() {
    const filtered = allData.filter(item => {
        const matchCat = currentCategory === 'all' || item.type === currentCategory;
        const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.author.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
    });

    // Xóa các card cũ (trừ empty state)
    grid.innerHTML = '';
    grid.appendChild(emptyState);

    if (filtered.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';

        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            
            // Đường dẫn ảnh: ví dụ executor/Delta-Executor/anh.png
            const typeFolder = item.type === 'executor' ? 'executor' : 'script';
            const imagePath = `${typeFolder}/${item.folder}/anh.png`;
            const badgeClass = item.type === 'executor' ? 'executor' : 'script';
            const badgeText = item.type === 'executor' ? 'Executor' : 'Script';

            card.innerHTML = `
                <img class="card-img" src="${imagePath}" alt="Thumbnail" onerror="this.src='https://via.placeholder.com/300x160/141419/3b82f6?text=No+Image'">
                <div class="badge ${badgeClass}">${badgeText}</div>
                <div class="card-info">
                    <div class="card-title">${item.title}</div>
                    <div class="card-meta"><i class="fa-solid fa-user"></i> ${item.author}</div>
                </div>
            `;
            
            // Khi bấm vào card -> Mở Modal
            card.onclick = () => openModal(item);
            grid.appendChild(card);
        });
    }
}

// 3. Xử lý mở Modal & đọc file Text
async function openModal(item) {
    modalTitle.textContent = item.title;
    modalAuthor.textContent = item.author;
    modalType.textContent = item.type === 'executor' ? 'Executor' : 'Script';
    
    const typeFolder = item.type === 'executor' ? 'executor' : 'script';
    modalImage.src = `${typeFolder}/${item.folder}/anh.png`;
    
    // Tên file text tương ứng
    const fileName = item.type === 'executor' ? 'executor.txt' : 'script.txt';
    const filePath = `${typeFolder}/${item.folder}/${fileName}`;
    
    codeFileName.textContent = fileName;
    codeContent.value = "Đang tải nội dung...";
    
    modalOverlay.classList.add('active');

    // Tải file text từ thư mục
    try {
        const res = await fetch(filePath);
        if (res.ok) {
            const text = await res.text();
            codeContent.value = text;
        } else {
            codeContent.value = "Không tìm thấy nội dung file " + fileName + " trong thư mục này.";
        }
    } catch (err) {
        codeContent.value = "Lỗi khi đọc file. Hãy chắc chắn bạn đang chạy web qua Local Server (hoặc Blink) chứ không phải mở file trực tiếp.";
    }
}

// 4. Các nút bấm
closeModalBtn.onclick = () => modalOverlay.classList.remove('active');
modalOverlay.onclick = (e) => { if (e.target === modalOverlay) modalOverlay.classList.remove('active'); };

searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderWeb();
});

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        renderWeb();
    });
});

// Xử lý copy code
copyBtn.onclick = () => {
    if (!codeContent.value || codeContent.value.includes("Đang tải") || codeContent.value.includes("Không tìm thấy")) return;
    navigator.clipboard.writeText(codeContent.value);
    copyBtn.innerHTML = `<i class="fa-solid fa-check"></i> Đã Copy!`;
    setTimeout(() => { copyBtn.innerHTML = `<i class="fa-regular fa-copy"></i> Copy Code`; }, 2000);
};

// Bắt đầu chạy
fetchData();