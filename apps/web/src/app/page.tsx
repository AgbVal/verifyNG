import { HomeVerification } from '@/components/home-verification';
import { SiteHeader } from '@/components/site-header';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-[#0b1220]">
      {/* Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#071d4908_1px,transparent_1px),linear-gradient(to_bottom,#071d4908_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="absolute -right-[15%] -top-[35%] h-[850px] w-[850px] rounded-full bg-[radial-gradient(circle,#173f7d24_0%,#dce7f527_42%,transparent_70%)]" />

        <div className="absolute bottom-0 left-0 h-[220px] w-full bg-gradient-to-t from-[#eef3fa] to-transparent opacity-60" />
      </div>

      {/* Header */}
       <SiteHeader />
      {/* Verification Hero */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-[1180px] items-center px-6 pb-20">
        <div className="w-full">
          <HomeVerification />
        </div>
      </section>
    </main>
  );
}
