# ✅ QUICK START - Testing Guide

## 🚀 STEP 1: Start Server

```powershell
cd "C:\Users\DINESH KUMAR\OneDrive\Desktop\ppproject"
node server.js
```

**Expected:**
```
Server is running at http://localhost:3000
```

---

## 🌐 STEP 2: Open App

1. Open browser: `http://localhost:3000`
2. Open DevTools: Press **F12**
3. Go to **Console** tab
4. **Should see:** `✓ Chat system initialized`

---

## 🔐 STEP 3: Login

**In the app (not console):**
- Email: `student1@college.edu`
- Password: `(leave empty or any password)`
- Click **Sign In**

**Expected in Console:**
```
🔐 Logging in: student1@college.edu
✓ User created: student1@college.edu
✓ User logged in: { email: "student1@college.edu", name: "student1", role: "STUDENT" }
```

**Expected in App:**
- Login form disappears
- Dashboard loads
- Chat widget appears (bottom right)

---

## 💬 STEP 4: Send First Message

1. Click the **chat bubble** icon (bottom right) - opens chat widget
2. Type: `Hello from Firestore!`
3. Press **Enter** or click **Send**

**Expected in Console:**
```
✓ Message sent
```

**Expected in App:**
- Your message appears in BLUE
- Bot response appears in GRAY  
- Both messages show timestamp

---

## 📊 STEP 5: Verify in Firebase Console

1. Go to: https://console.firebase.google.com/
2. Select Project: `ai-chatbot-project-63de8`
3. Click: **Firestore Database**
4. Expand: `users` → `student1@college.edu` → `chats` → (click chat ID) → `messages`

**You should see:**
- Your message with `sender: "user"`
- Bot response with `sender: "bot"`
- Timestamps for each

---

## 🔄 STEP 6: Test Real-Time (Advanced)

1. **Tab 1:** Keep current browser tab open
2. **Tab 2:** Open new tab → `http://localhost:3000` → Login same email
3. **Tab 1:** Send a message
4. **Tab 2:** Watch it appear automatically (no refresh!)

✅ If message appears instantly → Real-time listeners working!

---

## 📋 COMPLETE CHECKLIST

✅ Run these to verify:

**In Browser Console (F12 → Console):**

### Test 1: Create User
```javascript
await initializeUserSession('test@college.edu', 'Test');
```
✅ Should show: `✓ User created: test@college.edu`

### Test 2: Create Chat
```javascript
const chatId = await createChat('test@college.edu', 'Test Chat');
```
✅ Should return chat ID

### Test 3: Send Message
```javascript
await addMessage('test@college.edu', 'CHAT_ID_HERE', 'user', 'Test Message');
```
✅ Should show: `✓ Message sent`

### Test 4: Get Messages
```javascript
const msgs = await getMessages('test@college.edu', 'CHAT_ID_HERE');
console.log(msgs);
```
✅ Should show array of messages

---

## ❌ TROUBLESHOOTING

| **Problem** | **Solution** |
|---|---|
| Import errors in console | Check firebase-chat-operations.js exists in ppproject/ folder |
| "login is not defined" | Verify script tag has `type="module"` in HTML |
| Messages not appearing | First open a chat, THEN send message |
| No real-time updates | Check Firestore security rules are deployed |
| Firebase "permission denied" | Check that your Firestore security rules match the code |

---

## 🎯 SUCCESS INDICATORS

If you see all of these ✅, you're done:

- [x] No red errors in console
- [x] Can login successfully
- [x] Can send message
- [x] Message appears on screen
- [x] Bot responds  
- [x] Timestamp shows correctly
- [x] Data visible in Firebase Console
- [x] Real-time updates work (2 tabs test)

---

## 📞 NEXT TROUBLESHOOTING STEPS

If something still fails:

1. **Screenshot errors**: Show browser console errors
2. **Check file locations**: All 3 files in ppproject/?
   - firebase.js ✅
   - firebase-chat-operations.js ✅
   - script.js ✅

3. **Clear browser cache**: Ctrl+Shift+Delete
4. **Restart server**: Ctrl+C then `node server.js` again
5. **Check Firebase project**: Rules deployed? DB exists?

---

**Ready to test? Start with STEP 1! 🚀**
