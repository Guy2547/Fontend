/**
 * Login Page Module
 * Handles login form and redirects.
 */

// Helper: แปลง dept (string หรือ Array) → UPPER Array แล้วเช็คสิทธิ์
function getRoles(dept) {
    if (!dept) return [];
    const raw = Array.isArray(dept) ? dept : [dept];
    return raw.map(r => String(r).toUpperCase().trim()).filter(Boolean);
}

function getRedirectUrl(dept) {
    const roles = getRoles(dept);
    return roles.includes('ADMIN') || roles.includes('HR') ? 'dashboard.html' : 'welcome.html';
}

const LoginPage = {
    init: () => {
        if (StorageService.isLoggedIn()) {
            const dept = StorageService.getUserDept();
            window.location.href = getRedirectUrl(dept);
            return;
        }

        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') LoginPage.handleLogin();
        });
    },

    showError: (message) => {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.innerText = message;
        errorDiv.style.display = 'block';
        errorDiv.style.animation = 'none';
        setTimeout(() => {
            errorDiv.style.animation = 'shake 0.4s ease-in-out';
        }, 10);
    },

    hideError: () => {
        document.getElementById('errorMessage').style.display = 'none';
    },

    handleLogin: async () => {
        const userId   = document.getElementById('userId').value.trim();
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');

        LoginPage.hideError();

        if (!userId || !password) {
            LoginPage.showError('⚠️ กรุณากรอก USER ID และรหัสผ่านให้ครบถ้วน');
            return;
        }

        loginBtn.innerText  = 'กำลังตรวจสอบ...';
        loginBtn.disabled   = true;

        try {
            const res  = await ApiService.login(userId, password);
            const data = res.data;

            StorageService.setUser({
                id       : data.user.id   || userId,
                name     : data.user.name || 'ผู้ใช้งาน',
                dept     : data.user.dept || [],   // เก็บเป็น Array
                ip       : data.session?.ip,
                loginTime: data.session?.loginTime
            });

            loginBtn.style.backgroundColor = '#22c55e';
            loginBtn.innerText = 'เข้าสู่ระบบสำเร็จ! กำลังเปลี่ยนหน้า...';

            setTimeout(() => {
                window.location.href = getRedirectUrl(data.user.dept);
            }, 500);

        } catch (error) {
            loginBtn.innerText = 'เข้าสู่ระบบ';
            loginBtn.disabled  = false;

            if (error.response) {
                switch (error.response.status) {
                    case 404: LoginPage.showError('❌ ไม่พบ USER ID นี้ในระบบ'); break;
                    case 401: LoginPage.showError('❌ รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง'); break;
                    case 403: LoginPage.showError('❌ บัญชีของคุณถูกระงับการใช้งาน'); break;
                    default : LoginPage.showError('⚠️ เกิดข้อผิดพลาดจากเซิร์ฟเวอร์'); break;
                }
            } else {
                LoginPage.showError('🔌 ไม่สามารถเชื่อมต่อฐานข้อมูลได้ หรือเซิร์ฟเวอร์ปิดอยู่');
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', LoginPage.init);
