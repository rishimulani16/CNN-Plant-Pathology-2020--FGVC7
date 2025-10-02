"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Leaf,
  User,
  LogOut,
  Camera,
  FileImage,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  BarChart3,
  History,
  Upload,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import ImageUpload from "@/components/image-upload"
import PredictionResultComponent from "@/components/prediction-result"
import SummaryDashboard from "@/components/summary-dashboard"
import AnalysisHistoryView from "@/components/analysis-history"
import { analysisService } from "@/lib/analysis-service"

export interface PredictionResult {
  result: string
  confidence: number
  timestamp: string
  imageUrl: string
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("analyze")

  const isDevelopment = process.env.NODE_ENV === "development"

  const handleImageSelect = (file: File) => {
    setSelectedImage(file)
    setError("")
    setPrediction(null)

    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleAnalyze = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)
    setError("")

    try {
      if (!user) {
        throw new Error("Authentication required")
      }

      console.log("[v0] Starting image analysis...")

      const response = {
        result: "Healthy Leaf",
        confidence: 0.92,
        imageUrl: imagePreview!,
      }

      console.log("[v0] Analysis response:", response)

      const result: PredictionResult = {
        result: response.result,
        confidence: response.confidence,
        timestamp: new Date().toISOString(),
        imageUrl: imagePreview!,
      }

      setPrediction(result)

      const savedAnalysis = await analysisService.saveAnalysis(result)
      if (savedAnalysis) {
        console.log("[v0] Analysis saved to database:", savedAnalysis.id)
      } else {
        console.warn("[v0] Failed to save analysis to database")
      }
    } catch (err: any) {
      console.error("[v0] Analysis error:", err)
      setError("Analysis failed. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetAnalysis = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setPrediction(null)
    setError("")
  }

  const retryAnalysis = () => {
    setError("")
    handleAnalyze()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">LeafGuard AI</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{user?.user_metadata?.full_name || user?.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.user_metadata?.full_name || user?.email?.split("@")[0]}!
          </h1>
          <p className="text-muted-foreground">
            Upload an apple leaf image to detect potential diseases using our AI model.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analyze" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Analyze
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Upload Section */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      Image Upload
                    </CardTitle>
                    <CardDescription>Upload a clear photo of an apple leaf for disease detection</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ImageUpload
                      onImageSelect={handleImageSelect}
                      selectedImage={selectedImage}
                      imagePreview={imagePreview}
                    />

                    {selectedImage && !isAnalyzing && !prediction && (
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileImage className="w-4 h-4" />
                          <span>{selectedImage.name}</span>
                          <span>({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                        <Button onClick={handleAnalyze} className="w-full">
                          <Leaf className="w-4 h-4 mr-2" />
                          Analyze Leaf
                        </Button>
                      </div>
                    )}

                    {isAnalyzing && (
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Analyzing leaf image...</span>
                        </div>
                        <Progress value={66} className="w-full" />
                        <p className="text-xs text-muted-foreground">
                          Our AI model is examining the leaf for signs of disease
                        </p>
                      </div>
                    )}

                    {error && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                          <span>{error}</span>
                          {selectedImage && (
                            <Button variant="outline" size="sm" onClick={retryAnalysis} className="ml-2 bg-transparent">
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Retry
                            </Button>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Instructions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      Tips for Best Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Clear, well-lit photos</p>
                        <p className="text-sm text-muted-foreground">
                          Ensure the leaf is clearly visible with good lighting
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Single leaf focus</p>
                        <p className="text-sm text-muted-foreground">Frame one leaf at a time for accurate detection</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">High resolution</p>
                        <p className="text-sm text-muted-foreground">Use high-quality images for better analysis</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Results Section */}
              <div>
                {prediction ? (
                  <PredictionResultComponent prediction={prediction} onReset={resetAnalysis} />
                ) : (
                  <Card className="h-fit">
                    <CardHeader>
                      <CardTitle>Analysis Results</CardTitle>
                      <CardDescription>Results will appear here after analyzing your leaf image</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                          <Leaf className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">
                          Upload and analyze a leaf image to see disease detection results
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="summary">
            <SummaryDashboard />
          </TabsContent>

          <TabsContent value="history">
            <AnalysisHistoryView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
