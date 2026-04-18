# TESTING & VERIFICATION GUIDE
## Step-by-Step Instructions to Verify All Fixes

---

## PRE-TEST CHECKLIST

- [ ] Pulled latest code from `project-audit-and-review` branch
- [ ] Node server running: `python3 -m http.server 3000`
- [ ] Opened `http://localhost:3000` in browser
- [ ] Opened Developer Tools (F12)
- [ ] Console tab visible and empty of errors

---

## TEST SUITE 1: MEMBER PORTAL INITIALIZATION

### Test 1.1: Dashboard Loads Without Errors
**Objective:** Verify member portal initializes cleanly

**Steps:**
1. Go to `http://localhost:3000/login.html`
2. Log in with test credentials (or create new test account)
3. Wait for redirect to member portal
4. Check browser console (F12 > Console)

**Expected Results:**
- ✓ No JavaScript errors
- ✓ Dashboard section visible with stats
- ✓ Missions preview shows 3 recent missions (or empty if none)
- ✓ Sidebar visible on left with badges
- ✓ Navigation tabs visible at top

**If Failed:**
- [ ] Check console errors (screenshot)
- [ ] Verify Firebase is connected: Type `firebase.auth().currentUser` in console
- [ ] Verify `window.loadMissions` exists: Type `window.loadMissions` in console

**Pass/Fail:** ___________

---

### Test 1.2: Dashboard Missions Preview
**Objective:** Verify missions load in dashboard preview

**Steps:**
1. From member portal dashboard
2. Look for "Your Latest Missions" section
3. Should show up to 3 recent missions
4. Each mission should show: title, points, and status

**Expected Results:**
- ✓ Missions load without errors
- ✓ Missions display correct data from Firestore
- ✓ Sidebar "Missions" badge shows count of incomplete tasks
- ✓ Completed missions show "✓ Completed & approved"
- ✓ Submitted missions show "⏳ Under review…"

**If Failed:**
- [ ] Check `_loadMissions()` function exists: `typeof window._loadMissions`
- [ ] Check for Firestore errors in console
- [ ] Verify user has missions assigned in database

**Pass/Fail:** ___________

---

### Test 1.3: Sidebar Badge Updates
**Objective:** Verify mission count badge shows correct number

**Steps:**
1. From member portal
2. Look at left sidebar
3. Find "MISSIONS" text with badge number

**Expected Results:**
- ✓ Badge shows number of incomplete missions
- ✓ Badge has class "show" (visible, not hidden)
- ✓ Number updates when missions are marked complete
- ✓ Badge style matches design system

**If Failed:**
- [ ] Inspect element `<span id="badge-missions">`
- [ ] Check computed CSS for visibility
- [ ] Verify missions data loads from Firestore

**Pass/Fail:** ___________

---

## TEST SUITE 2: TAB SWITCHING

### Test 2.1: Click Missions Tab
**Objective:** Verify Missions tab loads full list

**Steps:**
1. From member portal dashboard
2. Click the "MISSIONS" tab in the nav
3. Wait 1-2 seconds for data to load
4. Check browser console for errors

**Expected Results:**
- ✓ Tab switches without error
- ✓ Full missions list appears
- ✓ All missions show with submit interface if incomplete
- ✓ No console errors about `loadMissions is not a function`

**Common Error:**
If you see `loadMissions is not a function`:
- [ ] Check `js/member.js` line 301: Should have `window.loadMissions = loadMissions;`
- [ ] Check that `loadMissions` function is defined
- [ ] Reload page (Ctrl+R) to clear JavaScript cache

**Pass/Fail:** ___________

---

### Test 2.2: Click Projects Tab
**Objective:** Verify Projects tab loads grid

**Steps:**
1. From member portal, click "PROJECTS" tab
2. Wait for data to load
3. Check console for errors

**Expected Results:**
- ✓ Projects grid appears
- ✓ Shows all available projects
- ✓ Each project shows: name, progress bar, completion %
- ✓ No console errors about `loadProjects is not a function`

**If Failed:**
- [ ] Check `js/member.js` line 348: Should have `window.loadProjects = loadProjects;`
- [ ] Check that Firestore has projects collection with data

**Pass/Fail:** ___________

---

### Test 2.3: Click Events Tab
**Objective:** Verify Events tab loads timeline

**Steps:**
1. From member portal, click "EVENTS" tab
2. Wait for data to load
3. Check console for errors

**Expected Results:**
- ✓ Events list appears
- ✓ Shows upcoming events with dates
- ✓ Each event shows: date box, title, description
- ✓ No console errors about `loadEvents is not a function`

**If Failed:**
- [ ] Check `js/member.js` line 381: Should have `window.loadEvents = loadEvents;`
- [ ] Check Firestore events collection for data

**Pass/Fail:** ___________

---

### Test 2.4: Click Feed Tab
**Objective:** Verify Feed tab loads announcements

**Steps:**
1. From member portal, click "FEED" tab
2. Wait for data to load
3. Check console for errors

