# Fastlane Setup for Reading Enhancement App

This project is configured to automatically build and deploy to TestFlight using Fastlane.

## 🚀 Quick Start

Once configured (see below), deploy to TestFlight with:

```bash
yarn deploy:testflight
```

## ⚙️ Initial Configuration Required

Before your first deployment, you need to configure:

### 1. Apple Developer Credentials (Environment Variables)

**🔒 SECURITY:** Credentials are stored in environment variables, NOT in git!

**Option A: Use a .env file (Recommended)**

1. Copy the example file:
   ```bash
   cp fastlane/.env.example fastlane/.env
   ```

2. Edit `fastlane/.env` and add your credentials:
   ```bash
   FASTLANE_USER=your-email@example.com
   FASTLANE_TEAM_ID=XXXXXXXXXX
   ```

3. The `.env` file is gitignored and will never be committed

**Option B: Export in your shell**

Add to your `~/.zshrc` or `~/.bash_profile`:
```bash
export FASTLANE_USER="your-email@example.com"
export FASTLANE_TEAM_ID="XXXXXXXXXX"
```

**Finding your Team ID:**
- Go to App Store Connect → Membership
- Or Apple Developer → Membership → Team ID

### 2. Code Signing

You have two options:

#### Option A: Manual Code Signing (Simpler)
- Keep your existing certificates and provisioning profiles
- Update the `provisioningProfiles` section in `fastlane/Fastfile` with your actual provisioning profile name
- Find it in Xcode → Preferences → Accounts → Team → Manage Certificates

#### Option B: Fastlane Match (Recommended for teams)
- Run `bundle exec fastlane match init` to set up automatic code signing
- Follow the prompts to store certificates in a private Git repo
- Update `Fastfile` to use `match` instead of manual profiles

### 3. App Store Connect API Key (Optional but recommended)

For better authentication, create an API key:

1. Go to App Store Connect → Users and Access → Keys
2. Create a new API Key with "App Manager" role
3. Download the `.p8` file
4. Add to `Appfile`:

```ruby
app_store_connect_api_key(
  key_id: "YOUR_KEY_ID",
  issuer_id: "YOUR_ISSUER_ID",
  key_filepath: "./fastlane/AuthKey_XXXXXXXXXX.p8"
)
```

## 📋 What the Pipeline Does

When you run `yarn deploy:testflight`, it will:

1. ✅ Increment the build number automatically
2. ✅ Install CocoaPods dependencies
3. ✅ Build the iOS app with App Store export
4. ✅ Upload to TestFlight
5. ✅ Make the build available to your internal testers

## 🎛️ Customization Options

Edit `fastlane/Fastfile` to customize:

- **Auto version bumping**: Currently ON - set build number manually by commenting out `increment_build_number`
- **Git integration**: Currently OFF - uncomment the git commands to auto-commit and tag
- **External testers**: Set `distribute_external: true` to immediately release to external testers
- **Wait for processing**: Set `skip_waiting_for_build_processing: false` to wait for Apple's review

## 🔍 Testing the Setup

Before your first real deployment, test with:

```bash
# Check if everything is configured correctly
bundle exec fastlane ios beta --verbose
```

## 📚 Resources

- [Fastlane Documentation](https://docs.fastlane.tools/)
- [TestFlight Guide](https://docs.fastlane.tools/actions/upload_to_testflight/)
- [Code Signing Guide](https://docs.fastlane.tools/codesigning/getting-started/)

## 🆘 Troubleshooting

**"No signing certificate found"**
→ Run `bundle exec fastlane match development` and `bundle exec fastlane match appstore`

**"Could not find workspace"**
→ Make sure CocoaPods is installed: `cd ios && bundle exec pod install`

**"Authentication failed"**
→ Check your Apple ID and team ID in `Appfile` or set up App Store Connect API key
