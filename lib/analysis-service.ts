import { createClient } from "@/lib/supabase/client"
import type { PredictionResult } from "@/components/dashboard"

export interface AnalysisHistory {
  id: string
  user_id: string
  image_url: string
  result: string
  confidence: number
  recommendations: string | null
  created_at: string
  updated_at: string
}

export interface AnalysisStats {
  total_analyses: number
  healthy_count: number
  diseased_count: number
  avg_confidence: number
  most_common_disease: string | null
  recent_analyses: AnalysisHistory[]
}

class AnalysisService {
  private supabase = createClient()

  async saveAnalysis(prediction: PredictionResult): Promise<AnalysisHistory | null> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      const recommendations = this.generateRecommendations(prediction.result, prediction.confidence)

      const { data, error } = await this.supabase
        .from("analysis_history")
        .insert({
          user_id: user.id,
          image_url: prediction.imageUrl,
          result: prediction.result,
          confidence: prediction.confidence,
          recommendations,
        })
        .select()
        .single()

      if (error) {
        console.error("Error saving analysis:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error saving analysis:", error)
      return null
    }
  }

  async getAnalysisHistory(limit = 50): Promise<AnalysisHistory[]> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()

      if (!user) {
        return []
      }

      const { data, error } = await this.supabase
        .from("analysis_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Error fetching analysis history:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error fetching analysis history:", error)
      return []
    }
  }

  async getAnalysisStats(): Promise<AnalysisStats> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()

      if (!user) {
        return {
          total_analyses: 0,
          healthy_count: 0,
          diseased_count: 0,
          avg_confidence: 0,
          most_common_disease: null,
          recent_analyses: [],
        }
      }

      const { data: analyses, error } = await this.supabase
        .from("analysis_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching analysis stats:", error)
        return {
          total_analyses: 0,
          healthy_count: 0,
          diseased_count: 0,
          avg_confidence: 0,
          most_common_disease: null,
          recent_analyses: [],
        }
      }

      const total_analyses = analyses?.length || 0
      const healthy_count = analyses?.filter((a) => a.result.toLowerCase().includes("healthy")).length || 0
      const diseased_count = total_analyses - healthy_count
      const avg_confidence =
        total_analyses > 0 ? analyses.reduce((sum, a) => sum + a.confidence, 0) / total_analyses : 0

      // Find most common disease (excluding healthy)
      const diseaseResults = analyses?.filter((a) => !a.result.toLowerCase().includes("healthy")) || []
      const diseaseCount: Record<string, number> = {}
      diseaseResults.forEach((a) => {
        diseaseCount[a.result] = (diseaseCount[a.result] || 0) + 1
      })

      const most_common_disease =
        Object.keys(diseaseCount).length > 0 ? Object.entries(diseaseCount).sort(([, a], [, b]) => b - a)[0][0] : null

      return {
        total_analyses,
        healthy_count,
        diseased_count,
        avg_confidence,
        most_common_disease,
        recent_analyses: analyses?.slice(0, 5) || [],
      }
    } catch (error) {
      console.error("Error fetching analysis stats:", error)
      return {
        total_analyses: 0,
        healthy_count: 0,
        diseased_count: 0,
        avg_confidence: 0,
        most_common_disease: null,
        recent_analyses: [],
      }
    }
  }

  async deleteAnalysis(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("analysis_history").delete().eq("id", id)

      if (error) {
        console.error("Error deleting analysis:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error deleting analysis:", error)
      return false
    }
  }

  private generateRecommendations(result: string, confidence: number): string {
    const isHealthy = result.toLowerCase().includes("healthy")

    if (isHealthy) {
      return JSON.stringify({
        status: "healthy",
        actions: [
          "Continue regular monitoring and maintain good orchard practices",
          "Maintain proper spacing between trees for air circulation",
          "Regular pruning to remove dead or diseased branches",
          "Monitor for early signs of disease during growing season",
        ],
      })
    } else {
      return JSON.stringify({
        status: "diseased",
        disease: result,
        confidence: confidence,
        actions: [
          "Consult with a local agricultural extension office",
          "Consider appropriate fungicide treatment",
          "Remove and dispose of affected leaves properly",
          "Monitor surrounding trees for similar symptoms",
          "Improve air circulation around affected trees",
        ],
      })
    }
  }
}

export const analysisService = new AnalysisService()