**Expected Results:**
- ✓ Feed list appears
- ✓ Shows announcements/broadcasts
- ✓ No console errors about `loadFeed is not a function`

**If Failed:**
- [ ] Check `js/member.js` line 390: Should have `window.loadFeed = loadFeed;`
- [ ] Check Firestore for announcements data

**Pass/Fail:** ___________

---

## TEST SUITE 3: AUTH GUARD & REDIRECTS

### Test 3.1: Login Redirect Works
**Objective:** Verify login redirects to member portal

**Steps:**
1. Go to `http://localhost:3000/login.html`
2. Verify you're on login page
3. Log in with credentials
4. Monitor console during redirect

**Expected Results:**
- ✓ Login processes without errors
- ✓ Redirects to member portal cleanly
- ✓ No infinite loop (redirect happens once, not repeated)
- ✓ No console errors about auth

**If Failed - Infinite Redirect Loop:**
- [ ] Check `js/auth-guard.js` line 12: Should have `var _authGuardCalled = false;`
- [ ] Check that `_authGuardCalled` guard is set in `requireMember()`
- [ ] Monitor console: Type `_authGuardCalled` to check state

**Pass/Fail:** ___________

---

### Test 3.2: Admin Auto-Redirect
**Objective:** Verify admins redirect to admin portal

**Steps:**
1. Go to `http://localhost:3000/login.html`
2. Log in with admin account
3. Monitor redirect

**Expected Results:**
- ✓ Redirects to `admin.html`, not `member.html`
- ✓ No errors in console
- ✓ Admin dashboard loads

**If Failed:**
- [ ] Check Firestore user role is "admin"
- [ ] Check `js/auth-guard.js` for admin redirect logic

**Pass/Fail:** ___________

---

### Test 3.3: Guest Cannot Access Member Portal
**Objective:** Verify non-logged-in users can't access protected pages

**Steps:**
1. Open new incognito window (to clear login)
2. Go directly to `http://localhost:3000/member.html`
3. Check if redirected

**Expected Results:**
- ✓ Redirects to login page
- ✓ Cannot access member portal without authentication
- ✓ No console errors

**If Failed:**
- [ ] Check auth guard is loading
- [ ] Check Firebase authentication is properly configured

**Pass/Fail:** ___________

---

## TEST SUITE 4: CONSOLE VALIDATION

### Test 4.1: Function Export Check
**Objective:** Verify all public functions are exported

**Steps:**
1. Open member portal
2. Open console (F12 > Console)
3. Paste this code:

```javascript
var functions = ['loadMissions', 'loadProjects', 'loadEvents', 'loadFeed', 'updateProfile'];
var results = {};
functions.forEach(f => {
  results[f] = typeof window[f] === 'function' ? '✓' : '✗';
});
console.table(results);
```

**Expected Results:**
- ✓ All functions show `✓` (checkmark)
- ✗ Any `✗` (X) indicates missing export

**If Failed:**
- [ ] Check `js/member.js` for `window.functionName = functionName;` exports
- [ ] Reload page to clear cache
- [ ] Check for JavaScript errors loading member.js

**Pass/Fail:** ___________

---

### Test 4.2: Auth Guard Check
**Objective:** Verify auth guard prevents duplicate listeners

**Steps:**
1. From member portal console, type:
```javascript
console.log("Auth Guard Called:", _authGuardCalled);
console.log("Auth Guard Type:", typeof AuthGuard);
console.log("Functions:", {
  requireMember: typeof AuthGuard.requireMember,
  requireAdmin: typeof AuthGuard.requireAdmin,
  redirectIfLoggedIn: typeof AuthGuard.redirectIfLoggedIn
});
```

**Expected Results:**
- ✓ `_authGuardCalled` shows `true`
- ✓ `AuthGuard` is `"object"`
- ✓ All three guard functions are `"function"`

**If Failed:**
- [ ] Check `js/auth-guard.js` is loading
- [ ] Verify `_authGuardCalled` guard flag exists

**Pass/Fail:** ___________

---

### Test 4.3: User Data Check
**Objective:** Verify user is properly authenticated

**Steps:**
1. From member portal console, type:
```javascript
firebase.auth().currentUser;
```

**Expected Results:**
- ✓ Shows user object with uid, email, displayName
- ✓ Not null or undefined
- ✗ If null, user is not logged in (expected on login page)

**If Failed:**
- [ ] User not authenticated
- [ ] Check Firebase connection

**Pass/Fail:** ___________

---

## TEST SUITE 5: DATA LOADING

### Test 5.1: Firestore Connection
**Objective:** Verify Firestore loads data correctly

**Steps:**
1. From member portal console, type:
```javascript
db.collection("users").doc(firebase.auth().currentUser.uid).get()
  .then(doc => console.log("User data:", doc.data()))
  .catch(err => console.error("Error:", err));
```

**Expected Results:**
- ✓ Console shows user document data
- ✓ Shows name, department, role, XP, etc.
- ✗ Error indicates Firestore connection issue

