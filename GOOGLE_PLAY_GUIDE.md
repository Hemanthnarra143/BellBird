# Google Play Console Android App Bundle (.aab) Guide for BellBird

This guide provides everything you need to generate, sign, and upload your **Android App Bundle (`.aab`)** to the **Google Play Console**.

---

## 3 Quick Ways to Get Your `.aab` File

Choose the method that works best for you:

### Method 1: Automated 1-Click GitHub Actions (Zero Local Setup)

Because your repository includes `.github/workflows/android-bundle.yml`, GitHub will compile the `.aab` file for you in the cloud:

1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: setup Android App Bundle and Google Play configuration"
   git push origin main
   ```
2. In your GitHub repository:
   - Click on the **Actions** tab at the top.
   - In the left sidebar, click **Build Android App Bundle (.aab)**.
   - Click the **Run workflow** dropdown on the right.
   - (Optional) Enter your live production URL (e.g. `https://yourdomain.com` or your Hostinger domain).
   - Click the green **Run workflow** button.
3. Once the build finishes (takes ~1–2 minutes):
   - Click on the completed workflow run.
   - Scroll down to **Artifacts** at the bottom.
   - Click **`BellBird-release-aab`** to download your zip file containing:
     - `BellBird-release.aab` (Ready for Google Play Console upload!)
     - `android.keystore` (The signing key for updates)

---

### Method 2: PWABuilder (Official Microsoft & Google Web Tool)

Because BellBird now includes a 100% compliant `manifest.json`, Service Worker, and high-res icons, you can generate an `.aab` via browser:

1. Deploy BellBird to your live domain (e.g., on Hostinger).
2. Visit **[PWABuilder.com](https://www.pwabuilder.com/)**.
3. Enter your website URL (e.g., `https://yourdomain.com`) and click **Start**.
4. PWABuilder will test your PWA and show high scores for Manifest, Service Worker, and Security.
5. Click **Package for Stores** -> Choose **Google Play**.
6. Customize your Package ID (default: `com.bellbird.app`), Name, and Version.
7. Click **Generate** to download your ready-to-publish `.aab` bundle and signing key!

---

### Method 3: Build Locally Using Android Studio

If you have Android Studio installed on your computer:

1. Open Android Studio.
2. Select **Open an existing project** and choose the `android/` folder inside this repository.
3. Let Gradle sync dependencies.
4. From the top menu, go to **Build** → **Generate Signed Bundle / APK...**
5. Select **Android App Bundle** and click **Next**.
6. Select your existing keystore or click **Create new...** to create your Play Store signing key.
7. Select **release** build variant and click **Finish**.
8. Android Studio outputs your `.aab` in `android/app/release/app-release.aab`.

---

## Uploading to Google Play Console

### Step 1: Create Your App in Play Console
1. Log in to the **[Google Play Console](https://play.google.com/console)**.
2. Click **Create app**:
   - **App name**: `BellBird`
   - **Default language**: English (or your preferred language)
   - **App or game**: App
   - **Free or paid**: Free
   - Accept the Developer Program Policies and click **Create app**.

### Step 2: Set Up Store Listing Assets
Google Play requires these store listing assets (already prepared in this project):
- **App icon**: Upload `public/icons/icon-512.png` (512x512 PNG, max 1MB).
- **Feature graphic**: 1024 x 500 banner showcasing BellBird.
- **Phone screenshots**: Take 2 to 8 screenshots of the live feed, search, and profile pages.

### Step 3: Upload the `.aab` File
1. In the left menu of Play Console, go to **Testing** -> **Internal testing** (or **Closed testing** / **Production**).
2. Click **Create new release**.
3. Under **App bundles**, drag and drop your **`BellBird-release.aab`** file.
4. Set a **Release name** (e.g., `1.0.0 (1)`).
5. Enter your **Release notes**:
   ```
   Initial release of BellBird social network featuring real-time translation, verified creator badges, rich multimedia chirps, and full-text search.
   ```
6. Click **Save** -> **Review release** -> **Start rollout**.

---

## Verifying Full-Screen Native Experience (Digital Asset Links)

To remove the Chrome browser URL bar and give users a native full-screen app experience:

1. In Google Play Console, go to **Release** -> **Setup** -> **App signing**.
2. Find the **Digital Asset Links JSON** snippet or copy the **SHA-256 certificate fingerprint**.
3. Paste the SHA-256 fingerprint into `public/.well-known/assetlinks.json`:
   ```json
   [
     {
       "relation": ["delegate_permission/common.handle_all_urls"],
       "target": {
         "namespace": "android_app",
         "package_name": "com.bellbird.app",
         "sha256_cert_fingerprints": [
           "YOUR_GOOGLE_PLAY_SHA256_FINGERPRINT_HERE"
         ]
       }
     }
   ]
   ```
4. Deploy the updated file to your server so it is accessible at `https://yourdomain.com/.well-known/assetlinks.json`.
5. Google Play and Android will automatically verify the association, launching BellBird in standalone native full-screen mode!
