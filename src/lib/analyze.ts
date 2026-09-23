export type AnalysisConfidence = "low" | "medium" | "high";

export type AnalysisResult = {
  is_plant_image: boolean;
  possible_issue: string;
  confidence: AnalysisConfidence;
  visible_symptoms: string[];
  possible_causes: string[];
  general_next_steps: string[];
  see_expert: boolean;
};

export type AnalyzeCropResponse = {
  analysis: AnalysisResult;
  saved: { id: string; created_at: string } | null;
};

export type ImageAnalysisRecord = {
  id: string;
  image_path: string;
  result: AnalysisResult;
  created_at: string;
};
