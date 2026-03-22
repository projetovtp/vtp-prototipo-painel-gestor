import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function exportarParaPDF(contentRef, tituloRelatorio, textoData, setExportando, setErro) {
  if (!contentRef.current) return;
  setExportando(true);
  try {
    const el = contentRef.current;
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#f5f3f3",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const imgW = canvas.width;
    const imgH = canvas.height;

    const pdfW = 210;
    const margin = 10;
    const usableW = pdfW - margin * 2;
    const ratio = usableW / imgW;
    const scaledH = imgH * ratio;

    const pdf = new jsPDF("p", "mm", "a4");
    const pageH = 297 - margin * 2;

    let posY = 0;
    let page = 0;

    while (posY < scaledH) {
      if (page > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", margin, margin - posY, usableW, scaledH);
      posY += pageH;
      page++;
    }

    const nomeArquivo = `relatorio-${tituloRelatorio.toLowerCase().replace(/\s+/g, "-")}-${textoData.replace(/[/\s]/g, "-")}.pdf`;
    pdf.save(nomeArquivo);
  } catch (err) {
    console.error("Erro ao exportar PDF:", err);
    setErro("Erro ao gerar o PDF. Tente novamente.");
  } finally {
    setExportando(false);
  }
}
