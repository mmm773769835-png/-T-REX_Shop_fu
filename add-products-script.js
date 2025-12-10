// Script to add sample products to Firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvak56MOiHl2hr_ix36gsDU6u5dFdIEkw",
  authDomain: "t-rex-5b17f.firebaseapp.com",
  projectId: "t-rex-5b17f",
  storageBucket: "t-rex-5b17f.firebasestorage.app",
  messagingSenderId: "37814615065",
  appId: "1:37814615065:android:3b39b3622c8fbc0358fe88",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Demo products
const demoProducts = [
  {
    name: "هاتف ذكي",
    price: 299.99,
    description: "هاتف حديث بكاميرا عالية الدقة وذاكرة واسعة",
    category: "إلكترونيات",
    attribute: "جديد",
    paymentMethod: "cash",
    imageUrl: "https://via.placeholder.com/300x300/4A90E2/FFFFFF?text=📱",
    createdAt: new Date(),
  },
  {
    name: "قميص رياضي",
    price: 29.99,
    description: "قميص مريح للرياضة مصنوع من مواد عالية الجودة",
    category: "ملابس",
    attribute: "جديد",
    paymentMethod: "card",
    imageUrl: "https://via.placeholder.com/300x300/50C878/FFFFFF?text=👕",
    createdAt: new Date(),
  },
  {
    name: "كتاب برمجة",
    price: 19.99,
    description: "كتاب شامل لتعلم البرمجة من الصفر إلى الاحتراف",
    category: "كتب",
    attribute: "جديد",
    paymentMethod: "transfer",
    imageUrl: "https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=📚",
    createdAt: new Date(),
  },
  {
    name: "سماعة لاسلكية",
    price: 89.99,
    description: "سماعة بلوتوث عالية الجودة مع إلغاء الضوضاء",
    category: "إلكترونيات",
    attribute: "مميز",
    paymentMethod: "cash",
    imageUrl: "https://via.placeholder.com/300x300/9B59B6/FFFFFF?text=🎧",
    createdAt: new Date(),
  },
  {
    name: "حقيبة سفر",
    price: 49.99,
    description: "حقيبة سفر كبيرة بجودة عالية ومتينة",
    category: "منزلية",
    attribute: "جديد",
    paymentMethod: "card",
    imageUrl: "https://via.placeholder.com/300x300/F39C12/FFFFFF?text=👜",
    createdAt: new Date(),
  }
];

async function addSampleProducts() {
  console.log("Adding sample products to Firestore...");
  
  try {
    for (const product of demoProducts) {
      const docRef = await addDoc(collection(db, "products"), product);
      console.log(`✅ Added product: ${product.name} with ID: ${docRef.id}`);
    }
    
    console.log("✅ All sample products added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding sample products:", error);
    process.exit(1);
  }
}

// Run the function
addSampleProducts();