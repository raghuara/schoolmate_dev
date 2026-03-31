import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyDQ9RgQAEN4qBInijZs5Nn5LFUsXz1x40k",
    authDomain: "schoolmate-8244a.firebaseapp.com",
    projectId: "schoolmate-8244a",
    storageBucket: "schoolmate-8244a.firebasestorage.app",
    messagingSenderId: "812607055228",
    appId: "1:812607055228:web:dd348d4ad55f9ee255b0f9",
    measurementId: "G-81SN53LZLJ"
  };
  
const app = initializeApp(firebaseConfig);

let messaging = null;
try {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'Notification' in window) {
        messaging = getMessaging(app);
    }
} catch (error) {
    console.warn("Firebase Messaging not supported in this browser:", error.message);
}

export { messaging }

export const generateToken = async () => {
    if (!messaging) return;
    try {
        const permission = await Notification.requestPermission();
        console.log("Notification permission:", permission);

        if (permission === "granted") {
            const token = await getToken(messaging, {
                vapidKey: "BG3wWtQ90ntf73wYCDRqLXG7b2x67wJORDYjTEaYqupTh_RwyyEj3wU7DqgX0Hu7Wwyjwg8pr8RekXZlpwh4e5w"
            });
            console.log("FCM Token:", token);
            localStorage.setItem("fcmToken", token);
        }
    } catch (error) {
        console.error("Error generating FCM token:", error);
    }
};