**If Failed:**
- [ ] Check Firebase credentials in `js/firebase-config.js`
- [ ] Check Firestore database is accessible
- [ ] Check user record exists in database

**Pass/Fail:** ___________

---

### Test 5.2: Missions Data Load
**Objective:** Verify missions fetch from Firestore

**Steps:**
1. From member portal console, type:
```javascript
db.collection("tasks")
  .where("uid", "==", firebase.auth().currentUser.uid)
  .get()
  .then(snap => console.log("Missions found:", snap.size))
  .catch(err => console.error("Error:", err));
```

**Expected Results:**
- ✓ Shows number of missions assigned to user
- ✓ Shows `0` if user has no missions (acceptable)

**If Failed:**
- [ ] Check Firestore has "tasks" collection
- [ ] Check user record has matching uid

**Pass/Fail:** ___________

---

## TEST SUITE 6: PERFORMANCE

### Test 6.1: Page Load Time
**Objective:** Verify portal loads quickly

**Steps:**
1. Open member portal from login
2. Start timer when redirect begins
3. Stop timer when dashboard is fully visible

**Expected Results:**
- ✓ Loads within 3-5 seconds
- ✓ No lag or spinning wheels
- ✓ Smooth animations

**If Failed:**
- [ ] Check network tab (F12 > Network) for slow requests
- [ ] Check Firestore queries are optimized
- [ ] May indicate Firebase overload

**Pass/Fail:** ___________

---

### Test 6.2: Tab Switch Speed
**Objective:** Verify tabs switch quickly

**Steps:**
1. Click between tabs repeatedly
2. Measure time for data to appear

**Expected Results:**
- ✓ Tabs switch within 1-2 seconds
- ✓ No freezing or lag
- ✓ Smooth transitions

**If Failed:**
- [ ] Check for n+1 query problems
- [ ] Check Firestore indexes are configured

**Pass/Fail:** ___________

---

## TEST SUITE 7: MOBILE RESPONSIVENESS

### Test 7.1: Mobile Portrait
**Objective:** Verify works on mobile width

**Steps:**
1. Open DevTools (F12)
2. Click "Toggle Device Toolbar" (Ctrl+Shift+M)
3. Select "iPhone 12" or similar
4. Reload page

**Expected Results:**
- ✓ Layout adapts to mobile width
- ✓ All tabs visible and clickable
- ✓ Missions/projects render correctly
- ✓ No horizontal scrolling

**If Failed:**
- [ ] Check CSS media queries
- [ ] Check responsive design implementation

**Pass/Fail:** ___________

---

### Test 7.2: Mobile Landscape
**Objective:** Verify works on landscape

**Steps:**
1. In DevTools, rotate device to landscape
2. Test tab switching

**Expected Results:**
- ✓ Layout adapts to landscape width
- ✓ Content still visible and usable
- ✓ No overflow issues

**Pass/Fail:** ___________

---

## FINAL VERIFICATION SCRIPT

Copy-paste this complete validation in console:

```javascript
console.log("=== ENACTUS ISIMG MEMBER PORTAL FIX VERIFICATION ===\n");

var checks = {
  "Functions Exported": [
    ['loadMissions', typeof window.loadMissions === 'function'],
    ['loadProjects', typeof window.loadProjects === 'function'],
    ['loadEvents', typeof window.loadEvents === 'function'],
    ['loadFeed', typeof window.loadFeed === 'function'],
    ['updateProfile', typeof window.updateProfile === 'function']
  ],
  "Auth Guard": [
    ['Guard Flag Set', _authGuardCalled === true],
    ['AuthGuard Object', typeof AuthGuard === 'object'],
    ['User Logged In', firebase.auth().currentUser !== null]
  ],
  "Data": [
    ['Firestore Connected', typeof db !== 'undefined'],
    ['Firebase Auth Ready', typeof firebase.auth() !== 'undefined']
  ]
};

var allPassed = true;
Object.keys(checks).forEach(category => {
  console.log("📋 " + category);
  checks[category].forEach(check => {
    var status = check[1] ? '✓' : '✗';
    console.log("  " + status + " " + check[0]);
    if (!check[1]) allPassed = false;
  });
});

console.log("\n" + (allPassed ? "✓ ALL CHECKS PASSED" : "✗ SOME CHECKS FAILED"));
```

---

## SIGN-OFF

When all tests pass:

- [ ] Test Suite 1: Member Portal Initialization - **PASSED**
- [ ] Test Suite 2: Tab Switching - **PASSED**
- [ ] Test Suite 3: Auth Guard & Redirects - **PASSED**
- [ ] Test Suite 4: Console Validation - **PASSED**
- [ ] Test Suite 5: Data Loading - **PASSED**
- [ ] Test Suite 6: Performance - **PASSED**
- [ ] Test Suite 7: Mobile Responsiveness - **PASSED**
- [ ] Final Verification Script - **PASSED**

**Overall Result:** ✓ **READY FOR PRODUCTION**

Tester Name: ___________________
Date: ___________________
Browser: ___________________
OS: ___________________

