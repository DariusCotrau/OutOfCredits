declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}
declare module '*.png' {
  const content: number;
  export default content;
}
declare module '*.jpg' {
  const content: number;
  export default content;
}
declare module '*.jpeg' {
  const content: number;
  export default content;
}
declare module '*.gif' {
  const content: number;
  export default content;
}
declare module '*.webp' {
  const content: number;
  export default content;
}
declare module '*.json' {
  const content: Record<string, unknown>;
  export default content;
}
declare module '*.tflite' {
  const content: string;
  export default content;
}
declare module '*.ttf' {
  const content: string;
  export default content;
}
declare module '*.otf' {
  const content: string;
  export default content;
}
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
declare global {
  var HermesInternal: {
    getRuntimeProperties?: () => Record<string, unknown>;
  } | null;
  var __DEV__: boolean;
}
export {};
