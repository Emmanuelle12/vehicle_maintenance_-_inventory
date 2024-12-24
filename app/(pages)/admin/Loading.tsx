'use client'

export default function Loading() {
    return (
        <div className="w-full min-h-screen flex justify-center items-center fixed z-10 bg-black">
            <p className="text-xl text-white font-bold animate-pulse">Loading...</p>
        </div>
    )
}