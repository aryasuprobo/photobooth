"use client";

import Footer from "@/app/components/footer";
import { use, useRef, useState, useEffect } from "react";
import {
    Camera,
    Download,
    RotateCcw,
    ArrowLeft,
    Check,
} from "lucide-react";
import Link from "next/link";
import { FRAME_CONFIG } from "../frameConfig";
import { notFound } from "next/navigation";

export default function PhotoPage({
    params,
}: {
    params: Promise<{ frame: string }>;
}) {
    const { frame } = use(params);

    const config = FRAME_CONFIG[frame];

    if (!config) return notFound();

    const FRAME_SRC = config.frameSrc;
    const SLOTS = config.slots;
    const CANVAS_WIDTH = config.width;
    const CANVAS_HEIGHT = config.height;
    const TOTAL_PHOTOS = SLOTS.length;

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [photos, setPhotos] = useState<(string | null)[]>(
        Array(TOTAL_PHOTOS).fill(null)
    );

    const [activeSlot, setActiveSlot] = useState(0);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [cameraReady, setCameraReady] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);



    // ==================================================
    // START CAMERA
    // ==================================================

    useEffect(() => {
        startCamera();

        return () => {
            stopCamera();
        };
    }, []);

    async function startCamera() {
        try {
            const stream =
                await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "user",
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                    },
                    audio: false,
                });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            setCameraReady(true);
        } catch (error) {
            console.error(
                "Gagal mengakses kamera:",
                error
            );

            alert(
                "Tidak bisa mengakses kamera. Pastikan izin kamera sudah diaktifkan."
            );
        }
    }

    function stopCamera() {
        streamRef.current?.getTracks().forEach((track) => {
            track.stop();
        });

        streamRef.current = null;
        setCameraReady(false);
    }

    // ==================================================
    // LOAD IMAGE
    // ==================================================

    function loadImage(
        src: string
    ): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new window.Image();

            img.crossOrigin = "anonymous";

            img.onload = () => resolve(img);
            img.onerror = reject;

            img.src = src;
        });
    }

    // ==================================================
    // CAPTURE PHOTO
    // ==================================================

    function capturePhoto() {
        if (!videoRef.current) return;
        if (!cameraReady) return;
        if (isProcessing) return;

        const video = videoRef.current;

        if (
            !video.videoWidth ||
            !video.videoHeight
        ) {
            return;
        }

        const tempCanvas =
            document.createElement("canvas");

        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;

        const ctx =
            tempCanvas.getContext("2d");

        if (!ctx) return;

        // Mirror seperti tampilan kamera
        ctx.translate(
            tempCanvas.width,
            0
        );

        ctx.scale(-1, 1);

        ctx.drawImage(
            video,
            0,
            0,
            tempCanvas.width,
            tempCanvas.height
        );

        const dataUrl =
            tempCanvas.toDataURL("image/png");

        // Masukkan foto ke slot aktif
        const updatedPhotos = [...photos];

        updatedPhotos[activeSlot] = dataUrl;

        setPhotos(updatedPhotos);

        // Langsung generate preview terbaru
        composeFinalImage(updatedPhotos);

        // Cari slot kosong berikutnya
        const nextEmptySlot =
            updatedPhotos.findIndex(
                (photo) => photo === null
            );

        if (nextEmptySlot !== -1) {
            setActiveSlot(nextEmptySlot);
        } else {
            // Semua sudah terisi
            setActiveSlot(
                activeSlot
            );
        }
    }

    // ==================================================
    // COMPOSE PREVIEW
    // ==================================================

    async function composeFinalImage(
        photoList: (string | null)[]
    ) {
        const canvas = canvasRef.current;

        if (!canvas) return;

        setIsProcessing(true);

        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        const ctx =
            canvas.getContext("2d");

        if (!ctx) {
            setIsProcessing(false);
            return;
        }

        // Bersihkan canvas
        ctx.clearRect(
            0,
            0,
            CANVAS_WIDTH,
            CANVAS_HEIGHT
        );

        // Background putih
        ctx.fillStyle = "#ffffff";

        ctx.fillRect(
            0,
            0,
            CANVAS_WIDTH,
            CANVAS_HEIGHT
        );

        // ==================================================
        // GAMBAR FOTO YANG SUDAH ADA
        // ==================================================

        for (
            let i = 0;
            i < SLOTS.length;
            i++
        ) {
            const photo = photoList[i];

            // Kalau slot belum diisi,
            // biarkan kosong
            if (!photo) continue;

            const slot = SLOTS[i];

            const img =
                await loadImage(photo);

            drawImageCover(
                ctx,
                img,
                slot.x,
                slot.y,
                slot.w,
                slot.h,
                slot.rotate ?? 0
            );
        }

        // ==================================================
        // GAMBAR FRAME DI ATAS FOTO
        // ==================================================

        const frameImg =
            await loadImage(FRAME_SRC);

        ctx.drawImage(
            frameImg,
            0,
            0,
            CANVAS_WIDTH,
            CANVAS_HEIGHT
        );

        const finalImage =
            canvas.toDataURL("image/png");

        setResultUrl(finalImage);

        setIsProcessing(false);
    }

    // ==================================================
    // DRAW IMAGE COVER
    // ==================================================

    function drawImageCover(
        ctx: CanvasRenderingContext2D,
        img: HTMLImageElement,
        x: number,
        y: number,
        w: number,
        h: number,
        rotate = 0
    ) {
        const imgRatio = img.width / img.height;
        const boxRatio = w / h;

        let sx = 0,
            sy = 0,
            sw = img.width,
            sh = img.height;

        if (imgRatio > boxRatio) {
            sh = img.height;
            sw = sh * boxRatio;
            sx = (img.width - sw) / 2;
        } else {
            sw = img.width;
            sh = sw / boxRatio;
            sy = (img.height - sh) / 2;
        }

        ctx.save();

        // titik tengah slot
        ctx.translate(x + w / 2, y + h / 2);

        // rotasi (derajat → radian)
        ctx.rotate((rotate * Math.PI) / 180);

        ctx.drawImage(
            img,
            sx,
            sy,
            sw,
            sh,
            -w / 2,
            -h / 2,
            w,
            h
        );

        ctx.restore();
    }

    // ==================================================
    // PILIH SLOT FOTO
    // ==================================================

    function selectSlot(index: number) {
        setActiveSlot(index);

        // Scroll kamera ke posisi aktif di mobile
        if (
            typeof window !== "undefined" &&
            window.innerWidth < 1024
        ) {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    }

    // ==================================================
    // RETAKE SATU FOTO
    // ==================================================

    function retakePhoto(index: number) {
        setActiveSlot(index);

        // Hapus foto dari slot tersebut
        const updatedPhotos = [...photos];

        updatedPhotos[index] = null;

        setPhotos(updatedPhotos);

        // Generate ulang preview
        composeFinalImage(updatedPhotos);

        // Pastikan kamera aktif
        if (!cameraReady) {
            startCamera();
        }
    }

    // ==================================================
    // RESET SEMUA FOTO
    // ==================================================

    function retakeAll() {
        const emptyPhotos =
            Array(TOTAL_PHOTOS).fill(null);

        setPhotos(emptyPhotos);

        setActiveSlot(0);

        setResultUrl(null);

        setIsProcessing(false);

        if (!cameraReady) {
            startCamera();
        }
    }

    // ==================================================
    // DOWNLOAD
    // ==================================================

    function downloadResult() {
        if (!resultUrl) return;

        const link =
            document.createElement("a");

        link.href = resultUrl;

        link.download = `photobooth-${frame}.png`;

        link.click();
    }

    // ==================================================
    // HELPER
    // ==================================================

    const completedPhotos =
        photos.filter(Boolean).length;

    const allPhotosTaken =
        completedPhotos === TOTAL_PHOTOS;

    // ==================================================
    // UI
    // ==================================================

    return (
        <main className="relative min-h-screen bg-[#F4EEFB] text-[#1F1133]">
            <div className="absolute inset-0 h-full bg-[url('/bghero.png')] bg-auto bg-repeat-x opacity-10 pointer-events-none z-0" />

            {/* ==================================================
                HEADER
            ================================================== */}

            <header className="w-full bg-white border-b-2 md:border-b border-[#3E2463] relative z-10 shadow-xs">
                <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-3">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#3E2463] transition-colors duration-200"
                        >
                            <div className="p-2 rounded-lg bg-purple-50 text-[#3E2463] group-hover:bg-purple-100 transition">
                                <ArrowLeft size={16} />
                            </div>
                            <span className="font-semibold">Kembali</span>
                        </Link>

                        <div className="text-right">

                            <h1 className="text-sm font-extrabold text-slate-800 tracking-tight">
                                {config.name}
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* ==================================================
                TITLE
            ================================================== */}

            <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-3 pb-10 relative z-10">

                {/* ==================================================
                    DESKTOP:
                    CAMERA KIRI | HASIL KANAN
                ================================================== */}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">

                    {/* ==================================================
                        CAMERA CARD
                    ================================================== */}

                    <div className="bg-white rounded-3xl shadow-xl border border-purple-100 p-5 sm:p-5">

                        <div className="flex items-center justify-between mb-2">

                            <div>

                                <h2 className="font-extrabold text-[#3E2463]">
                                    Kamera
                                </h2>

                                <p className="text-xs text-purple-900/50 mt-1">
                                    Foto {activeSlot + 1} dari{" "}
                                    {TOTAL_PHOTOS}
                                </p>

                            </div>

                            <div className="px-3 py-1.5 rounded-full bg-[#F4EEFB] text-xs font-bold text-[#6B3AA8]">
                                {completedPhotos}/{TOTAL_PHOTOS}
                            </div>

                        </div>

                        {/* CAMERA */}

                        <div className="relative w-full h-50 md:h-80 overflow-hidden rounded-2xl bg-[#1F1133] aspect-video">

                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                                style={{
                                    transform:
                                        "scaleX(-1)",
                                }}
                            />

                            {!cameraReady && (

                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1F1133] text-white">

                                    <Camera
                                        size={38}
                                        className="mb-3 opacity-70"
                                    />

                                    <p className="text-sm opacity-80">
                                        Menyiapkan kamera...
                                    </p>

                                </div>

                            )}

                        </div>

                        {/* PROGRESS */}

                        <div className="mt-2">

                            <div className="flex justify-between mb-2">

                                <span className="text-xs font-bold text-[#3E2463]">
                                    Progress Foto
                                </span>

                                <span className="text-xs text-purple-900/50">
                                    {completedPhotos} /{" "}
                                    {TOTAL_PHOTOS}
                                </span>

                            </div>

                            <div className="w-full h-2 bg-[#EADBF7] rounded-full overflow-hidden">

                                <div
                                    className="h-full bg-linear-to-r from-[#6B3AA8] to-[#9C51B6] rounded-full transition-all duration-300"
                                    style={{
                                        width: `${(completedPhotos /
                                            TOTAL_PHOTOS) *
                                            100
                                            }%`,
                                    }}
                                />

                            </div>

                        </div>

                        {/* SLOT BUTTONS */}

                        <div className="grid grid-cols-3 gap-2 mt-5">

                            {SLOTS.map(
                                (_, index) => {

                                    const hasPhoto =
                                        Boolean(
                                            photos[index]
                                        );

                                    const isActive =
                                        activeSlot ===
                                        index;

                                    return (
                                        <button
                                            key={index}
                                            onClick={() =>
                                                selectSlot(
                                                    index
                                                )
                                            }
                                            className={`relative p-3 rounded-xl border-2 transition-all ${isActive
                                                ? "border-[#6B3AA8] bg-[#F4EEFB]"
                                                : "border-purple-100 bg-white hover:bg-[#F4EEFB]"
                                                }`}
                                        >

                                            <div className="text-xs font-bold text-[#3E2463]">
                                                Foto{" "}
                                                {index +
                                                    1}
                                            </div>

                                            <div className="text-[10px] mt-1 text-purple-900/50">

                                                {hasPhoto
                                                    ? "Sudah diambil"
                                                    : "Belum diambil"}

                                            </div>

                                            {hasPhoto && (
                                                <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#6B3AA8] text-white flex items-center justify-center">

                                                    <Check
                                                        size={
                                                            12
                                                        }
                                                    />

                                                </div>
                                            )}

                                        </button>
                                    );
                                }
                            )}

                        </div>

                        {/* CAPTURE */}

                        <button
                            onClick={capturePhoto}
                            disabled={
                                !cameraReady ||
                                isProcessing
                            }
                            className="w-full mt-5 flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-[#6B3AA8] text-white font-bold text-sm shadow-lg shadow-purple-200 hover:bg-[#3E2463] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >

                            <Camera size={20} />

                            {isProcessing
                                ? "Memproses..."
                                : photos[
                                    activeSlot
                                ]
                                    ? `Foto Ulang Foto ${activeSlot +
                                    1
                                    }`
                                    : `Ambil Foto ${activeSlot +
                                    1
                                    }`}

                        </button>

                        <p className="text-center text-xs text-purple-900/40 mt-3">
                            Klik nomor foto untuk
                            memilih slot yang ingin
                            diambil atau diulang.
                        </p>

                    </div>

                    {/* ==================================================
                        RESULT CARD
                    ================================================== */}

                    <div className="bg-white rounded-3xl shadow-xl border border-purple-100 p-5 sm:p-5">

                        <div className="flex items-center justify-between mb-2">

                            <div>

                                <h2 className="font-extrabold text-[#3E2463]">
                                    Hasil Photobooth
                                </h2>

                                <p className="text-xs text-purple-900/50 mt-1">
                                    Preview langsung
                                </p>

                            </div>

                            {allPhotosTaken && (

                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EADBF7] text-[#6B3AA8] text-xs font-bold">

                                    <Check size={13} />

                                    Selesai

                                </div>

                            )}

                        </div>

                        {/* RESULT */}

                        <div className="min-h-125 flex items-center justify-center bg-[#F4EEFB] rounded-2xl p-5">

                            {resultUrl ? (

                                <img
                                    src={resultUrl}
                                    alt="Hasil Photobooth"
                                    className="max-h-155 w-auto max-w-full rounded-xl shadow-lg"
                                />

                            ) : (

                                <div className="text-center text-purple-900/40">

                                    <Camera
                                        size={42}
                                        className="mx-auto mb-3"
                                    />

                                    <p className="text-sm font-medium">
                                        Hasil foto akan
                                        muncul di sini
                                    </p>

                                    <p className="text-xs mt-1">
                                        Ambil foto pertama
                                        untuk melihat
                                        preview.
                                    </p>

                                </div>

                            )}

                        </div>

                        {/* PHOTO THUMBNAILS */}

                        <div className="mt-5">

                            <p className="text-xs font-bold text-[#3E2463] mb-3">
                                Foto Kamu
                            </p>

                            <div className="grid grid-cols-3 gap-3">

                                {SLOTS.map(
                                    (_, index) => {

                                        const photo =
                                            photos[
                                            index
                                            ];

                                        const isActive =
                                            activeSlot ===
                                            index;

                                        return (
                                            <div
                                                key={
                                                    index
                                                }
                                                className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${isActive
                                                    ? "border-[#6B3AA8]"
                                                    : "border-purple-100"
                                                    }`}
                                            >

                                                {photo ? (

                                                    <>
                                                        <img
                                                            src={
                                                                photo
                                                            }
                                                            alt={`Foto ${index +
                                                                1
                                                                }`}
                                                            className="w-full h-full object-cover"
                                                        />

                                                        <button
                                                            onClick={() =>
                                                                retakePhoto(
                                                                    index
                                                                )
                                                            }
                                                            className="absolute inset-0 bg-[#3E2463]/70 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white"
                                                        >

                                                            <RotateCcw
                                                                size={
                                                                    20
                                                                }
                                                            />

                                                            <span className="text-[10px] font-bold mt-1">
                                                                Foto
                                                                Ulang
                                                            </span>

                                                        </button>

                                                        <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-[#3E2463]/80 text-white text-[10px] font-bold">
                                                            {index +
                                                                1}
                                                        </div>

                                                    </>

                                                ) : (

                                                    <button
                                                        onClick={() =>
                                                            selectSlot(
                                                                index
                                                            )
                                                        }
                                                        className="w-full h-full flex flex-col items-center justify-center bg-white text-purple-900/30 hover:bg-[#F4EEFB] transition"
                                                    >

                                                        <Camera
                                                            size={
                                                                20
                                                            }
                                                        />

                                                        <span className="text-[10px] font-bold mt-1">
                                                            Foto{" "}
                                                            {index +
                                                                1}
                                                        </span>

                                                    </button>

                                                )}

                                            </div>
                                        );
                                    }
                                )}

                            </div>

                        </div>

                        {/* ACTION */}

                        <div className="grid grid-cols-2 gap-3 mt-5">

                            <button
                                onClick={retakeAll}
                                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#F4EEFB] text-[#3E2463] font-bold text-xs hover:bg-[#EADBF7] transition"
                            >

                                <RotateCcw
                                    size={16}
                                />

                                Ulang Semua

                            </button>

                            <button
                                onClick={
                                    downloadResult
                                }
                                disabled={
                                    !allPhotosTaken ||
                                    !resultUrl
                                }
                                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#6B3AA8] text-white font-bold text-xs hover:bg-[#3E2463] transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >

                                <Download
                                    size={16}
                                />

                                Download

                            </button>

                        </div>

                        {!allPhotosTaken && (
                            <p className="text-center text-[10px] text-purple-900/40 mt-3">
                                Lengkapi semua foto
                                terlebih dahulu untuk
                                mengaktifkan download.
                            </p>
                        )}

                    </div>

                </div>

            </section>

            {/* HIDDEN CANVAS */}

            <canvas
                ref={canvasRef}
                className="hidden"
            />
            <Footer />
        </main>
    );
}
