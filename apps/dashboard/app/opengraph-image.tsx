import { Logo } from "@/components/logo";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "intentctrl.com";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  const g = 60,
    lw = 1.5,
    lc = "255,255,255";
  const backgroundImage = `repeating-linear-gradient(0deg, transparent, transparent ${g - lw}px, rgba(${lc},0.08) ${g - lw}px, rgba(${lc},0.08) ${g}px, transparent ${g}px, transparent ${g * 2 - lw}px, rgba(${lc},0.08) ${g * 2 - lw}px, rgba(${lc},0.08) ${g * 2}px),repeating-linear-gradient(90deg, transparent, transparent ${g - lw}px, rgba(${lc},0.08) ${g - lw}px, rgba(${lc},0.08) ${g}px, transparent ${g}px, transparent ${g * 2 - lw}px, rgba(${lc},0.08) ${g * 2 - lw}px, rgba(${lc},0.08) ${g * 2}px),radial-gradient(circle at ${g / 2}px ${g / 2}px, rgba(${lc},0.12) 2px, transparent 2px),radial-gradient(circle at ${g}px ${g}px, rgba(${lc},0.12) 2px, transparent 2px)`;
  const backgroundSize = `${g}px ${g}px, ${g}px ${g}px, ${g}px ${g}px, ${g}px ${g}px`;
  return new ImageResponse(
    <div tw="relative flex h-full w-full bg-black/95 text-white">
      <div
        style={{
          backgroundImage: backgroundImage,
          backgroundSize: backgroundSize,
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, #000 70%)",
        }}
        tw="absolute inset-0"
      />

      <div tw="flex flex-col items-center p-20 justify-center text-center w-full">
        {/* Logo */}
        <div tw="flex flex-col items-center">
          <Logo height={100} width={100} color="white" />
          <span tw="text-6xl font-medium tracking-tighter">intentctrl.com</span>
        </div>

        {/* Title */}
        <h1 tw="mt-8 text-4xl leading-[1.25] tracking-tighter max-w-3xl">
          Give your users an assistant that thinks, acts, and confirms before it does.
        </h1>
      </div>
    </div>,
    size,
  );
}
