export type RootStackParamList = {
  Home: undefined;
  Scanner: { mode: string };
  BarcodeDetails: { item: { text: string; type: string; image?: string } };
  About: undefined;
};
