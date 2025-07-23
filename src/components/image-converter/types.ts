export type FileItem = { id: string; file: File; format: string };

export type ResultItem = {
  url: string;
  outName: string;
  inSize: string;
  outSize: string;
  time: string;
  thumb: string;
  blob: Blob; // 변환된 blob을 직접 저장
};
