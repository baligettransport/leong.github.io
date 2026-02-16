const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Inisialisasi Admin SDK
admin.initializeApp();

exports.kirimNotifOrderBaru = functions.database.ref("/orders/{orderId}")
    .onCreate(async (snapshot, context) => {
      const orderData = snapshot.val();

      // 1. Ambil semua FCM Token dari Firestore
      const usersRef = admin.firestore().collection("users");
      const snapshotUsers = await usersRef.get();

      const tokens = [];
      snapshotUsers.forEach((doc) => {
        const userData = doc.data();
        if (userData.fcmToken) {
          tokens.push(userData.fcmToken);
        }
      });

      if (tokens.length === 0) {
        return console.log("Tidak ada user aktif.");
      }

      // 2. Susun Payload (Prioritas Tinggi)
      const message = {
        notification: {
          title: "Job Baru!",
          body: "Ada lowongan kerja baru untuk Anda.",
        },
        android: {
          priority: "HIGH",
        },
        data: {
          click_action: "branda.html",
        },
        tokens: tokens,
      };

      // 3. Kirim
      try {
        await admin.messaging().sendEachForMulticast(message);
        console.log("Notifikasi terkirim!");
      } catch (error) {
        console.error("Error:", error);
      }
    });