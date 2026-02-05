# Troubleshooting Admin Login

## Masalah: Tidak bisa login admin setelah seed

### 1. Verifikasi User di Database

Jalankan script verify untuk cek user dan password:

```bash
railway run node scripts/verify-admin.mjs
```

Script ini akan menampilkan:
- ✅ User ditemukan atau ❌ tidak ditemukan
- Email dan role user
- Apakah password valid

### 2. Cek Password yang Digunakan

**Default credentials:**
- Email: `admin@example.com`
- Password: `admin123`

**Jika menggunakan custom password:**
- Set `ADMIN_PASSWORD` di Railway Variables
- Jalankan seed ulang: `railway run npm run db:seed`

### 3. Seed Ulang Admin User

Jika user tidak ada atau password salah, seed ulang:

```bash
# Set environment variables di Railway (jika custom)
railway variables set ADMIN_EMAIL=admin@example.com
railway variables set ADMIN_PASSWORD=admin123

# Seed admin user
railway run npm run db:seed
```

Atau via Railway Shell:
1. Railway Dashboard → Service → Deployments → Shell
2. Jalankan:
   ```bash
   npm run db:seed
   ```

### 4. Cek Environment Variables di Railway

Pastikan di Railway Dashboard → Variables sudah ada:
- ✅ `DATABASE_URL` (otomatis dari MySQL service)
- ✅ `SESSION_SECRET` (wajib untuk production!)
- ✅ `ADMIN_EMAIL` (opsional, default: admin@example.com)
- ✅ `ADMIN_PASSWORD` (opsional, default: admin123)

**Penting:** `SESSION_SECRET` harus di-set di Railway, jika tidak cookie tidak akan valid!

### 5. Cek Cookie Settings

Di production (Railway), cookie di-set dengan `secure: true` yang memerlukan HTTPS.

**Pastikan:**
- Railway domain menggunakan HTTPS (Railway otomatis provide HTTPS)
- Browser tidak block cookies
- Coba clear cookies dan login lagi

### 6. Test Login dengan Credentials yang Benar

Setelah verify user, gunakan credentials yang ditampilkan:

```bash
railway run node scripts/verify-admin.mjs
```

Output akan menampilkan:
```
✅ Password valid!

Anda bisa login dengan:
  Email: admin@example.com
  Password: admin234  # <- Gunakan password ini
```

### 7. Cek Error di Browser Console

Buka browser DevTools (F12) → Console tab, cek apakah ada error:
- Cookie blocked?
- CORS error?
- Network error?

### 8. Cek Railway Logs

Railway Dashboard → Service → Deployments → View Logs

Cari error terkait:
- Database connection
- Prisma errors
- Authentication errors

### 9. Reset Admin User (Jika Semua Gagal)

Hapus user lama dan buat baru:

```bash
# Via Railway Shell
railway shell

# Jalankan Prisma Studio atau query langsung
npx prisma studio
# Atau delete via SQL:
# DELETE FROM User WHERE email = 'admin@example.com';

# Seed ulang
npm run db:seed
```

## Quick Fix Checklist

- [ ] User sudah di-seed (`railway run npm run db:seed`)
- [ ] User ditemukan di database (`railway run node scripts/verify-admin.mjs`)
- [ ] Password valid (cek output verify script)
- [ ] `SESSION_SECRET` sudah di-set di Railway Variables
- [ ] Menggunakan credentials yang benar (cek output verify)
- [ ] Clear browser cookies dan coba login lagi
- [ ] Cek Railway logs untuk error

## Common Issues

### Issue: "Email atau password salah"
**Solusi:** 
- Cek password dengan `verify-admin.mjs`
- Pastikan menggunakan password yang sama saat seed dan login

### Issue: Cookie tidak tersimpan
**Solusi:**
- Pastikan `SESSION_SECRET` sudah di-set di Railway
- Pastikan menggunakan HTTPS (Railway otomatis provide)
- Clear cookies dan coba lagi

### Issue: Redirect loop
**Solusi:**
- Clear semua cookies untuk domain Railway
- Pastikan `SESSION_SECRET` sama di semua environment
- Restart Railway service

### Issue: "Akses ditolak. Hanya admin yang dapat masuk"
**Solusi:**
- Pastikan user memiliki `role: "admin"` di database
- Seed ulang dengan: `railway run npm run db:seed`
