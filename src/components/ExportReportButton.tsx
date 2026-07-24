import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Props {
  targetId: string;
  fileName?: string;
}

export function ExportReportButton({ targetId, fileName = "relatorio-gastos.pdf" }: Props) {
  const exporting = useRef(false);

  async function handleExport() {
    if (exporting.current) return;
    exporting.current = true;

    const element = document.getElementById(targetId);
    if (!element) {
      exporting.current = false;
      return;
    }

    const canvas = await html2canvas(element, { backgroundColor: "#F5F2E8" });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(fileName);

    exporting.current = false;
  }

  return (
    <button onClick={handleExport} className="export-report-btn">
      📄 Exportar relatório em PDF
    </button>
  );
}