"use client";

import { useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/react";
import { useAuth } from "@/app/contexts/useAuth";

export default function Login() {
  const router = useRouter();
  const { setLocalUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Email hoặc mật khẩu không chính xác");
      }

      setLocalUser(data.user, data.profile);
      router.push("/editor");
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-[#030303] grid lg:grid-cols-2 text-white selection:bg-white/30"
      role="main"
    >
      <div className="relative flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32">
        <div className="absolute top-8 left-8 sm:left-12 lg:left-16">
          <Button
            variant="ghost"
            size="sm"
            className="text-neutral-500 hover:text-white hover:bg-white/5 tracking-wide text-xs uppercase"
            asChild
          >
            <Link href="/">
              <Icon icon="solar:arrow-left-linear" className="mr-2" width="16" />
              Quay lại Trang chủ
            </Link>
          </Button>
        </div>
        <div className="w-full max-w-sm mx-auto mt-16 lg:mt-0">
          <div className="mb-8">
            <Image
              src="/svg/logo-openvid.svg"
              alt="openvid logo"
              width={60}
              height={60}
              className="mb-4"
            />
            <h1 className="text-3xl sm:text-4xl font-light tracking-tighter text-white mb-2">
              Đăng nhập tài khoản
            </h1>
            <p className="text-neutral-400 text-sm font-light tracking-wide">
              Đăng nhập để sử dụng toàn bộ tính năng của OpenVid Studio
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase text-neutral-400 mb-1.5 font-medium tracking-wider">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-neutral-900/80 border-neutral-800 text-white focus:border-white/40 h-11"
                placeholder="admin@openvid.app"
              />
            </div>

            <div>
              <label className="block text-xs uppercase text-neutral-400 mb-1.5 font-medium tracking-wider">
                Mật khẩu
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-neutral-900/80 border-neutral-800 text-white focus:border-white/40 h-11"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-white text-black hover:bg-neutral-200 font-medium transition-all"
            >
              {loading ? (
                <>
                  <Icon icon="svg-spinners:ring-resize" className="w-4 h-4 mr-2" />
                  Đang xác thực...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>
        </div>
      </div>
      <div
        className="hidden lg:block relative w-full h-full border-l border-white/10 bg-[#020203] overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
          <div
            className="absolute inset-0 w-full h-full mix-blend-hard-light blur-[100px] xl:blur-[140px] opacity-70"
            style={{
              background:
                "linear-gradient(rgba(0,0,0,0) 0%, rgba(150,150,150,0.1) 30%, rgb(100,100,100) 50%, rgb(180,180,180) 80%, rgb(240,240,240) 100%)",
            }}
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff11_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 pointer-events-none"></div>
        <div className="absolute top-1/2 -translate-y-1/2 left-6 lg:left-10 w-[130%] xl:w-[140%] max-w-none aspect-[16/9.5] z-10 animate-fade-in-up">
          <div className="relative w-full h-full p-1 squircle-element-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
            <div className="relative w-full h-full overflow-hidden squircle-element-2xl border border-black/50 bg-[#0a0a0c]">
              <Image
                src="/images/pages/openvid-login.avif"
                alt="OpenVid Editor Preview"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 80vw"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
