"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { IMAGE_LIST } from "@/app/data/imageList";

type Props = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
};

export default function FallbackImage({
  src,
  alt,
  className,
  width,
  height,
}: Props) {
  const [validSrc, setValidSrc] = useState<string>(src);

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const res = await fetch(src, { method: "HEAD" });
        if (mounted && res.ok) {
          setValidSrc(src);
          return;
        }
      } catch {
        // ignore
      }
      if (mounted && IMAGE_LIST.length) {
        const idx = Math.floor(Math.random() * IMAGE_LIST.length);
        setValidSrc(IMAGE_LIST[idx]);
      }
    }
    check();
    return () => {
      mounted = false;
    };
  }, [src]);

  return (
    <Image
      src={validSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
    />
  );
}
