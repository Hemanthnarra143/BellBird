# Google Play Console Android App Bundle (.aab) Guide for BellBird

This guide solves the two Google Play Console errors and shows how to generate and upload your **Android App Bundle (`.aab`)**:

---

## 1. Resolution of the Google Play Console Errors

### Issue A: Package Name Mismatch (`com.bellbird.myapp`)
> **Google Play Error**: *"Your APK or Android App Bundle needs to have the package name com.bellbird.myapp"*

**Fixed**: The package name is now set to **`com.bellbird.myapp`** across all files:
- `public/manifest.json` (`id: "com.bellbird.myapp"`)
- `public/.well-known/assetlinks.json` (`package_name: "com.bellbird.myapp"`)
- `twa-manifest.json` (`packageId: "com.bellbird.myapp"`)
- `android/app/build.gradle` (`applicationId "com.bellbird.myapp"`)

---

### Issue B: Signing Key Mismatch (SHA-1 Error)
> **Google Play Error**: *"Your Android App Bundle is signed with the wrong key... expected fingerprint SHA1: 58:2D:47:D1:CB:08:F5:7C:32:AA:42:BD:C1:E3:2C:3A:7A:37:48:AC but the certificate used ... has fingerprint: SHA1: 70:C0:97:..."*

This occurs because Google Play already registered an upload certificate fingerprint (`58:2D:47:D1...`) when you first created the app or uploaded an initial bundle. Google Play rejects any bundle signed with a different key.

#### How to fix the signing key mismatch (Choose Option 1 or Option 2):

#### Option 1: Reset Your Upload Key in Google Play Console (Recommended if key was lost or random)
Google Play provides a 1-minute self-service form to update your upload key to our new persistent key:
1. Open the **[Google Play Console](https://play.google.com/console)**.
2. Select your app **BellBird** (`com.bellbird.myapp`).
3. In the left navigation menu, go to **Setup** → **App integrity** (or **App signing**).
4. Under the **Upload key certificate** section, click **Request upload key reset** (or click the support link: *"If you lost your upload key, you can contact our support team"*).
5. When asked for a reason, select: **"I lost my upload key"** or **"Upload key mismatch"**.
6. When prompted to attach a new upload certificate:
   - Upload the file **`android/upload_certificate.pem`** (included in this repository and inside the GitHub Actions zip download).
7. Submit the request. Google will reset your upload certificate to match `android/upload_certificate.pem`.
8. Once updated, upload the generated `BellBird-release.aab` and it will succeed without any signing error!

#### Option 2: Use Your Existing Keystore (If you saved your original keystore file)
If you have the original keystore file that produced the `58:2D:47:D1...` fingerprint:
1. Base64-encode your keystore file:
   - On Linux/macOS:
     ```bash
     base64 -w 0 your-original-keystore.keystore > keystore_base64.txt
     ```
   - On Windows (PowerShell):
     ```powershell
     [Convert]::ToBase64String([IO.File]::ReadAllBytes("your-original-keystore.keystore")) | Out-File keystore_base64.txt
     ```
2. In your GitHub repository:
   - Go to **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
   - Name: `ORIGINAL_KEYSTORE_BASE64`
   - Value: Paste the text from `keystore_base64.txt`.
3. Re-run the GitHub Actions workflow. The workflow will use your exact original keystore to sign the `.aab`, perfectly matching `58:2D:47:D1...`.

---

## 2. Generating Your `.aab` File via GitHub Actions (Zero Local Setup)

Your repository includes a ready-to-use GitHub Actions workflow (`.github/workflows/android-bundle.yml`):

1. **Commit and push** the updated files to GitHub:
   ```bash
   git add .
   git commit -m "fix: set package name to com.bellbird.myapp and configure release keystore"
   git push origin main
   ```
2. In your GitHub repository:
   - Click the **Actions** tab.
   - Click **Build Android App Bundle (.aab)** in the left sidebar.
   - Click **Run workflow**.
   - (Optional) Enter your live production URL (e.g. `https://yourdomain.com`).
   - Click the green **Run workflow** button.
3. Once the build finishes (~1–2 minutes):
   - Click the completed run.
   - Under **Artifacts** at the bottom, download **`BellBird-release-aab`**.
   - Inside the zip is:
     - **`BellBird-release.aab`** (Upload this to Google Play Console!)
     - **`android/bellbird-release.keystore`** (The permanent release keystore)
     - **`android/upload_certificate.pem`** (Certificate to submit to Google if resetting upload key)

---

## 3. Alternative Method: Local Build via Android Studio

If you prefer building locally on your machine:
1. Open **Android Studio** → **Open an existing project** → select the `android/` directory.
2. Let Gradle sync.
3. From the menu, select **Build** → **Generate Signed Bundle / APK...** → **Android App Bundle**.
4. In the Keystore path:
   - Point to `android/bellbird-release.keystore` (or your existing key)
   - Password: `bellbird123`
   - Alias: `bellbird`
   - Key password: `bellbird123`
5. Select **release** variant and click **Finish**.
6. The bundle is created at `android/app/release/app-release.aab`.

---

## 4. Google Play Console Upload Checklist

1. In **Google Play Console**, go to **Testing** → **Internal testing** (or **Closed testing** / **Production**).
2. Click **Create new release**.
3. Drag and drop **`BellBird-release.aab`**.
4. Set Release name: `1.0.0 (1)`.
5. Click **Save** → **Review release** → **Start rollout**.
