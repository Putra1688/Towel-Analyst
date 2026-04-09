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

export function calculateComparison(current: number, previous: number) {
   const diff = current - previous;
   const percent = previous !== 0 ? (diff / previous) * 100 : 0;
   return {
      diff: Number(diff.toFixed(1)),
      percent: Number(percent.toFixed(1)),
      isUp: diff > 0,
      isDown: diff < 0
   };
}

export function aggregateByTimeline(data: any[], timeline: 'daily' | 'weekly' | 'monthly', dateField: string = 'Date') {
   const groups: Record<string, any> = {};

   data.forEach(item => {
      const date = new Date(item[dateField]);
      let key = '';
      
      if (timeline === 'daily') {
         key = date.toISOString().split('T')[0];
      } else if (timeline === 'weekly') {
         // Get the start of the week (Monday)
         const day = date.getDay() || 7;
         const start = new Date(date);
         start.setHours(0,0,0,0);
         start.setDate(date.getDate() - day + 1);
         key = start.toISOString().split('T')[0];
      } else {
         // Monthly
         key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!groups[key]) {
         groups[key] = { label: key, sum: 0, count: 0 };
      }
      
      const val = item.achievement || item.Achievement || item.value || item.Value || calculateDailyLoad(item) || 0;
      groups[key].sum += val;
      groups[key].count += 1;
   });

   return Object.values(groups)
      .map(g => ({
         label: g.label,
         value: g.count > 0 ? Math.round(g.sum / g.count) : 0,
         count: g.count
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
}

export function getRadarData(masterTests: any[], results: any[]) {
   const components = ["Endurance", "Strength", "Speed", "Agility", "Flexibility", "Power", "Umum"];
   
   return components.map(comp => {
      const testsInComp = masterTests.filter(t => t.Category === comp);
      const testNames = testsInComp.map(t => t.Name);
      
      const scores = results
         .filter(r => testNames.includes(r.Metric))
         .map(r => r.achievement || 0);
      
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      
      return {
         subject: comp,
         A: Math.round(avg),
         fullMark: 100
      };
   });
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
  if (bmi < 18.5) return "Underweight";
  if (bmi >= 18.5 && bmi <= 25) return "Normal (Best Mark)";
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
