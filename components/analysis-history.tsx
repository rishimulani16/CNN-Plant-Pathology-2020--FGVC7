"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, AlertTriangle, Calendar, Search, Filter, Trash2, Eye, Download } from "lucide-react"
import { analysisService, type AnalysisHistory } from "@/lib/analysis-service"
import { reportGenerator } from "@/lib/report-generator"
import { useAuth } from "@/hooks/use-auth"

export default function AnalysisHistoryView() {
  const { user } = useAuth()
  const [history, setHistory] = useState<AnalysisHistory[]>([])
  const [filteredHistory, setFilteredHistory] = useState<AnalysisHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "healthy" | "diseased">("all")
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisHistory | null>(null)

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    filterHistory()
  }, [history, searchTerm, filterType])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const analysisHistory = await analysisService.getAnalysisHistory(100)
      setHistory(analysisHistory)
    } catch (error) {
      console.error("Error loading history:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterHistory = () => {
    let filtered = history

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((analysis) => analysis.result.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Filter by type
    if (filterType !== "all") {
      if (filterType === "healthy") {
        filtered = filtered.filter((analysis) => analysis.result.toLowerCase().includes("healthy"))
      } else if (filterType === "diseased") {
        filtered = filtered.filter((analysis) => !analysis.result.toLowerCase().includes("healthy"))
      }
    }

    setFilteredHistory(filtered)
  }

  const handleDeleteAnalysis = async (id: string) => {
    if (confirm("Are you sure you want to delete this analysis?")) {
      const success = await analysisService.deleteAnalysis(id)
      if (success) {
        setHistory((prev) => prev.filter((analysis) => analysis.id !== id))
      }
    }
  }

  const handleDownloadReport = (analysis: AnalysisHistory) => {
    const recommendations = analysis.recommendations ? JSON.parse(analysis.recommendations) : { actions: [] }

    const reportData = {
      analysis: {
        result: analysis.result,
        confidence: analysis.confidence,
        timestamp: analysis.created_at,
        imageUrl: analysis.image_url,
      },
      timestamp: analysis.created_at,
      userEmail: user?.email || "Unknown User",
      recommendations,
    }

    reportGenerator.generatePDFReport(reportData)
  }

  const handleViewDetails = (analysis: AnalysisHistory) => {
    setSelectedAnalysis(analysis)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Analysis History</h2>
        <p className="text-muted-foreground">View and manage your past leaf disease analyses</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search analyses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="healthy">Healthy Only</SelectItem>
                <SelectItem value="diseased">Diseased Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      {filteredHistory.length > 0 ? (
        <div className="space-y-4">
          {filteredHistory.map((analysis) => {
            const isHealthy = analysis.result.toLowerCase().includes("healthy")
            const recommendations = analysis.recommendations ? JSON.parse(analysis.recommendations) : { actions: [] }

            return (
              <Card key={analysis.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Image Thumbnail */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden border flex-shrink-0">
                        <img
                          src={analysis.image_url || "/placeholder.svg"}
                          alt="Analyzed leaf"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Analysis Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {isHealthy ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                          )}
                          <h3 className="font-semibold">{analysis.result}</h3>
                          <Badge
                            variant={isHealthy ? "secondary" : "destructive"}
                            className={
                              isHealthy
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-orange-100 text-orange-800 border-orange-200"
                            }
                          >
                            {(analysis.confidence * 100).toFixed(1)}% confidence
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(analysis.created_at).toLocaleDateString()}</span>
                          </div>
                          <span>{new Date(analysis.created_at).toLocaleTimeString()}</span>
                        </div>

                        {recommendations.actions && recommendations.actions.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {recommendations.actions[0]}
                            {recommendations.actions.length > 1 && ` (+${recommendations.actions.length - 1} more)`}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(analysis)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadReport(analysis)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAnalysis(analysis.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No analyses found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterType !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Start by analyzing a leaf image to see your history here."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Analysis Details Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Analysis Details</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedAnalysis(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image */}
              <div className="rounded-lg overflow-hidden border">
                <img
                  src={selectedAnalysis.image_url || "/placeholder.svg"}
                  alt="Analyzed leaf"
                  className="w-full h-64 object-cover"
                />
              </div>

              {/* Result */}
              <div className="space-y-2">
                <h3 className="font-semibold">Result</h3>
                <div className="flex items-center gap-2">
                  {selectedAnalysis.result.toLowerCase().includes("healthy") ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  )}
                  <span className="font-medium">{selectedAnalysis.result}</span>
                  <Badge variant="secondary">{(selectedAnalysis.confidence * 100).toFixed(1)}% confidence</Badge>
                </div>
              </div>

              {/* Recommendations */}
              {selectedAnalysis.recommendations && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Recommendations</h3>
                  <div className="bg-muted rounded-lg p-4">
                    {(() => {
                      const recommendations = JSON.parse(selectedAnalysis.recommendations)
                      return (
                        <ul className="space-y-1">
                          {recommendations.actions?.map((action: string, index: number) => (
                            <li key={index} className="text-sm">
                              • {action}
                            </li>
                          ))}
                        </ul>
                      )
                    })()}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="space-y-2">
                <h3 className="font-semibold">Analysis Information</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Date: {new Date(selectedAnalysis.created_at).toLocaleDateString()}</p>
                  <p>Time: {new Date(selectedAnalysis.created_at).toLocaleTimeString()}</p>
                  <p>ID: {selectedAnalysis.id}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button onClick={() => handleDownloadReport(selectedAnalysis)} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
                <Button variant="outline" onClick={() => setSelectedAnalysis(null)} className="flex-1">
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
