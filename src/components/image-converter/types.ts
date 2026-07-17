export type FileItem = { id: string; file: File; format: string };

export type ResultItem = {
  url: string;
  outName: string;
  inSize: string;
  outSize: string;
  time: string;
  thumb: string;
  blob: Blob;
  savings: number;
  width: number;
  height: number;
};

export type ConvertOptions = {
  autorotate?: boolean;
  stripMetadata?: boolean;
  quality?: number;
  targetBytes?: number;
};
