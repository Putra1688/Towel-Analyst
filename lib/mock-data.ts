// Mock Data for Towell Analyst
// This data is used as a fallback if Google Sheets credentials are not provided.

export const MOCK_USERS = [
  { User_ID: "COACH-001", Name: "Coach Rangga", Role: "coach", Email: "coach@towell.com", Password: "password123", Weight: 75, Height: 175, Birth_Date: "1990-01-01" },
  { User_ID: "ATH-001", Name: "Athlete One", Role: "client", Email: "client@towell.com", Password: "password123", Weight: 68, Height: 170, Birth_Date: "2001-12-21" },
  { User_ID: "ATH-002", Name: "Athlete Two", Role: "client", Email: "ath002@towell.com", Password: "password123", Weight: 85, Height: 180, Birth_Date: "1998-05-15" },
  { User_ID: "ATH-003", Name: "Athlete Three", Role: "client", Email: "ath003@towell.com", Password: "password123", Weight: 60, Height: 165, Birth_Date: "2004-10-10" },
  { User_ID: "ATH-004", Name: "Athlete Four", Role: "client", Email: "ath004@towell.com", Password: "password123", Weight: 95, Height: 185, Birth_Date: "1995-02-28" },
];

export const MOCK_MASTER_TESTS = [
  { Test_ID: "T001", Name: "VO2 Max", Unit: "ml/kg/min", Category: "Cardio" },
  { Test_ID: "T002", Name: "Push Up", Unit: "reps", Category: "Strength" },
  { Test_ID: "T003", Name: "Beep Test", Unit: "level", Category: "Endurance" },
  { Test_ID: "T004", Name: "Vertical Jump", Unit: "cm", Category: "Power" },
];

export const generateMockLogbook = (userId: string, days: number = 30) => {
  const logbook = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Generate some variation in RPE and Duration
    const rpe = Math.floor(Math.random() * 5) + 4; // 4-8
    const duration = Math.floor(Math.random() * 40) + 60; // 60-100 mins
    
    logbook.push({
      User_ID: userId,
      Date: date.toISOString().split('T')[0],
      RPE: rpe,
      Duration: duration,
      Activity: "Training Session",
    });
  }
  return logbook;
};

export const MOCK_LOGBOOK = [
  ...generateMockLogbook("ATH-001", 35),
  ...generateMockLogbook("ATH-002", 35),
  ...generateMockLogbook("ATH-003", 35),
  ...generateMockLogbook("ATH-004", 35),
];

export const MOCK_TES_FISIK = [
  { User_ID: "ATH-001", Date: "2026-03-01", Metric: "VO2 Max", Value: 52, Target: 55 },
  { User_ID: "ATH-001", Date: "2026-04-01", Metric: "VO2 Max", Value: 54, Target: 55 },
  { User_ID: "ATH-002", Date: "2026-03-15", Metric: "VO2 Max", Value: 48, Target: 52 },
  { User_ID: "ATH-003", Date: "2026-04-01", Metric: "Push Up", Value: 45, Target: 50 },
  { User_ID: "ATH-004", Date: "2026-04-01", Metric: "VO2 Max", Value: 42, Target: 50 },
];
