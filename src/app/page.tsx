"use client";

import Footer from "@/app/components/footer";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";


const frames = [
  {
    id: 1,
    name: "Purple Pastel",
    type: "4 Photo Strip",
    image: "/frame/frame1.png",
    slug: "frame1",
  },
  {
    id: 2,
    name: "Lavender",
    type: "4 Photo Strip",
    image: "/frame/frame2.png",
    slug: "frame2",
  },
  {
    id: 3,
    name: "Sakura",
    type: "4 Photo Strip",
    image: "/frame/frame3.png",
    slug: "frame3",
  },
  {
    id: 4,
    name: "Frame 4",
    type: "4 Photo Strip",
    image: "/frame/frame4.png",
    slug: "frame4",
  },
  {
    id: 5,
    name: "Frame 5",
    type: "4 Photo Strip",
    image: "/frame/frame5.png",
    slug: "frame5",
  },
  {
    id: 6,
    name: "Frame 6",
    type: "4 Photo Strip",
    image: "/frame/frame6.png",
    slug: "frame6",
  },
  {
    id: 7,
    name: "Frame 7",
    type: "4 Photo Strip",
    image: "/frame/frame7.png",
    slug: "frame7",
  }
];

export default function Home() {
  const router = useRouter();
  const [selectedFrame, setSelectedFrame] = useState<number | null>(null);
  return (
    <main className="relative bg-[#F4EEFB] min-h-screen text-[#1F1133]">
      <div className="absolute inset-0 h-full bg-[url('/bghero.png')] bg-auto bg-repeat-x opacity-10 pointer-events-none z-0" />


      <section className="relative w-full overflow-hidden bg-linear-to-r from-[#3E2463] via-[#6B3AA8] to-[#9C51B6] py-12 md:py-20 px-6 sm:px-10 lg:px-16 shadow-xl">
        {/* Background Image dengan Transparansi 20% (opacity-20) */}


        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          {/* Sisi Kiri: Teks & Call to Action */}
          <div className="text-white max-w-xl text-center md:text-left space-y-5">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-white drop-shadow-sm">
              Abadikan Senyummu, <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#EADBF7] to-[#F4EEFB]">
                Rayakan Setiap Langkah Kecilmu.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-purple-100/90 leading-relaxed font-normal max-w-lg">
              Selamat datang di photobooth kami! Di sini, kamu dapat mengabadikan momen berharga dengan senyuman yang tulus. Ambil foto, ekspresikan dirimu, dan apresiasi dirimu sendiri hari ini.
            </p>
          </div>

          {/* Sisi Kanan: Gambar Karakter */}
          <div className="relative flex justify-center items-center mt-4 md:mt-0">
            <div className="absolute w-64 h-64 bg-white/20 rounded-full blur-2xl -z-10" />

            <img
              src="/kupu.png"
              alt="Karakter Kupu-Kupu"
              className="h-56 sm:h-72 lg:h-80 w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300 ease-out animate-bounce-slow"
            />
          </div>
        </div>
      </section>

      <section className="relative max-w-7xl mx-auto px-6 mb-10 sm:px-10 lg:px-16 pt-16">

        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3 z-10 relative">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3E2463]">
            Pilih Frame Favoritmu
          </h2>
          <p className="text-sm text-[#1F1133]/70">
            Pilih salah satu template bingkai di bawah ini untuk memulai sesi foto photobooth-mu.
          </p>
        </div>

        {/* Grid List Frame */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-stretch relative z-10">
          {frames.map((frame) => {

            return (
              <div
                key={frame.id}
                onClick={() => setSelectedFrame(frame.id)}
                className=" bg-white rounded-3xl p-4 transition-all duration-300 border-2 border-transparent shadow-md "
              >

                <div>
                  {/* Container Gambar: Diberi tinggi fixed (h-64 sm:h-72) & padding agar rapi */}
                  <div className="relative w-full h-64 sm:h-72 bg-[#EADBF7] rounded-2xl overflow-hidden flex items-center justify-center p-3 border border-purple-100 group-hover:bg-purple-50/50 transition-colors">
                    <img
                      src={frame.image}
                      alt={frame.name}
                      className="w-full h-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Info Frame */}
                  <div className="mt-4 space-y-1">
                    <h3 className="font-bold text-base text-[#3E2463] group-hover:text-[#6B3AA8] transition-colors">
                      {frame.name}
                    </h3>
                    <p className="text-xs text-purple-900/60 font-medium">
                      {frame.type}
                    </p>
                  </div>

                  {/* Tombol Pilih */}
                  <button
                    onClick={() => router.push(`/foto/${frame.slug}`)}
                    className="w-full mt-4 py-2.5 rounded-xl font-bold text-xs bg-[#F4EEFB] text-[#3E2463] hover:bg-[#6B3AA8] hover:text-white transition"
                  >
                    Pilih Frame
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <Footer />
    </main>
  );
}