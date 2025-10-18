"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import not_found from "../../public/not_found.gif";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center pt-[6rem] lg:pt-[10rem] text-center px-4">
      <div className="w-72 h-72 mb-6">
        <Image
          src={not_found}
          alt="Page Not Found"
          className="bg-transparent rounded-full"
          priority
        />
      </div>

      <h1 className="text-5xl font-extrabold text-gray-800 tracking-tight mb-3 drop-shadow-sm">
        Not Found
      </h1>

      <p className="text-lg text-gray-600 max-w-md mb-8 leading-relaxed">
        Oops! The page you’re looking for has gone missing or doesn’t exist
        anymore. Let’s get you back on track.
      </p>

      <Link
        href="/"
        className="px-6 py-2.5 rounded-xl bg-primary text-white font-medium shadow-md hover:shadow-lg hover:bg-primary/90 transition-all duration-300"
      >
        ⬅ Back to Home
      </Link>

      <p className="text-sm text-gray-400 mt-6">
        Inventra © {new Date().getFullYear()}
      </p>
    </div>
  );
}
