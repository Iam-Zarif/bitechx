"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { FiBox, FiPlus, FiLogIn, FiLogOut, FiMenu, FiX } from "react-icons/fi";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [hasToken, setHasToken] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    const read = () =>
      setHasToken(Boolean(localStorage.getItem("bitechx_token")));
    read();
    const onStorage = () => read();
    const onAuth = () => read();
    window.addEventListener("storage", onStorage);
    window.addEventListener("bitechx-auth", onAuth);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("bitechx-auth", onAuth);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setHasToken(Boolean(localStorage.getItem("bitechx_token")));
  }, [pathname]);

  const logout = async () => {
    setAuthBusy(true);
    try {
      localStorage.removeItem("bitechx_token");
      setHasToken(false);
      setMenuOpen(false);
      window.dispatchEvent(new Event("bitechx-auth"));
      router.push("/");
    } finally {
      setAuthBusy(false);
    }
  };

  const isActive = (href) => {
    if (href === "/products") return pathname === "/products";
    if (href === "/products/create")
      return pathname?.startsWith("/products/create");
    return pathname === href;
  };

  const NavLink = ({ href, children }) => (
    <Link
      href={href}
      onClick={() => setMenuOpen(false)}
      className={`rounded-lg px-3 py-2 text-sm ${
        isActive(href) ? "bg-verdant/15 text-ink" : "hover:bg-verdant/10"
      }`}
    >
      {children}
    </Link>
  );

  // Hide on the base route "/" (login lives here now)
  if (pathname === "/") return null;

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-mist/90 backdrop-blur supports-[backdrop-filter]:bg-mist/75 border-b border-ink/10">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 lg:px-0">
          <Link
            href={hasToken ? "/products" : "/"}
            className="flex items-center gap-2"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-verdant text-mist">
              I
            </span>
            <span className="text-lg font-semibold tracking-tight text-ink">
              Inventra
            </span>
          </Link>

          {hasToken && (
            <div className="hidden items-center gap-1 md:flex">
              <NavLink href="/products">
                <span className="inline-flex items-center gap-2">
                  <FiBox /> Products
                </span>
              </NavLink>
              <NavLink href="/products/create">
                <span className="inline-flex items-center gap-2">
                  <FiPlus /> Create
                </span>
              </NavLink>
            </div>
          )}

          <div className="hidden md:flex items-center">
            {!hasToken ? (
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg bg-verdant px-3 py-2 text-mist hover:bg-verdant/90"
              >
                <FiLogIn /> Login
              </Link>
            ) : (
              <button
                onClick={logout}
                disabled={authBusy}
                className="inline-flex items-center gap-2 rounded-lg bg-rust px-3 py-2 text-mist hover:bg-rust/90 disabled:opacity-60"
              >
                {authBusy ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-mist border-b-transparent" />
                ) : (
                  <FiLogOut />
                )}
                <span>{authBusy ? "Signing out" : "Logout"}</span>
              </button>
            )}
          </div>

          <button
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 hover:bg-verdant/10"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <FiMenu />
          </button>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-50 md:hidden transition ${
          menuOpen ? "" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-ink/30 backdrop-blur-sm transition-opacity ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
        <aside
          className={`absolute left-0 top-0 h-screen w-full bg-mist text-ink shadow-xl ring-1 ring-ink/10 transition-transform duration-300 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex h-14 items-center justify-between border-b border-ink/10 px-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-verdant text-mist">
                I
              </span>
              <span className="text-lg font-semibold tracking-tight">
                Inventra
              </span>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className="rounded-lg p-2 hover:bg-verdant/10"
              aria-label="Close menu"
            >
              <FiX />
            </button>
          </div>

          <div className="mx-auto w-full max-w-6xl px-4 py-4">
            {hasToken ? (
              <div className="flex flex-col gap-2">
                <NavLink href="/products">
                  <span className="inline-flex items-center gap-2">
                    <FiBox /> Products
                  </span>
                </NavLink>
                <NavLink href="/products/create">
                  <span className="inline-flex items-center gap-2">
                    <FiPlus /> Create
                  </span>
                </NavLink>
                <button
                  onClick={logout}
                  disabled={authBusy}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-rust px-3 py-2 text-mist hover:bg-rust/90 disabled:opacity-60"
                >
                  {authBusy ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-mist border-b-transparent" />
                  ) : (
                    <FiLogOut />
                  )}
                  <span>{authBusy ? "Signing out" : "Logout"}</span>
                </button>
              </div>
            ) : (
              <div className="flex justify-end">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center gap-2 rounded-lg bg-verdant px-3 py-2 text-mist hover:bg-verdant/90"
                >
                  <FiLogIn /> Login
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
