
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Lưu ý: Các thông số này sẽ được nhập từ giao diện Admin hoặc lấy từ biến môi trường
// Để bảo mật, Senior sẽ thiết kế để hệ thống có thể nhận cấu hình động.
export const initFirebase = (config: any) => {
    try {
        const app = initializeApp(config);
        const db = getFirestore(app);
        return db;
    } catch (e) {
        console.error("Firebase Init Error", e);
        return null;
    }
};

export { doc, getDoc, setDoc, onSnapshot };
