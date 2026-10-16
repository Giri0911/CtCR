"use client";

import NextLink from "next/link";
import { usePathname, useRouter, useSearchParams as useNextSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function Link({ to, href, children, ...props }) {
  return (
    <NextLink href={href || to} {...props}>
      {children}
    </NextLink>
  );
}

export function useNavigate() {
  const router = useRouter();
  return (to, options = {}) => {
    if (typeof to === "object" && to !== null) {
      router.push(to.pathname || "/", options.replace ? { scroll: true } : undefined);
      return;
    }

    if (options.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };
}

export function useLocation() {
  const pathname = usePathname();
  const searchParams = useNextSearchParams();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  return {
    pathname,
    search: searchParams.toString() ? `?${searchParams.toString()}` : "",
    hash,
  };
}

export function useSearchParams() {
  const searchParams = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const setSearchParams = (nextParams) => {
    const params = new URLSearchParams(nextParams);
    router.push(`${pathname}?${params.toString()}`);
  };

  return [searchParams, setSearchParams];
}

export function Navigate({ to, replace = false }) {
  const router = useRouter();

  useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [replace, router, to]);

  return null;
}
