import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

//Firebase的設定物件
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB0QykXU_M0w27PZ6u6MmMCZO3apThek7M",
  authDomain: "pm-manager-a5c34.firebaseapp.com",
  projectId: "pm-manager-a5c34",
  storageBucket: "pm-manager-a5c34.appspot.com",
  messagingSenderId: "569961895591",
  appId: "1:569961895591:web:86f33d3e01d6594c576d82",
  measurementId: "G-QSHXWXDC2J"
};

firebase.initializeApp(firebaseConfig)

export default firebase;

