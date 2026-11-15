let allData = [];
let currentCategory = 'all';
let searchQuery = '';

const grid = document.getElementById('videoGrid');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const tabBtns = document.querySelectorAll('.tab-btn');

// Modal Elements
const modalOverlay = document.getElementById('modalOverlay');
const closeModalBtn = document.getElementById('closeModal');
const modalTitle = document.getElementById('modalTitle');
const modalImage = document.getElementById('modalImage');
const modalAuthor = document.getElementById('modalAuthor');
const modalType = document.getElementById('modalType');
const codeFileName = document.getElementById('codeFileName');
const codeContent = document.getElementById('codeContent');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');

async function fetchData() {
    try {
        // Tự động tải file data.json do Github tạo ra
        const response = await fetch('data.json');
        const data = await response.json();
        
        const executors = data.executors.map(item => ({ ...item, type: 'executor' }));
        const scripts = data.scripts.map(item => ({ ...item, type: 'script' }));
        
        allData = [...executors, ...scripts];
        renderWeb();
    } catch (error) {
        grid.innerHTML = `<div style="text-align:center; grid-column:1/-1; color:red;">Đang chờ Github quét dữ liệu...</div>`;
    }
}

function renderWeb() {
    const filtered = allData.filter(item => {
        const matchCat = currentCategory === 'all' || item.type === currentCategory;
        const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.author.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
    });

    grid.innerHTML = '';
    grid.appendChild(emptyState);

    if (filtered.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';

        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            
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
            
            card.onclick = () => openModal(item);
            grid.appendChild(card);
        });
    }
}

async function openModal(item) {
    modalTitle.textContent = item.title;
    modalAuthor.textContent = item.author;
    modalType.textContent = item.type === 'executor' ? 'Executor' : 'Script';
    
    const typeFolder = item.type === 'executor' ? 'executor' : 'script';
    modalImage.src = `${typeFolder}/${item.folder}/anh.png`;
    
    modalOverlay.classList.add('active');

    // Nếu là executor -> Hiện link tải, ẩn code
    if (item.type === 'executor') {
        codeFileName.textContent = "Link tải Executor:";
        codeContent.style.display = 'none'; // Ẩn textarea
        copyBtn.style.display = 'none'; // Ẩn nút Copy
        downloadBtn.style.display = 'block'; // Hiện nút Download
        
        try {
            const res = await fetch(`${typeFolder}/${item.folder}/link.txt`);
            const link = (await res.text()).trim();
            downloadBtn.onclick = () => window.open(link, '_blank');
        } catch (err) {
            downloadBtn.onclick = () => alert("Chưa có link tải!");
        }
    } 
    // Nếu là script -> Hiện code, ẩn link
    else {
        codeFileName.textContent = "script.txt";
        codeContent.style.display = 'block'; // Hiện textarea
        copyBtn.style.display = 'block'; // Hiện nút Copy
        downloadBtn.style.display = 'none'; // Ẩn nút Download
        codeContent.value = "Đang tải nội dung...";
        
        try {
            const res = await fetch(`${typeFolder}/${item.folder}/script.txt`);
            const text = await res.text();
            codeContent.value = text;
        } catch (err) {
            codeContent.value = "Lỗi tải script.";
        }
    }
}

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

copyBtn.onclick = () => {
    if (!codeContent.value || codeContent.value.includes("Đang tải")) return;
    navigator.clipboard.writeText(codeContent.value);
    copyBtn.innerHTML = `<i class="fa-solid fa-check"></i> Đã Copy!`;
    setTimeout(() => { copyBtn.innerHTML = `<i class="fa-regular fa-copy"></i> Copy Code`; }, 2000);
};

fetchData();