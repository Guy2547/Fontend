// 🌟 ตัวแปรสำหรับข้อมูลและ Pagination
let allLogsData = [];        
let currentFilteredData = [];
let currentPage = 1;         
let rowsPerPage = 10;      

document.addEventListener('DOMContentLoaded', () => {
    const userName = localStorage.getItem('u_name');
    const userDept = localStorage.getItem('u_dept');

    if (!userName || !userDept) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('display-name').innerText = userName;
    const dept = userDept.toLowerCase();
    document.getElementById('display-role').innerText = dept.toUpperCase();

    const btnUsers = document.getElementById('btn-users');
    const btnLogs = document.getElementById('btn-logs');
    const noAccessMsg = document.getElementById('no-access-msg');

    if (dept === 'admin') {
        btnUsers.style.display = 'block';
        btnLogs.style.display = 'block';
    } else if (dept === 'hr') {
        btnUsers.style.display = 'block';
    } else {
        noAccessMsg.style.display = 'block';
    }
});

function openDataView(type) {
    document.getElementById('menu-view').style.display = 'none';
    document.getElementById('data-view').style.display = 'block';

    const title = document.getElementById('data-title');
    const desc = document.getElementById('data-desc');
    const logFilters = document.getElementById('logFilters');
    const userFilters = document.getElementById('userFilters'); // 🌟 เรียกใช้กล่องกรอง User
    const paginationControls = document.getElementById('paginationControls');

    if (type === 'users') {
        title.innerText = '👥 ระบบจัดการ User';
        desc.innerText = 'รายชื่อผู้ใช้งานทั้งหมดในระบบ';
        logFilters.style.display = 'none'; // ซ่อนกล่องค้นหา Logs
        userFilters.style.display = 'flex'; // 🌟 โชว์กล่องค้นหา User แทน
        paginationControls.innerHTML = ''; 
        loadUsers();
    } else if (type === 'logs') {
        title.innerText = '📊 System Logs Activity';
        desc.innerText = 'ประวัติการเข้าใช้งานและเหตุการณ์ในระบบ';
        logFilters.style.display = 'flex'; // โชว์กล่องค้นหา Logs
        userFilters.style.display = 'none'; // 🌟 ซ่อนกล่องค้นหา User
        loadLogs();
    }
}

function goBackToMenu() {
    document.getElementById('data-view').style.display = 'none';
    document.getElementById('menu-view').style.display = 'flex';
}

function setTableHeaders(columns) {
    const header = document.getElementById('tableHeader');
    const tr = document.createElement('tr');
    columns.forEach(col => {
        const th = document.createElement('th');
        th.innerText = col;
        tr.appendChild(th);
    });
    header.innerHTML = '';
    header.appendChild(tr);
}

// 🌟 โหลด Users
function loadUsers() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">⏳ กำลังโหลดข้อมูล...</td></tr>';
    setTableHeaders(['USER_ID', 'USERNAME', 'ROLE', 'STATUS', 'จัดการสิทธิ์']);

    axios.get(`${CONFIG.API_URL}/all-users`)
        .then(res => {
            allUsersData = res.data; // เก็บข้อมูลทั้งหมดไว้
            currentFilteredUsers = allUsersData;
            displayUsers(currentFilteredUsers); // โยนไปให้ฟังก์ชันวาดตาราง
        })
        .catch(err => {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--danger);">❌ ไม่สามารถเชื่อมต่อกับ API ได้</td></tr>`;
        });
}

// 🌟 2. ฟังก์ชันวาดตาราง Users (แยกออกมาเพื่อให้กด Filter แล้ววาดใหม่ได้)
function displayUsers(data) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = ''; 

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">ไม่พบข้อมูล</td></tr>';
        return;
    }

    data.forEach(row => {
        const tr = document.createElement('tr');
        
        let currentStatus = row.STATUS === 'DEACTIVATED' ? 'INACTIVATED' : row.STATUS;
        const statusColor = currentStatus === 'ACTIVE' ? '#4ade80' : '#f87171';
        
        const actionHtml = `
            <select onchange="changeUserStatus('${row.USER_ID}', this.value)" style="padding: 6px; border-radius: 6px; background: rgba(15,23,42,0.9); color: white; border: 1px solid var(--primary); cursor: pointer;">
                <option value="ACTIVE" ${currentStatus === 'ACTIVE' ? 'selected' : ''}>ACTIVE</option>
                <option value="DEACTIVATED" ${row.STATUS === 'DEACTIVATED' ? 'selected' : ''}>DEACTIVATED</option>
            </select>
        `;

        tr.innerHTML = `
            <td>${row.USER_ID || '-'}</td>
            <td>${row.USERNAME || '-'}</td>
            <td>${row.DEPARTMENT || '-'}</td>
            <td style="color: ${statusColor}; font-weight: bold;">${currentStatus}</td>
            <td>${actionHtml}</td>
        `;
        tbody.appendChild(tr);
    });
}

