# Vercel Deployment Rule

- **Deployment Target:** Project này được build và deploy trực tiếp trên **Vercel** (không build/run production trên local).
- **Serverless Compatibility:** Tất cả các API routes và logic backend phải tương thích hoàn toàn với môi trường Vercel Serverless (không phụ thuộc vào Docker, Podman, hay background daemon trên local).
- **Git Push Workflow:** Mỗi khi cập nhật tính năng mới, kiểm tra TypeScript và push lên nhánh `main` trên GitHub (`https://github.com/tientaisv/openvid`) để Vercel tự động build & deploy.
- **Environment Variables:** Các cấu hình bí mật như `GEMINI_API_KEY`, `UNSPLASH_ACCESS_KEY`, `PEXELS_API_KEY`, `PIXABAY_API_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` được quản lý trực tiếp qua **Vercel Environment Variables** và không lưu hardcode trong source code.
