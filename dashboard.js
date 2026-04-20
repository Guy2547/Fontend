document.addEventListener('DOMContentLoaded', () => {
    // 1. ล้วงกระเป๋า (localStorage) ดูว่ามีข้อมูล Login ไหม
    const userDataString = localStorage.getItem('userData');

    // ⛔ ถ้าไม่มีข้อมูล แปลว่าแอบพิมพ์ URL เข้ามาตรงๆ -> เตะกลับไปหน้า Login!
    if (!userDataString) {
        alert("กรุณาเข้าสู่ระบบก่อนใช้งาน");
        window.location.href = 'index.html';
        return;
    }

    // 2. แปลงข้อมูลที่ฝากไว้กลับมาใช้งาน
    const user = JSON.parse(userDataString);

    // 3. แสดงชื่อและตำแหน่งบนหน้าจอ
    document.getElementById('display-name').innerText = user.name || user.USER_ID;
    document.getElementById('display-role').innerText = user.role ? user.role.toUpperCase() : 'USER';

    // 4. ระบบคัดกรองสิทธิ์ (RBAC)
    const role = user.role ? user.role.toLowerCase() : 'user';
    const menuAdmin = document.getElementById('menu-admin');
    const menuHr = document.getElementById('menu-hr');

    if (role === 'admin') {
        // Admin เห็นทุกเมนู
        menuAdmin.style.display = 'block';
        menuHr.style.display = 'block';
    } 
    else if (role === 'hr') {
        // HR เห็นแค่จัดการ User
        menuHr.style.display = 'block';
    }
    // ถ้าเป็น role อื่นๆ ปุ่มทั้ง 2 อันจะถูกซ่อนไว้ตามค่าเริ่มต้นใน HTML ครับ
});

// 5. ฟังก์ชันสำหรับปุ่มออกจากระบบ
function logout() {
    // ลบข้อมูลในกระเป๋าทิ้ง
    localStorage.removeItem('userData');
    // ดีดกลับหน้า Login
    window.location.href = 'index.html'; 
}