// 🌟 3. ฟังก์ชันกรองข้อมูล Users (เมื่อเลือก Dropdown Role)
function filterUsersData() {
    const searchRole = document.getElementById('searchRole').value.toLowerCase();

    const filteredData = allUsersData.filter(row => {
        // จากโค้ดเดิม คุณใช้ row.DEPARTMENT ในการแสดงผล Role
        const role = (row.DEPARTMENT || row.department || row.ROLE || '').toLowerCase();
        
        // ถ้าค่า Dropdown ว่าง (เลือก All) หรือ ค่า role ตรงกับที่เลือก
        return searchRole === "" || role === searchRole;
    });

    currentFilteredUsers = filteredData;
    displayUsers(currentFilteredUsers);
}

// 🌟 โหลด Logs
function loadLogs() {
    const tbody = document.getElementById('tableBody');
    document.getElementById('paginationControls').innerHTML = ''; 
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">⏳ กำลังโหลดข้อมูล...</td></tr>';
    setTableHeaders(['ลำดับ', 'USER_ID', 'USERNAME', 'ACTION', 'CLIENT_IP', 'STATUS', 'LOG_TIME']);

    axios.get(`${CONFIG.API_URL}/all-logs`)
        .then(res => {
            allLogsData = res.data; 
            currentFilteredData = allLogsData;
            currentPage = 1;
            displayLogs(currentFilteredData);
        })
        .catch(err => {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--danger);">❌ ไม่สามารถเชื่อมต่อกับ API ได้</td></tr>`;
        });
}

// 🌟 กรองข้อมูล Logs
function filterLogsData() {
    const searchValue = document.getElementById('searchId').value.toLowerCase();
    const searchDate = document.getElementById('searchDate').value;
    const searchStatus = document.getElementById('searchStatus').value;

    const filteredData = allLogsData.filter(row => {
        const userId = row.USER_ID || row.user_id || '';
        const username = row.USERNAME || row.username || '';
        const status = row.STATUS || row.status || '';
        const logTime = row.LOG_TIME || row.log_time || row.formatted_time || '';

        const matchId = userId.toString().toLowerCase().includes(searchValue) || 
                        username.toLowerCase().includes(searchValue);
        
        const matchStatus = searchStatus === "" || status === searchStatus;
        
        let matchDate = true;
        if (searchDate !== "") {
            const [year, month, day] = searchDate.split('-');
            const m = parseInt(month, 10).toString();
            const d = parseInt(day, 10).toString();

            const possibleFormats = [
                searchDate, 
                `${day}/${month}/${year}`, 
                `${month}/${day}/${year}`, 
                `${d}/${m}/${year}`
            ];

            matchDate = possibleFormats.some(fmt => logTime.includes(fmt));
        }

        return matchId && matchStatus && matchDate;
    });

    currentFilteredData = filteredData;
    currentPage = 1; 
    displayLogs(currentFilteredData);
}

// 🌟 วาดตาราง Logs พร้อม Pagination
function displayLogs(data) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = ''; 
    
    if(data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">ไม่มีประวัติการใช้งาน หรือไม่พบข้อมูลที่ค้นหา</td></tr>';
        document.getElementById('paginationControls').innerHTML = ''; 
        return;
    }

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);

    paginatedData.forEach((row, index) => {
        const actualIndex = startIndex + index + 1; 
        const userId = row.USER_ID || row.user_id || '-';
        const username = row.USERNAME || row.username || '-';
        const action = row.ACTION || row.action || '-';
        const clientIp = row.CLIENT_IP || row.client_ip || '-';
        const status = row.STATUS || row.status || '-';
        const logTime = row.LOG_TIME || row.log_time || row.formatted_time || '-';

        let currentStatus = status === 'DEACTIVATED' ? 'INACTIVATED' : status;
        let statusBadge = (currentStatus === 'SUCCESS' || currentStatus === 'ACTIVE') 
            ? `<span style="color: #4ade80; font-weight: bold;">${currentStatus}</span>` 
            : `<span style="color: #f87171; font-weight: bold;">${currentStatus}</span>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${actualIndex}</td>
            <td>${userId}</td>
            <td>${username}</td>
            <td>${action}</td>
            <td>${clientIp}</td>
            <td>${statusBadge}</td>
            <td>${logTime}</td>
        `;
        tbody.appendChild(tr);
    });

    setupPagination(data.length);
}

