enum AudioEncodingEnum {
  LINEAR16_PCM = "LINEAR16_PCM",
  OGG_OPUS = "OGG_OPUS",
  MP3 = "MP3",
}

export enum ContainerAudioTypesEnum {
  WAV = "WAV",
  OGG_OPUS = "OGG_OPUS",
  MP3 = "MP3",
}

enum LoudnessNormalizationTypesEnum {
  LUFS = "LUFS",
  MAX_PEAK = "MAX_PEAK",
  LOUDNESS_NORMALIZATION_TYPE_UNSPECIFIED = "LOUDNESS_NORMALIZATION_TYPE_UNSPECIFIED",
}

enum DurationHintPoliciesEnum {
  EXACT_DURATION = "EXACT_DURATION",
  MIN_DURATION = "MIN_DURATION",
  MAX_DURATION = "MAX_DURATION",
  DURATION_HINT_POLICY_UNSPECIFIED = "DURATION_HINT_POLICY_UNSPECIFIED",
}

interface ITextVariable {
  variableName: string;
  variableValue: string;
}

interface ITextTemplate {
  textTemplate: string;
  variables: ITextVariable[];
}

interface IRawAudio {
  audioEncoding: AudioEncodingEnum;
  sampleRateHertz: string;
}

interface IContainerAudio {
  containerAudioType: ContainerAudioTypesEnum;
}

interface IAudioFormatOptions {
  rawAudio?: IRawAudio;
  containerAudio?: IContainerAudio;
}

interface IAudioContent {
  content: string; // bytes
  audioSpec: IAudioFormatOptions;
}

interface IAudioVariable {
  variableName: string;
  variableStartMs: string;
  variableLengthMs: string;
}

interface IAudioTemplate {
  audio: IAudioContent;
  textTemplate: ITextTemplate;
  variables: IAudioVariable[];
}

interface IDurationHint {
  policy: DurationHintPoliciesEnum;
  durationMs: string;
}

interface IHint {
  voice?: string;
  audioTemplate?: IAudioTemplate;
  speed?: string;
  volume?: string;
  role?: string;
  pitchShift?: string;
  duration?: IDurationHint;
}

export interface IUtteranceSynthesisRequest {
  model?: string;
  text?: string;
  textTemplate?: ITextTemplate;
  hints?: IHint[];
  outputAudioSpec?: IAudioFormatOptions;
  loudnessNormalizationType?: LoudnessNormalizationTypesEnum;
  unsafeMode?: boolean;
}
