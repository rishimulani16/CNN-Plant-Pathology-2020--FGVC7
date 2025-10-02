"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertTriangle, RotateCcw, Calendar, TrendingUp, Leaf, Download } from "lucide-react"
import type { PredictionResult as PredictionResultType } from "./dashboard"
import { reportGenerator } from "@/lib/report-generator"
import { useAuth } from "@/hooks/use-auth"

interface PredictionResultProps {
  prediction: PredictionResultType
  onReset: () => void
}

export default function PredictionResult({ prediction, onReset }: PredictionResultProps) {
  const { user } = useAuth()
  const isHealthy = prediction.result.toLowerCase() === "healthy"
  const confidencePercentage = Math.round(prediction.confidence * 100)

  const getResultColor = () => {
    if (isHealthy) return "text-green-600"
    return "text-orange-600"
  }

  const getResultIcon = () => {
    if (isHealthy) return <CheckCircle className="w-5 h-5 text-green-600" />
    return <AlertTriangle className="w-5 h-5 text-orange-600" />
  }

  const getResultBadge = () => {
    if (isHealthy) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
          Healthy
        </Badge>
      )
    }
    return (
      <Badge variant="destructive" className="bg-orange-100 text-orange-800 border-orange-200">
        Disease Detected
      </Badge>
    )
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getRecommendations = () => {
    if (isHealthy) {
      return {
        status: "healthy",
        actions: [
          "Continue regular monitoring and maintain good orchard practices",
          "Maintain proper spacing between trees for air circulation",
          "Regular pruning to remove dead or diseased branches",
          "Monitor for early signs of disease during growing season",
        ],
      }
    } else {
      return {
        status: "diseased",
        disease: prediction.result,
        confidence: prediction.confidence,
        actions: [
          "Consult with a local agricultural extension office",
          "Consider appropriate fungicide treatment",
          "Remove and dispose of affected leaves properly",
          "Monitor surrounding trees for similar symptoms",
          "Improve air circulation around affected trees",
        ],
      }
    }
  }

  const handleDownloadReport = () => {
    const reportData = {
      analysis: prediction,
      timestamp: prediction.timestamp,
      userEmail: user?.email || "Unknown User",
      recommendations: getRecommendations(),
    }

    reportGenerator.generatePDFReport(reportData)
  }

  return (
    <div className="space-y-6">
      {/* Main Result Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Leaf className="w-5 h-5" />
              Analysis Complete
            </CardTitle>
            {getResultBadge()}
          </div>
          <CardDescription>AI-powered disease detection results</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Preview */}
          <div className="rounded-lg overflow-hidden border">
            <img
              src={prediction.imageUrl || "/placeholder.svg"}
              alt="Analyzed leaf"
              className="w-full h-48 object-cover"
            />
          </div>

          {/* Result Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {getResultIcon()}
              <div>
                <p className="text-lg font-semibold">
                  <span className={getResultColor()}>{prediction.result}</span>
                </p>
                <p className="text-sm text-muted-foreground">Detected condition</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Confidence Score</span>
                <span className="text-sm font-bold">{confidencePercentage}%</span>
              </div>
              <Progress value={confidencePercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">Higher confidence indicates more reliable detection</p>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Analyzed on {formatDate(prediction.timestamp)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Card */}
      {!isHealthy && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-orange-800">Disease detected: {prediction.result}</p>
                  <p className="text-sm text-muted-foreground">Immediate attention recommended to prevent spread.</p>
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium text-orange-800 mb-2">Recommended Actions:</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Consult with a local agricultural extension office</li>
                  <li>• Consider appropriate fungicide treatment</li>
                  <li>• Remove and dispose of affected leaves properly</li>
                  <li>• Monitor surrounding trees for similar symptoms</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={handleDownloadReport} variant="outline" className="flex-1 bg-transparent">
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </Button>
        <Button onClick={onReset} variant="outline" className="flex-1 bg-transparent">
          <RotateCcw className="w-4 h-4 mr-2" />
          Analyze Another Leaf
        </Button>
      </div>
    </div>
  )
}
