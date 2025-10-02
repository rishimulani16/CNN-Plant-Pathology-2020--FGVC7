"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  TrendingUp,
  Leaf,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Download,
  FileText,
  Activity,
} from "lucide-react"
import { analysisService, type AnalysisStats } from "@/lib/analysis-service"
import { reportGenerator } from "@/lib/report-generator"
import { useAuth } from "@/hooks/use-auth"

export default function SummaryDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<AnalysisStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const analysisStats = await analysisService.getAnalysisStats()
      setStats(analysisStats)
    } catch (error) {
      console.error("Error loading stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadSummary = () => {
    if (stats && user?.email) {
      reportGenerator.generateSummaryReport(stats, user.email)
    }
  }

  const handleExportCSV = async () => {
    try {
      const history = await analysisService.getAnalysisHistory(1000) // Get all history
      reportGenerator.generateCSVReport(history)
    } catch (error) {
      console.error("Error exporting CSV:", error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Unable to load statistics. Please try again.</p>
        </CardContent>
      </Card>
    )
  }

  const healthyPercentage = stats.total_analyses > 0 ? (stats.healthy_count / stats.total_analyses) * 100 : 0

  const diseasedPercentage = stats.total_analyses > 0 ? (stats.diseased_count / stats.total_analyses) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analysis Summary</h2>
          <p className="text-muted-foreground">Overview of your leaf disease detection history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleDownloadSummary} size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download Summary
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.total_analyses}</p>
                <p className="text-sm text-muted-foreground">Total Analyses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.healthy_count}</p>
                <p className="text-sm text-muted-foreground">Healthy Leaves</p>
              </div>
            </div>
            <div className="mt-2">
              <Progress value={healthyPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{healthyPercentage.toFixed(1)}% of total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats.diseased_count}</p>
                <p className="text-sm text-muted-foreground">Diseased Leaves</p>
              </div>
            </div>
            <div className="mt-2">
              <Progress value={diseasedPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{diseasedPercentage.toFixed(1)}% of total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{(stats.avg_confidence * 100).toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Most Common Disease */}
      {stats.most_common_disease && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Most Common Disease
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Badge variant="destructive" className="bg-orange-100 text-orange-800 border-orange-200">
                {stats.most_common_disease}
              </Badge>
              <p className="text-sm text-muted-foreground">This disease appears most frequently in your analyses</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Analyses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Analyses
          </CardTitle>
          <CardDescription>Your latest leaf disease detection results</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recent_analyses.length > 0 ? (
            <div className="space-y-4">
              {stats.recent_analyses.map((analysis) => {
                const isHealthy = analysis.result.toLowerCase().includes("healthy")
                return (
                  <div key={analysis.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {isHealthy ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                      )}
                      <div>
                        <p className="font-medium">{analysis.result}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(analysis.created_at).toLocaleDateString()} at{" "}
                          {new Date(analysis.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{(analysis.confidence * 100).toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">confidence</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Leaf className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No analyses yet. Start by uploading a leaf image!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health Overview */}
      {stats.total_analyses > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Health Overview</CardTitle>
            <CardDescription>Distribution of healthy vs diseased leaves</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Healthy</span>
                </div>
                <span className="font-medium">
                  {stats.healthy_count} ({healthyPercentage.toFixed(1)}%)
                </span>
              </div>
              <Progress value={healthyPercentage} className="h-3" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span>Diseased</span>
                </div>
                <span className="font-medium">
                  {stats.diseased_count} ({diseasedPercentage.toFixed(1)}%)
                </span>
              </div>
              <Progress value={diseasedPercentage} className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
