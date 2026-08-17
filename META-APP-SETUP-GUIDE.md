# Meta App Setup - Complete Guide (Step by Step) 📱

> Bhai, ye sabse confusing part hai. Isko dhyan se padh, ek ek step follow kar.

---

## Table of Contents
1. [Meta Developer Account Banao](#1-meta-developer-account-banao)
2. [App Create Karo](#2-app-create-karo)
3. [Instagram Product Add Karo](#3-instagram-product-add-karo)
4. [App Settings Configure Karo](#4-app-settings-configure-karo)
5. [Instagram Login Setup Karo](#5-instagram-login-setup-karo)
6. [Permissions Request Karo](#6-permissions-request-karo)
7. [Webhook Setup Karo](#7-webhook-setup-karo)
8. [App Review Submit Karo](#8-app-review-submit-karo)
9. [Testing Karo](#9-testing-karo)
10. [Common Errors + Solutions](#10-common-errors--solutions)

---

## 1. Meta Developer Account Banao

### Step 1: Developer Website Pe Jao

```
URL: https://developers.facebook.com
```

### Step 2: Login Karo

```
- Apne Facebook account se login karo
- Agar Facebook account nahi hai toh pehle bana lo
- IMPORTANT: Jo Facebook account use karoga, wo business account hona chahiye
```

### Step 3: Developer Account Banao

```
- Login ke baad "Get Started" button dikhega
- Click karo
- "Create Account" pe click karo
- Apna naam daalo
- Email daalo
- Country select karo
- "Submit" pe click karo
```

### Step 4: Phone Number Verify Karo

```
- Phone number daalo
- OTP aayega
- OTP daalo
- Verify ho jayega
```

### Step 5: App Type Select Karo

```
- "What kind of apps do you build?" poochega
- "Business" select karo
- "Next" pe click karo
```

---

## 2. App Create Karo

### Step 1: App Dashboard Pe Jao

```
URL: https://developers.facebook.com/apps/

"Create App" button pe click karo
```

### Step 2: App Type Select Karo

```
Ye options aayenge:
✅ Business
- Consumer
- Gaming
- etc.

"Business" select karo kyunki hum Instagram API use kar rahe hain

"Next" pe click karo
```

### Step 3: App Details Daalo

```
App Name: ViraloKit (ya apna naam daalo)
App Contact Email: apna email daalo
Business Account: (Agar hai toh select karo, nahi toh skip karo)

"Create App" pe click karo
```

### Step 4: Security Check

```
- Facebook password daalo
- "Submit" pe click karo
- App create ho jayega
```

### Step 5: App ID Note Karo

```
App Dashboard khulega
Top mein dikhega:
App ID: 1234567890123456

Ye yaad rakhlo / note karlo
Ye hum baad mein use karenge
```

---

## 3. Instagram Product Add Karo

### Step 1: App Dashboard Pe Jao

```
Left sidebar mein "Products" pe click karo
```

### Step 2: Instagram Add Karo

```
Products ki list dikhegi:
✅ Instagram
- Facebook Login
- Messenger
- etc.

"Instagram" pe "Set Up" button hai, uspe click karo
```

### Step 3: Instagram Login Type Select Karo

```
Do options aayenge:

Option A: Instagram API setup with Instagram login ✅ (Ye select karo)
Option B: Instagram API setup with Facebook login

IMPORTANT: "Instagram login" select karo kyunki:
- Hum sirf Instagram use kar rahe hain
- Facebook Page ki zaroorat nahi
- Setup simple hai

"Next" pe click karo
```

### Step 4: Instagram App Settings

```
Business Login for Instagram section dikhega:

Instagram App ID: (ye automatically aa jayega)
Instagram App Secret: (ye bhi aa jayega)

Ye dono note karlo:
- Instagram App ID = META_CLIENT_ID
- Instagram App Secret = META_CLIENT_SECRET

"Next" pe click karo
```

---

## 4. App Settings Configure Karo

### Step 1: Basic Settings

```
Left sidebar mein "Settings" > "Basic" pe click karo

Yahan ye daalo:
- App Name: ViraloKit
- App Domains: viralo-kit.vercel.app (ya apna domain)
- Contact Email: apna email
- Privacy Policy URL: https://viralo-kit.vercel.app/privacy-policy
- Terms of Service URL: https://viralo-kit.vercel.app/terms-of-service

"Save Changes" pe click karo
```

### Step 2: Instagram Settings

```
Left sidebar mein "Instagram" > "API setup with Instagram login" pe click karo

Yahan ye configure karo:
```

#### Valid OAuth Redirect URIs:

```
Production ke liye:
https://viralo-kit.vercel.app/api/instagram/callback

Development ke liye:
http://localhost:3000/api/instagram/callback

Dono daalo (comma separated)
```

#### Deauthorize Callback URL:

```
https://viralo-kit.vercel.app/api/webhooks/instagram
```

#### Data Deletion Request URL:

```
https://viralo-kit.vercel.app/api/webhooks/instagram
```

### Step 3: Webhooks Settings

```
Left sidebar mein "Instagram" > "Webhooks" pe click karo

Callback URL: https://viralo-kit.vercel.app/api/webhooks/instagram
Verify Token: ViraloKit-my-secret-token-123

"Verify and Save" pe click karo
```

---

## 5. Instagram Login Setup Karo

### Step 1: Instagram API Settings

```
Left sidebar mein "Instagram" > "API setup with Instagram login" pe click karo
```

### Step 2: Webhook Fields Subscribe Karo

```
"Webhooks" section mein:

"Subscribe to events" pe click karo

Ye events select karo:
✅ comments
✅ messages
✅ messaging_postbacks (optional)

"Subscribe" pe click karo
```

### Step 3: Permissions Section

```
"Permissions" section mein dikhega:

Available Permissions:
✅ instagram_business_basic
✅ instagram_business_content_publish
✅ instagram_business_manage_messages
✅ instagram_business_manage_comments

Ye sab "Request" button pe click karke request karo
```

---

## 6. Permissions Request Karo

### Step 1: App Review Pe Jao

```
Left sidebar mein "App Review" pe click karo
```

### Step 2: Permissions and Features

```
"Permissions and Features" pe click karo

Sari permissions dikhegi:
✅ instagram_business_basic
✅ instagram_business_content_publish
✅ instagram_business_manage_messages
✅ instagram_business_manage_comments

Har permission ke liye "Request" pe click karo
```

### Step 3: Permission Details Daalo

```
Har permission ke liye ye daalo:

Why do you need this permission?
(English mein likho)
Example: "We need this permission to allow users to publish posts to their Instagram business accounts"

How does your app use this permission?
(Step by step batao)
Example:
1. User logs in with Instagram
2. We get their access token
3. We use the token to publish posts on their behalf
4. User can manage their posts from our dashboard

Submit karo
```

### Step 4: App Verification

```
Agar tumhara app naya hai toh:

"Verify App" pe click karo
- App verification form bharna padega
- Business verification bhi ho sakta hai
- 2-5 din lag sakte hain

Agar sirf apne liye bana rahe ho:
- "Development Mode" mein rehne do
- Sirf tumhare testers kaam karenge
```

---

## 7. Webhook Setup Karo

### Step 1: Local Testing (ngrok)

```bash
# Terminal mein chalao:
ngrok http 3000

# Output mein dikhega:
# Forwarding  https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:3000

# URL copy karo
```

### Step 2: Meta Dashboard Mein Daalo

```
Left sidebar mein "Instagram" > "Webhooks" pe click karo

Callback URL: https://xxxx-xx-xx-xx-xx.ngrok-free.app/api/webhooks/instagram
Verify Token: ViraloKit-my-secret-token-123

"Verify and Save" pe click karo

Agar green tick aata hai = success!
Agar red cross aata hai = URL ya token check karo
```

### Step 3: Events Subscribe Karo

```
"Webhooks" section mein:

"Active Events" pe click karo

Ye events enable karo:
✅ comments
✅ messages

"Save" pe click karo
```

### Step 4: Test Karo

```
Apne Instagram account se:
1. Kisi post pe comment karo
2. Apne business account ko DM karo

Webhook Dashboard mein events dikhni chahiye:
https://developers.facebook.com/apps/YOUR_APP_ID/webhooks/
```

---

## 8. App Review Submit Karo

### Step 1: App Review Requirements

```
Left sidebar mein "App Review" > "Permissions and Features" pe click karo

Ye requirements puri karo:
1. App icon upload karo (512x512 px)
2. Privacy Policy URL daalo
3. Data handling explanation daalo
4. App description daalo
```

### Step 2: Detailed Explanation Daalo

```
Har permission ke liye detailed explanation daalo:

Example for instagram_business_basic:
"We use this permission to:
1. Get user's Instagram account information
2. Display their profile in our dashboard
3. Allow them to manage their account"

Example for instagram_business_content_publish:
"We use this permission to:
1. Publish posts on behalf of the user
2. Schedule posts for later publishing
3. Delete posts if user requests"

Example for instagram_business_manage_messages:
"We use this permission to:
1. Receive messages sent to user's Instagram
2. Send automated replies
3. Allow user to manage messages from dashboard"

Example for instagram_business_manage_comments:
"We use this permission to:
1. Receive comments on user's posts
2. Reply to comments on behalf of user
3. Allow user to manage comments from dashboard"
```

### Step 3: Video Demo (Optional but Recommended)

```
Agar possible ho toh:
1. Screen recording karo
2. Dikhao ki tumhara app kaise kaam karta hai
3. Upload karo

Ye approval fast kar deta hai
```

### Step 4: Submit Karo

```
"Submit for Review" pe click karo

Review mein 2-5 din lag sakte hain
Email aayega approval ke baad
```

---

## 9. Testing Karo

### Step 1: Tester Add Karo

```
Left sidebar mein "Roles" pe click karo

"Test Users" section mein:
"Add" pe click karo

Apna Instagram account daalo (jo business account hai)
"Submit" pe click karo
```

### Step 2: Development Mode Mein Test

```
"App Review" > "Development Mode" ON karo

Ab sirf tumhare testers kaam karenge
Tumhara Instagram account kaam karega
```

### Step 3: Login Test Karo

```
1. Apne app pe jao
2. "Login with Instagram" pe click karo
3. Instagram ka login page aayega
4. Apne business account se login karo
5. Permissions grant karo
6. Redirect ho jayega tumhare app mein
```

### Step 4: API Test Karo

```
Instagram Graph API Explorer mein test karo:
https://developers.facebook.com/tools/explorer/

1. Apna app select karo
2. Access Token generate karo
3. API call karo:
   GET /me?fields=id,username,name

Agar response aata hai = sab sahi hai!
```

---

## 10. Common Errors + Solutions

### Error 1: "Invalid OAuth Redirect URI"

```
Problem: Redirect URI match nahi kar raha
Solution:
1. Meta Dashboard mein jao
2. Instagram > API setup with Instagram login
3. Valid OAuth Redirect URIs check karo
4. Ye sahi se daalo:
   - https://viralo-kit.vercel.app/api/instagram/callback
   - http://localhost:3000/api/instagram/callback
5. "Save" pe click karo
```

### Error 2: "Invalid App Secret"

```
Problem: App Secret galat hai
Solution:
1. Meta Dashboard mein jao
2. Settings > Basic
3. "Show" button pe click karo (App Secret ke bagal mein)
4. Secret copy karo
5. .env.local mein daalo
```

### Error 3: "Error validating access token"

```
Problem: Access token expire ho gaya ya galat hai
Solution:
1. Token ki validity check karo
2. Long-lived token use karo
3. Token refresh karo
4. Graph API Explorer mein naya token generate karo
```

### Error 4: "Webhook verification failed"

```
Problem: Webhook URL ya token galat hai
Solution:
1. Verify Token match karo (.env.local aur Meta Dashboard)
2. URL sahi hai? https:// hona chahiye
3. ngrok chal raha hai? (local testing ke liye)
4. Server response 200 hona chahiye
```

### Error 5: "Permissions not approved"

```
Problem: App Review approve nahi hua
Solution:
1. App Review status check karo
2. Requirements puri karo
3. Detailed explanation daalo
4. Video demo upload karo (optional)
5. Dobara submit karo
```

### Error 6: "Application does not have permission"

```
Problem: Permission grant nahi hui
Solution:
1. App Dashboard > Roles mein jao
2. Apne aap ko Admin role do
3. Login karke permissions grant karo
4. Token generate karo with permissions
```

### Error 7: "Rate limit exceeded"

```
Problem: Bahut zyada API calls ho gayi
Solution:
1. Rate limit wait karo (usually 1 hour)
2. API calls optimize karo
3. Caching use karo
4. Webhooks use karo (polling nahi)
```

### Error 8: "App not live"

```
Problem: App development mode mein hai
Solution:
1. App Review submit karo
2. Approval ka wait karo
3. Ya "Development Mode" mein test karo
4. Sirf testers kaam karenge
```

---

## Quick Checklist

```
✅ Meta Developer Account banao
✅ App create karo (Business type)
✅ Instagram Product add karo
✅ Instagram Login setup karo
✅ Redirect URIs daalo
✅ Webhook URL daalo
✅ Permissions request karo
✅ App Review submit karo
✅ Tester add karo
✅ Testing karo
✅ Live karo
```

---

## Important URLs

```
Meta Developer Dashboard:
https://developers.facebook.com/apps/

Instagram API Explorer:
https://developers.facebook.com/tools/explorer/

Graph API Reference:
https://developers.facebook.com/docs/graph-api

Instagram Platform Documentation:
https://developers.facebook.com/docs/instagram-platform

Webhook Documentation:
https://developers.facebook.com/docs/messenger-platform/instagram/features/webhook
```

---

## Video Tutorials (YouTube)

```
1. "How to Create Meta App for Instagram API"
   - https://youtube.com/watch?v=xxxxx

2. "Instagram Graph API Complete Tutorial"
   - https://youtube.com/watch?v=xxxxx

3. "Instagram Webhook Setup Guide"
   - https://youtube.com/watch?v=xxxxx
```

---

> Bhai, ye sab kar le toh Meta app ready ho jayega. Koi step mein atak jaye toh seedha pooch! 💪
