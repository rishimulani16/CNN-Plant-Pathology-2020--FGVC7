import type { PredictionResult } from "@/components/dashboard"
import type { AnalysisHistory, AnalysisStats } from "@/lib/analysis-service"

export interface ReportData {
  analysis: PredictionResult
  timestamp: string
  userEmail: string
  recommendations: any
}

class ReportGenerator {
  generatePDFReport(data: ReportData): void {
    // Create a comprehensive HTML report that can be printed as PDF
    const reportHTML = this.generateReportHTML(data)

    // Open in new window for printing
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(reportHTML)
      printWindow.document.close()

      // Auto-trigger print dialog
      printWindow.onload = () => {
        printWindow.print()
      }
    }
  }

  generateCSVReport(analyses: AnalysisHistory[]): void {
    const headers = ["Date", "Time", "Result", "Confidence (%)", "Status", "Recommendations"]

    const csvContent = [
      headers.join(","),
      ...analyses.map((analysis) => {
        const date = new Date(analysis.created_at)
        const recommendations = analysis.recommendations
          ? JSON.parse(analysis.recommendations)
          : { status: "unknown", actions: [] }

        return [
          date.toLocaleDateString(),
          date.toLocaleTimeString(),
          `"${analysis.result}"`,
          (analysis.confidence * 100).toFixed(1),
          recommendations.status || "unknown",
          `"${recommendations.actions ? recommendations.actions.join("; ") : "No recommendations"}"`,
        ].join(",")
      }),
    ].join("\n")

    // Download CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `leaf-analysis-history-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  generateSummaryReport(stats: AnalysisStats, userEmail: string): void {
    const reportHTML = this.generateSummaryHTML(stats, userEmail)

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(reportHTML)
      printWindow.document.close()

      printWindow.onload = () => {
        printWindow.print()
      }
    }
  }

  private generateReportHTML(data: ReportData): string {
    const isHealthy = data.analysis.result.toLowerCase().includes("healthy")
    const confidencePercent = (data.analysis.confidence * 100).toFixed(1)
    const recommendations = data.recommendations || { actions: [] }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>LeafGuard AI - Analysis Report</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #22c55e;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #22c55e;
            margin-bottom: 10px;
          }
          .result-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            background: ${isHealthy ? "#f0fdf4" : "#fef3c7"};
          }
          .result-title {
            font-size: 20px;
            font-weight: bold;
            color: ${isHealthy ? "#15803d" : "#d97706"};
            margin-bottom: 10px;
          }
          .confidence-bar {
            width: 100%;
            height: 20px;
            background: #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
          }
          .confidence-fill {
            height: 100%;
            background: ${isHealthy ? "#22c55e" : "#f59e0b"};
            width: ${confidencePercent}%;
          }
          .recommendations {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .recommendations h3 {
            color: #374151;
            margin-top: 0;
          }
          .recommendations ul {
            padding-left: 20px;
          }
          .recommendations li {
            margin: 8px 0;
          }
          .metadata {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #6b7280;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #9ca3af;
          }
          @media print {
            body { margin: 0; padding: 15px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🍃 LeafGuard AI</div>
          <h1>Leaf Disease Analysis Report</h1>
        </div>

        <div class="result-card">
          <div class="result-title">${data.analysis.result}</div>
          <p><strong>Confidence Score:</strong> ${confidencePercent}%</p>
          <div class="confidence-bar">
            <div class="confidence-fill"></div>
          </div>
          <p><strong>Status:</strong> ${isHealthy ? "Healthy Leaf Detected" : "Disease Detected - Action Required"}</p>
        </div>

        <div class="recommendations">
          <h3>Recommendations</h3>
          ${
            recommendations.actions && recommendations.actions.length > 0
              ? `<ul>${recommendations.actions.map((action: string) => `<li>${action}</li>`).join("")}</ul>`
              : "<p>No specific recommendations available.</p>"
          }
        </div>

        <div class="metadata">
          <p><strong>Analysis Date:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
          <p><strong>User:</strong> ${data.userEmail}</p>
          <p><strong>Report Generated:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div class="footer">
          <p>This report was generated by LeafGuard AI - Advanced Leaf Disease Detection System</p>
          <p>For questions or support, please contact your agricultural extension office.</p>
        </div>
      </body>
      </html>
    `
  }

  private generateSummaryHTML(stats: AnalysisStats, userEmail: string): string {
    const healthyPercent =
      stats.total_analyses > 0 ? ((stats.healthy_count / stats.total_analyses) * 100).toFixed(1) : "0"
    const diseasedPercent =
      stats.total_analyses > 0 ? ((stats.diseased_count / stats.total_analyses) * 100).toFixed(1) : "0"

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>LeafGuard AI - Summary Report</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #22c55e;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #22c55e;
            margin-bottom: 10px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
          }
          .stat-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            background: white;
          }
          .stat-number {
            font-size: 32px;
            font-weight: bold;
            color: #22c55e;
            margin-bottom: 5px;
          }
          .stat-label {
            color: #6b7280;
            font-size: 14px;
          }
          .recent-analyses {
            margin: 30px 0;
          }
          .analysis-item {
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 15px;
            margin: 10px 0;
            background: #f9fafb;
          }
          .analysis-date {
            font-size: 12px;
            color: #6b7280;
          }
          .analysis-result {
            font-weight: bold;
            margin: 5px 0;
          }
          .healthy { color: #15803d; }
          .diseased { color: #d97706; }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #9ca3af;
          }
          @media print {
            body { margin: 0; padding: 15px; }
            .stats-grid { grid-template-columns: repeat(2, 1fr); }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🍃 LeafGuard AI</div>
          <h1>Analysis Summary Report</h1>
          <p>User: ${userEmail}</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${stats.total_analyses}</div>
            <div class="stat-label">Total Analyses</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${healthyPercent}%</div>
            <div class="stat-label">Healthy Leaves</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${diseasedPercent}%</div>
            <div class="stat-label">Diseased Leaves</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${(stats.avg_confidence * 100).toFixed(1)}%</div>
            <div class="stat-label">Avg Confidence</div>
          </div>
        </div>

        ${
          stats.most_common_disease
            ? `
          <div class="stat-card" style="margin: 20px 0;">
            <h3>Most Common Disease</h3>
            <div class="stat-number" style="font-size: 18px; color: #d97706;">${stats.most_common_disease}</div>
          </div>
        `
            : ""
        }

        <div class="recent-analyses">
          <h3>Recent Analyses</h3>
          ${stats.recent_analyses
            .map(
              (analysis) => `
            <div class="analysis-item">
              <div class="analysis-date">${new Date(analysis.created_at).toLocaleString()}</div>
              <div class="analysis-result ${analysis.result.toLowerCase().includes("healthy") ? "healthy" : "diseased"}">
                ${analysis.result} (${(analysis.confidence * 100).toFixed(1)}% confidence)
              </div>
            </div>
          `,
            )
            .join("")}
        </div>

        <div class="footer">
          <p>Report generated on ${new Date().toLocaleString()}</p>
          <p>LeafGuard AI - Advanced Leaf Disease Detection System</p>
        </div>
      </body>
      </html>
    `
  }
}

export const reportGenerator = new ReportGenerator()
