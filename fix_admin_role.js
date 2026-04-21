/**
 * Quick Admin Role Fixer
 * Run in browser console to upgrade admin@college.edu to ADMIN role
 * Copy and paste entire content into browser console (F12)
 */

(async () => {
  try {
    console.log('🔧 Starting admin role update...');
    
    // Import Firestore modules
    const { getFirestore, doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js');
    
    // Get Firestore instance (using window.db from script.js)
    const db = window.db;
    
    if (!db) {
      console.error('❌ Firestore not available. Make sure you\'re on the app page.');
      return;
    }
    
    // Update admin user role
    const adminEmail = 'admin@college.edu';
    const userRef = doc(db, 'users', adminEmail);
    
    await updateDoc(userRef, {
      role: 'ADMIN'
    });
    
    console.log('✅ Admin role updated in Firestore!');
    console.log('Next step: Refresh page (Ctrl+R) and login again');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('Make sure you\'re on the app page and Firestore is loaded');
  }
})();
