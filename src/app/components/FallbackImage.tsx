"use client";

import Image from "next/image";
import { useState } from "react";
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
  const [current, setCurrent] = useState<string>(src);
  const [triedRandom, setTriedRandom] = useState(false);

  function pickRandom() {
    if (!IMAGE_LIST.length) return src;
    const idx = Math.floor(Math.random() * IMAGE_LIST.length);
    return IMAGE_LIST[idx];
  }

  return (
    <Image
      src={current}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => {
        if (!triedRandom) {
          setTriedRandom(true);
          setCurrent(pickRandom());
        }
      }}
      unoptimized
    />
  );
}
