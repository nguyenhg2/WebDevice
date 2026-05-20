const settingLabel: Record<string, string> = {
  Low: "Thấp",
  Medium: "Trung bình",
  High: "Cao",
  Ultra: "Rất cao",
  "Thấp": "Thấp",
  "Trung bình": "Trung bình",
  "Cao": "Cao",
  "Rất cao": "Rất cao",
};

export function viSetting(setting: string) {
  return settingLabel[setting] ?? setting;
}
