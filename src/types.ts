export interface MediaItem {
  id: string;
  url: string;
  thumbnail: string;
  filename: string;
  resolution?: string;
  size?: number; // bytes
  type: 'image' | 'video';
}

export type AnalysisStage = 
  | 'idle' 
  | 'stage1' // Analyzing URL
  | 'stage2' // Scanning page
  | 'stage3' // Finding downloadable media
  | 'stage4' // Preparing results
  | 'stage5' // Completed
  | 'error';
