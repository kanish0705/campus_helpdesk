/**
 * Firebase Firestore Seed Data Script
 * Run in browser console or Node.js with Firebase Admin SDK
 * 
 * Run in browser: Open http://localhost:3000, then in console:
 * fetch('/seed_firestore.js').then(r => r.text()).then(eval)
 */

import { db } from './firebase.js';
import {
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
  query,
  getDocs
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

async function seedFirestore() {
  console.log('🌱 Starting Firestore seed...');
  
  try {
    // ============== SEED USERS ==============
    console.log('📝 Seeding users...');
    
    const users = [
      {
        email: 'student1@college.edu',
        name: 'Rahul Sharma',
        role: 'STUDENT',
        createdAt: serverTimestamp()
      },
      {
        email: 'admin@college.edu',
        name: 'Dr. Admin Kumar',
        role: 'ADMIN',
        createdAt: serverTimestamp()
      }
    ];
    
    for (const user of users) {
      await setDoc(doc(db, 'users', user.email), user);
      console.log(`✓ User created: ${user.email}`);
    }
    
    // ============== SEED ANNOUNCEMENTS ==============
    console.log('📢 Seeding announcements...');
    
    const announcements = [
      {
        title: 'Mid-semester Exams Schedule',
        body: 'Mid-semester exams will be held from March 15-25. Check your timetable for exact dates.',
        createdAt: serverTimestamp(),
        createdBy: 'admin@college.edu'
      },
      {
        title: 'Library Extended Hours',
        body: 'The library will be open from 7 AM to 10 PM during exam season.',
        createdAt: serverTimestamp(),
        createdBy: 'admin@college.edu'
      },
      {
        title: 'New Lab Equipment',
        body: 'New computing equipment has been installed in Lab 3. Training session on March 10.',
        createdAt: serverTimestamp(),
        createdBy: 'admin@college.edu'
      }
    ];
    
    for (const announcement of announcements) {
      await addDoc(collection(db, 'announcements'), announcement);
      console.log(`✓ Announcement created: ${announcement.title}`);
    }
    
    // ============== SEED TIMETABLE ==============
    console.log('📅 Seeding timetable...');
    
    const timetable = [
      {
        day: 'Monday',
        time: '10:00 AM - 11:30 AM',
        subject: 'Data Structures',
        instructor: 'Dr. Patel',
        room: 'Lab 1',
        createdAt: serverTimestamp()
      },
      {
        day: 'Tuesday',
        time: '2:00 PM - 3:30 PM',
        subject: 'Web Development',
        instructor: 'Prof. Kumar',
        room: 'Room 301',
        createdAt: serverTimestamp()
      },
      {
        day: 'Wednesday',
        time: '10:00 AM - 11:30 AM',
        subject: 'Database Systems',
        instructor: 'Dr. Singh',
        room: 'Lab 2',
        createdAt: serverTimestamp()
      },
      {
        day: 'Thursday',
        time: '11:00 AM - 12:30 PM',
        subject: 'Algorithms',
        instructor: 'Prof. Verma',
        room: 'Room 201',
        createdAt: serverTimestamp()
      },
      {
        day: 'Friday',
        time: '3:00 PM - 4:30 PM',
        subject: 'Project Seminar',
        instructor: 'Dr. Patel',
        room: 'Lab 3',
        createdAt: serverTimestamp()
      }
    ];
    
    for (const item of timetable) {
      await addDoc(collection(db, 'timetable'), item);
      console.log(`✓ Timetable entry created: ${item.day} - ${item.subject}`);
    }
    
    // ============== SEED RESOURCES ==============
    console.log('📚 Seeding resources...');
    
    const resources = [
      {
        title: 'Data Structures PDF',
        description: 'Comprehensive guide to data structures and algorithms',
        url: 'https://example.com/ds.pdf',
        type: 'PDF',
        createdAt: serverTimestamp()
      },
      {
        title: 'Web Development Tutorial',
        description: 'HTML, CSS, JavaScript fundamentals',
        url: 'https://example.com/webdev',
        type: 'Video',
        createdAt: serverTimestamp()
      },
      {
        title: 'Database Design Guide',
        description: 'SQL and database normalization principles',
        url: 'https://example.com/db-design.pdf',
        type: 'PDF',
        createdAt: serverTimestamp()
      }
    ];
    
    for (const resource of resources) {
      await addDoc(collection(db, 'resources'), resource);
      console.log(`✓ Resource created: ${resource.title}`);
    }
    
    console.log('✅ Firestore seed completed successfully!');
    console.log('');
    console.log('📊 Data Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Announcements: ${announcements.length}`);
    console.log(`   - Timetable entries: ${timetable.length}`);
    console.log(`   - Resources: ${resources.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding Firestore:', error);
  }
}

// Export for use
export { seedFirestore };

// If running in browser, add to window
if (typeof window !== 'undefined') {
  window.seedFirestore = seedFirestore;
  console.log('💡 Run "seedFirestore()" in console to seed data');
}
