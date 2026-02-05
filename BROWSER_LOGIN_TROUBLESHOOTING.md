# Browser Login Troubleshooting

Login flow sudah berhasil di server (tested), tapi masih tidak bisa login di browser? Ikuti langkah-langkah ini:

## ✅ Credentials yang Benar

- **Email:** `admin@example.com`
- **Password:** `admin123`

## 🔍 Langkah Troubleshooting

### 1. Pastikan Menggunakan HTTPS

Railway otomatis provide HTTPS. Pastikan URL menggunakan `https://`:
- ✅ `https://webgis-semarang-barat-production.up.railway.app/internal/auth/sign-in`
- ❌ `http://webgis-semarang-barat-production.up.railway.app/internal/auth/sign-in`

### 2. Clear Browser Cookies

**Chrome/Edge:**
1. F12 → Application tab → Cookies
2. Pilih domain Railway Anda
3. Delete semua cookies
4. Refresh halaman

**Firefox:**
1. F12 → Storage tab → Cookies
2. Delete cookies untuk domain Railway
3. Refresh halaman

**Atau via Browser Settings:**
- Clear browsing data → Cookies → Last hour

### 3. Cek Browser Console (F12)

Buka DevTools (F12) → Console tab, cari error:
- Cookie blocked?
- CORS error?
- Network error?
- JavaScript error?

### 4. Cek Network Tab

1. F12 → Network tab
2. Login dengan credentials
3. Cari request ke `/internal/auth/sign-in`
4. Klik request → Response tab
5. Apakah response `success: true`?
6. Cek Headers → Set-Cookie → apakah cookie `admin_session` di-set?

### 5. Cek Application/Storage Tab

Setelah login attempt:
1. F12 → Application tab (Chrome) atau Storage tab (Firefox)
2. Cookies → pilih domain Railway
3. Apakah ada cookie `admin_session`?
4. Jika tidak ada → cookie tidak tersimpan (masalah browser/security)

### 6. Test di Incognito/Private Mode

1. Buka Incognito/Private window
2. Buka Railway domain
3. Coba login
4. Jika berhasil → masalah cookie di browser normal

### 7. Disable Browser Extensions

Beberapa extension bisa block cookies:
- Ad blockers
- Privacy extensions
- Security extensions

Coba disable semua extension dan test lagi.

### 8. Cek Railway Logs

Railway Dashboard → Service → Deployments → View Logs

Setelah login attempt, cek logs untuk:
- Error messages
- "Login successful for admin@example.com" (harus muncul jika berhasil)
- "Login failed" messages

### 9. Test dengan curl (Advanced)

Test login langsung via API:

```bash
curl -X POST https://webgis-semarang-barat-production.up.railway.app/internal/auth/sign-in \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=admin@example.com&password=admin123" \
  -v -c cookies.txt

# Cek apakah cookie tersimpan
cat cookies.txt
```

### 10. Pastikan Environment Variables

Railway Dashboard → Variables, pastikan ada:
- ✅ `DATABASE_URL`
- ✅ `SESSION_SECRET` (wajib!)
- ✅ `NODE_ENV=production` (sudah di-set)

## 🐛 Common Issues

### Issue: "Email atau password salah" padahal sudah benar

**Penyebab:** Password di database berbeda dengan yang di input

**Solusi:**
```bash
railway run node scripts/verify-admin.mjs
# Gunakan password yang ditampilkan di output
```

### Issue: Redirect ke sign-in terus menerus

**Penyebab:** Cookie tidak tersimpan atau tidak valid

**Solusi:**
1. Clear cookies
2. Pastikan menggunakan HTTPS
3. Cek browser console untuk error
4. Cek Network tab untuk Set-Cookie header

### Issue: Cookie tidak muncul di Application tab

**Penyebab:** 
- Browser block cookies
- Secure cookie tidak bisa di-set via HTTP
- SameSite policy

**Solusi:**
1. Pastikan menggunakan HTTPS
2. Clear cookies dan coba lagi
3. Test di Incognito mode
4. Disable browser extensions

### Issue: "Terjadi kesalahan saat login"

**Penyebab:** Error di server saat create session

**Solusi:**
1. Cek Railway logs untuk error detail
2. Pastikan `SESSION_SECRET` sudah di-set
3. Restart Railway service

## 📝 Debug Checklist

- [ ] Menggunakan HTTPS (bukan HTTP)
- [ ] Credentials benar (`admin@example.com` / `admin123`)
- [ ] Clear cookies sebelum test
- [ ] Browser console tidak ada error
- [ ] Network tab menunjukkan Set-Cookie header
- [ ] Cookie `admin_session` muncul di Application tab
- [ ] Railway logs menunjukkan "Login successful"
- [ ] Test di Incognito mode
- [ ] `SESSION_SECRET` sudah di-set di Railway
- [ ] `NODE_ENV=production` sudah di-set

## 🆘 Masih Tidak Bisa?

Jika semua langkah di atas sudah dicoba tapi masih tidak bisa:

1. **Screenshot:**
   - Browser console (F12 → Console)
   - Network tab (request ke sign-in)
   - Application tab (Cookies)
   - Railway logs

2. **Info yang dibutuhkan:**
   - Browser dan versi
   - OS
   - Error message yang muncul
   - Apakah cookie muncul di Application tab?

3. **Test alternatif:**
   - Coba browser lain (Chrome, Firefox, Edge)
   - Coba device lain
   - Coba network lain (mobile hotspot)
