"use client";

import React, { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface QrCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export const QrCode: React.FC<QrCodeProps> = ({ value, size = 128, className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      }).catch((err) => {
        console.error("QR Code Generation Error:", err);
      });
    }
  }, [value, size]);

  return (
    <div className={`inline-flex items-center justify-center bg-white p-1 rounded border border-gray-200 ${className}`}>
      <canvas ref={canvasRef} />
    </div>
  );
};