// 🌟 สร้างปุ่ม Pagination แบบใหม่ Dropdown
function setupPagination(totalRows) {
    const paginationDiv = document.getElementById('paginationControls');
    paginationDiv.innerHTML = ''; 

    const totalPages = Math.ceil(totalRows / rowsPerPage);
    if (totalRows === 0) return; 

    // ปุ่ม <
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '&#10094;'; 
    prevBtn.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            displayLogs(currentFilteredData);
        }
    };
    paginationDiv.appendChild(prevBtn);

    // คำนวณเลขหน้า
    let pages = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        if (currentPage <= 4) {
            pages = [1, 2, 3, 4, 5, '...', totalPages];
        } else if (currentPage >= totalPages - 3) {
            pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        } else {
            pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
        }
    }

    // วาดปุ่มเลขหน้า
    pages.forEach(p => {
        const pageBtn = document.createElement('div');
        if (p === '...') {
            pageBtn.innerText = '...';
            pageBtn.className = 'page-item ellipsis';
        } else {
            pageBtn.innerText = p;
            pageBtn.className = `page-item ${p === currentPage ? 'active' : ''}`;
            pageBtn.onclick = () => {
                currentPage = p;
                displayLogs(currentFilteredData);
            };
        }
        paginationDiv.appendChild(pageBtn);
    });

    // ปุ่ม >
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '&#10095;';
    nextBtn.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayLogs(currentFilteredData);
        }
    };
    paginationDiv.appendChild(nextBtn);

    // Dropdown จำนวนต่อหน้า
    const selectDiv = document.createElement('select');
    selectDiv.className = 'per-page-select';
    const perPageOptions = [10, 20, 50, 100]; 
    perPageOptions.forEach(val => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.innerText = `${val} / page`;
        if (val === rowsPerPage) opt.selected = true;
        selectDiv.appendChild(opt);
    });

    selectDiv.onchange = (e) => {
        rowsPerPage = parseInt(e.target.value);
        currentPage = 1; 
        displayLogs(currentFilteredData);
    };
    
    paginationDiv.appendChild(selectDiv);
}

// 🌟 Popup 
function showPopup(title, text, type = 'confirm') {
    return new Promise((resolve) => {
        const overlay = document.getElementById('custom-modal');
        const iconEl = document.getElementById('modal-icon');
        const titleEl = document.getElementById('modal-title');
        const textEl = document.getElementById('modal-text');
        const btnCancel = document.getElementById('btn-modal-cancel');
        const btnConfirm = document.getElementById('btn-modal-confirm');

        titleEl.innerText = title;
        textEl.innerText = text;

        if (type === 'success') {
            iconEl.innerText = '✅';
            btnCancel.style.display = 'none';
            btnConfirm.innerText = 'ตกลง';
            btnConfirm.style.background = 'var(--success)';
        } else if (type === 'error') {
            iconEl.innerText = '❌';
            btnCancel.style.display = 'none';
            btnConfirm.innerText = 'รับทราบ';
            btnConfirm.style.background = 'var(--danger)';
            btnConfirm.style.color = 'white';
        } else {
            iconEl.innerText = '⚠️';
            btnCancel.style.display = 'block';
            btnConfirm.innerText = 'ยืนยัน';
            btnConfirm.style.background = 'var(--primary)';
            btnConfirm.style.color = '#0f172a';
        }

        overlay.classList.add('show');

        btnConfirm.onclick = () => {
            overlay.classList.remove('show');
            resolve(true); 
        };

        btnCancel.onclick = () => {
            overlay.classList.remove('show');
            resolve(false); 
        };
    });
}

// 🌟 เปลี่ยนสถานะ User
async function changeUserStatus(userId, newStatus) {
    const userDept = localStorage.getItem('u_dept');
    
    const isConfirmed = await showPopup(
        'ยืนยันการทำรายการ?', 
        `คุณต้องการเปลี่ยนสถานะของไอดี ${userId} เป็น ${newStatus} ใช่หรือไม่?`, 
        'confirm'
    );

    if (!isConfirmed) {
        loadUsers(); 
        return;
    }

    try {
        await axios.put(`${CONFIG.API_URL}/update-status/${userId}`, { status: newStatus, dept: userDept });
        
        await showPopup('สำเร็จ!', 'อัปเดตสถานะผู้ใช้งานเสร็จสมบูรณ์', 'success');
        loadUsers(); 
    } catch (error) {
        await showPopup('ข้อผิดพลาด', 'คุณไม่มีสิทธิ์ หรือเซิร์ฟเวอร์มีปัญหา', 'error');
        loadUsers();
    }
}

function logout() {
    localStorage.clear();
 
    window.location.href = 'index.html';
}
