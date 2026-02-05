# Fix 500 Error pada Login

Error 500 (Internal Server Error) terjadi saat login. Berikut langkah-langkah untuk fix:

## 🔍 Debugging Steps

### 1. Cek Railway Logs

Railway Dashboard → Service → Deployments → **View Logs**

Setelah attempt login, cari error messages:
- "Database error during login"
- "Bcrypt error during login"
- "Session creation error"
- "Cookie setting error"
- "Unexpected login error"

Error detail akan menunjukkan di mana masalahnya.

### 2. Common Issues & Solutions

#### Issue: bcrypt Native Binding Error

**Error:** `Error: Cannot find module 'bcrypt'` atau `bcrypt native bindings`

**Solusi:**
```bash
# Rebuild bcrypt di Railway
railway run npm rebuild bcrypt

# Atau reinstall dependencies
railway run npm install --force
```

#### Issue: Prisma Client Not Generated

**Error:** `PrismaClient is not configured` atau `@prisma/client not found`

**Solusi:**
```bash
# Generate Prisma client
railway run npx prisma generate

# Atau trigger rebuild
railway run npm run build
```

#### Issue: Database Connection Error

**Error:** `P1001: Can't reach database server` atau connection timeout

**Solusi:**
1. Cek `DATABASE_URL` di Railway Variables
2. Pastikan MySQL service running di Railway
3. Test connection: `railway run npx prisma db push`

#### Issue: SESSION_SECRET Missing

**Error:** JWT signing error atau `SESSION_SECRET` undefined

**Solusi:**
```bash
railway variables set SESSION_SECRET=ee6f26b2caa4a76fa8c944c414ffd178a32e203c3f0c100e6308403d85f08b48
```

#### Issue: Cookie Setting Error

**Error:** `cookies()` error atau cookie not set

**Solusi:**
- Pastikan menggunakan HTTPS (Railway otomatis provide)
- Cek Railway logs untuk cookie error detail

### 3. Test Login Flow

Jalankan test script untuk verify semua komponen:

```bash
railway run node scripts/test-login.mjs
```

Script ini akan test:
- ✅ Database connection
- ✅ User lookup
- ✅ Password verification
- ✅ Session token creation

Jika semua test berhasil tapi masih error 500, masalahnya di browser/client side.

### 4. Rebuild & Redeploy

Jika semua di atas tidak membantu, rebuild dari scratch:

```bash
# 1. Rebuild dependencies
railway run npm install --force

# 2. Generate Prisma client
railway run npx prisma generate

# 3. Rebuild application
railway run npm run build

# 4. Restart service (via Railway dashboard)
```

### 5. Check Build Logs

Railway Dashboard → Service → Deployments → **Build Logs**

Cari:
- ❌ Build errors
- ❌ Missing dependencies
- ❌ Prisma generation errors
- ❌ TypeScript errors

## 📝 Error Logging

Setelah update error handling, semua error akan di-log dengan detail:

- Database errors → "Database error during login: [detail]"
- Bcrypt errors → "Bcrypt error during login: [detail]"
- Session errors → "Session creation error: [detail]"
- Cookie errors → "Cookie setting error: [detail]"

Cek Railway logs untuk melihat error detail yang spesifik.

## 🚀 Quick Fix Checklist

- [ ] Cek Railway logs untuk error detail
- [ ] Pastikan `DATABASE_URL` sudah benar
- [ ] Pastikan `SESSION_SECRET` sudah di-set
- [ ] Pastikan `NODE_ENV=production` sudah di-set
- [ ] Test login flow: `railway run node scripts/test-login.mjs`
- [ ] Rebuild bcrypt jika native binding error: `railway run npm rebuild bcrypt`
- [ ] Generate Prisma client: `railway run npx prisma generate`
- [ ] Restart Railway service

## 🔧 Manual Fix Commands

```bash
# Full rebuild
railway run npm install --force
railway run npx prisma generate
railway run npm run build

# Test components
railway run node scripts/verify-admin.mjs
railway run node scripts/test-login.mjs

# Check environment
railway variables
```

Setelah semua langkah, coba login lagi dan cek Railway logs untuk error detail.
