importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDQ9RgQAEN4qBInijZs5Nn5LFUsXz1x40k",
    authDomain: "schoolmate-8244a.firebaseapp.com",
    projectId: "schoolmate-8244a",
    storageBucket: "schoolmate-8244a.appspot.com",
    messagingSenderId: "812607055228",
    appId: "1:812607055228:web:dd348d4ad55f9ee255b0f9",
    measurementId: "G-81SN53LZLJ"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log("Background message received:", payload);

    const notificationTitle = payload.notification?.title || "New Notification";
    const notificationOptions = {
        body: payload.notification?.body || "You have a new message.",
        icon: "/Images/MSMSLogo.png",
        image:"/Images/MSMSLogo.png",
    };

    // self.registration.showNotification(notificationTitle, notificationOptions);
});

