"use client";

export default function Footer() {
    return (
        <footer className="bg-[#1F1133] text-white py-6 px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-7xl mx-auto text-center">
                <p className="text-sm sm:text-base">
                    &copy; {new Date().getFullYear()} Web Photo Psikologi UMB. All rights reserved.
                </p>
            </div>
        </footer>
    );

}