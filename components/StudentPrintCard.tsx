"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  studentName: string;
  className: string;
  classCode: string;
  pin: string;
  qrToken: string;
  baseUrl: string;
};

export default function StudentPrintCard({ studentName, className, classCode, pin, qrToken, baseUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = `${baseUrl}/student?token=${qrToken}`;
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(url, { width: 200, margin: 1 }).then((dataUrl: string) => {
        setQrDataUrl(dataUrl);
      });
    });
  }, [qrToken, baseUrl]);

  function handlePrint() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Login Card - ${studentName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', system-ui, sans-serif; display: flex; justify-content: center; padding: 20px; }
          .card {
            border: 2px solid #e5e7eb;
            border-radius: 16px;
            padding: 32px;
            width: 340px;
            text-align: center;
          }
          .brand { font-size: 14px; font-weight: 800; color: #6b7280; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 20px; }
          .name { font-size: 22px; font-weight: 900; color: #111827; margin-bottom: 4px; }
          .class { font-size: 14px; color: #6b7280; margin-bottom: 16px; }
          .qr { margin: 16px auto; }
          .qr img { width: 160px; height: 160px; }
          .scan-label { font-size: 12px; color: #9ca3af; margin-bottom: 16px; }
          .details { display: flex; justify-content: space-between; padding: 12px 16px; background: #f9fafb; border-radius: 12px; margin-top: 12px; }
          .detail-label { font-size: 11px; color: #9ca3af; text-transform: uppercase; font-weight: 700; }
          .detail-value { font-size: 16px; font-weight: 800; color: #111827; font-family: monospace; letter-spacing: 0.15em; }
          @media print {
            body { padding: 0; }
            .card { border: 2px solid #d1d5db; }
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="brand">Level Up Learning</div>
          <div class="name">${studentName}</div>
          <div class="class">${className}</div>
          <div class="qr">
            <img src="${qrDataUrl}" alt="QR Code" />
          </div>
          <div class="scan-label">Scan to log in</div>
          <div class="details">
            <div>
              <div class="detail-label">Class Code</div>
              <div class="detail-value">${classCode}</div>
            </div>
            <div>
              <div class="detail-label">PIN</div>
              <div class="detail-value">${pin}</div>
            </div>
          </div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  return (
    <button
      onClick={handlePrint}
      disabled={!qrDataUrl}
      className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition disabled:opacity-50 inline-flex items-center gap-1"
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
      Print Card
    </button>
  );
}
