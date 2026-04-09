/**
 * Sport Monitoring Calculations
 * Towell Analyst
 */

export interface LogbookEntry {
  User_ID: string;
  Date: string;
  Sesi?: string;
  Activity: string;
  Set?: number;
  Repetisi?: number;
  Load?: number;
  Note?: string;
  // Legacy fields
  RPE?: number;
  Duration?: number;
}

export function calculateDailyLoad(entry: LogbookEntry) {
  // Use new formula: Set * Repetisi * Load
  const volumeLoad = (Number(entry.Set) || 0) * (Number(entry.Repetisi) || 0) * (Number(entry.Load) || 0);
  if (volumeLoad > 0) return volumeLoad;
  
  // Legacy fallback: RPE * Duration
  return (Number(entry.RPE) || 0) * (Number(entry.Duration) || 0);
}


export function calculateAge(birthDate: string) {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function getMetricsInsights(metrics: any) {
  let monotonyMsg = "Monotony ideal. Variasi beban latihan harian Anda terjaga dengan baik.";
  let strainMsg = "Beban regangan (Strain) masih dalam batas toleransi normal.";

  if (metrics.monotony > 1.5 && metrics.monotony <= 2.0) {
    monotonyMsg = "Monotony sedikit tinggi. Perhatikan variasi intensitas latihan Anda.";
  } else if (metrics.monotony > 2.0) {
    monotonyMsg = "Monotony tinggi! Risiko cedera meningkat. Segera jadwalkan hari pemulihan.";
  }

  if (metrics.strain > 5000 && metrics.strain <= 7000) {
    strainMsg = "Beban regangan (Strain) meningkat. Pastikan istirahat dan nutrisi tercukupi.";
  } else if (metrics.strain > 7000) {
    strainMsg = "Strain Sangat Tinggi! Segera kurangi volume latihan untuk mencegah kelelahan kronis.";
  }

  return { monotonyMsg, strainMsg };
}


export function calculateBMI(weight: number, height: number) {
  if (!weight || !height) return 0;
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));
}

export function getBMIStatus(bmi: number) {
  if (bmi < 18.5) return "Kurang";
  if (bmi >= 18.5 && bmi <= 25) return "Optimal";
  return "Overweight";
}

export function calculateAchievement(result: number, target: number) {
  if (!target) return 0;
  return Math.round((result / target) * 100);
}

export function calculateMetrics(logbook: LogbookEntry[]) {
  // Sort by date (descending)
  const sorted = [...logbook].sort(
    (a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime()
  );

  // Weekly Load (Last 7 days)
  const last7Days = sorted.slice(0, 7);
  const weeklyLoad = last7Days.reduce(
    (acc, cur) => acc + calculateDailyLoad(cur),
    0
  );

  // Monotony Calculation (Ideal < 1.5)
  // Mean overlap with standard deviation
  const dailyLoads = last7Days.map((d) => calculateDailyLoad(d));
  const mean = dailyLoads.reduce((a, b) => a + b, 0) / (dailyLoads.length || 1);
  const variance =
    dailyLoads.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
    (dailyLoads.length || 1);
  const stdDev = Math.sqrt(variance);
  const monotony = mean / (stdDev || 1); // Avoid division by zero

  // Strain
  const strain = weeklyLoad * monotony;

  // ACWR (Acute: 7 days, Chronic: 28 days)
  const last28Days = sorted.slice(0, 28);
  const chronicWorkload = 
    last28Days.reduce((acc, cur) => acc + calculateDailyLoad(cur), 0) / 4; // Avg per week
  const acwr = weeklyLoad / (chronicWorkload || 1);

  return {
    weeklyLoad,
    monotony: parseFloat(monotony.toFixed(2)),
    strain: Math.round(strain),
    acwr: parseFloat(acwr.toFixed(2)),
    dailyLoads: sorted.map(d => ({
      ...d,
      load: calculateDailyLoad(d)
    }))
  };
}
