import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getLoadedDoc, getSheet } from "@/lib/google-sheets";
import { calculateMetrics, calculateBMI, getBMIStatus, calculateAchievement } from "@/lib/calculations";

// Helper to find value in object ignoring icons, spaces, and case
const getFuzzy = (obj: any, key: string) => {
  if (!obj) return undefined;
  // Exact match first
  if (obj[key] !== undefined) return obj[key];
  
  const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const k in obj) {
    const normalizedK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalizedK === normalizedKey || normalizedK.includes(normalizedKey)) {
      return obj[k];
    }
  }
  return undefined;
};

// Helper to map spreadsheet data to internal application format
const mapUser = (row: any) => ({
  User_ID: getFuzzy(row, "User_ID")?.toString().trim() || "",
  Username: getFuzzy(row, "Username") || "",
  Password: getFuzzy(row, "Password") || "",
  Name: getFuzzy(row, "Nama") || "",
  Role: getFuzzy(row, "Role") || "client",
  Weight: Number(getFuzzy(row, "BB")) || 0,
  Height: Number(getFuzzy(row, "TB")) || 0,
  Cabor: getFuzzy(row, "Cabor") || "",
  Birth_Date: getFuzzy(row, "Tgl_Lahir") || ""
});

const mapLogbook = (row: any) => ({
  User_ID: getFuzzy(row, "User_ID")?.toString().trim() || "",
  Date: getFuzzy(row, "Tanggal") || "",
  Sesi: getFuzzy(row, "Sesi") || "",
  Activity: getFuzzy(row, "Aktivitas") || getFuzzy(row, "Nama_Aktivitas") || "",
  Set: Number(getFuzzy(row, "Set")) || 0,
  Repetisi: Number(getFuzzy(row, "Repetisi")) || 0,
  Load: Number(getFuzzy(row, "Load")) || 0,
  Note: getFuzzy(row, "Note") || getFuzzy(row, "Catatan") || ""
});


const mapMasterTest = (row: any) => ({
  Test_ID: getFuzzy(row, "Test_ID") || "",
  Name: getFuzzy(row, "Nama_Tes") || "",
  Unit: getFuzzy(row, "Satuan") || "",
  Description: getFuzzy(row, "Deskripsi") || "",
  Category: getFuzzy(row, "Komponen") || "Umum"
});


const mapTestFisik = (row: any) => {
  const parseAchievement = (val: any) => {
    if (val === undefined || val === null) return 0;
    const str = val.toString().replace('%', '').trim();
    return Number(str) || 0;
  };

  return {
    Date: getFuzzy(row, "Tanggal") || "",
    User_ID: getFuzzy(row, "User_ID") || "",
    Metric: getFuzzy(row, "Test_ID") || "",
    Target: Number(getFuzzy(row, "Target")) || 0,
    Value: Number(getFuzzy(row, "Hasil")) || 0,
    achievement: parseAchievement(getFuzzy(row, "Achievement") || getFuzzy(row, "% Achievement"))
  };
};



export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).userId || (session.user as any).id;
  const userRole = (session.user as any).role || "";

  try {
    const usersSheet = await getSheet("users");
    const logbookSheet = await getSheet("logbook_harian");
    const testFisikSheet = await getSheet("test_fisik");
    const masterTestSheet = await getSheet("master_test");

    if (!usersSheet || !logbookSheet || !testFisikSheet || !masterTestSheet) {
      throw new Error("One or more required sheets are missing in the Google Spreadsheet.");
    }

    // Helper to get all data from a sheet using loadCells (bypassing Table ranges)
    const getAllData = async (sheet: any, maxCols: number) => {
      await sheet.loadCells(`A1:${String.fromCharCode(64 + maxCols)}500`);
      const headers: string[] = [];
      for (let c = 0; c < maxCols; c++) {
        const val = sheet.getCell(0, c).value?.toString().trim() || "";
        if (val) headers[c] = val;
      }

      const rows: any[] = [];
      for (let r = 1; r < 500; r++) {
        const rowData: any = {};
        let hasData = false;
        for (let c = 0; c < maxCols; c++) {
          if (!headers[c]) continue;
          const cell = sheet.getCell(r, c);
          let val = cell.value;
          
          // Basic data detection
          if (val !== null && val !== undefined && val !== "") hasData = true;
          
          // Handle Google Sheets date objects/serial numbers for Date-related columns
          const isDateHeader = headers[c].toLowerCase().includes('tanggal') || 
                               headers[c].toLowerCase().includes('tgl') || 
                               headers[c].toLowerCase().includes('birth');

          if (isDateHeader && typeof val === 'number' && val > 0) {
            // Google Sheets serial date to JS Date: days since 1899-12-30
            const jsDate = new Date((val - 25569) * 86400 * 1000);
            val = jsDate.toISOString().split('T')[0];
          }
          
          rowData[headers[c]] = val;
        }
        if (hasData) rows.push(rowData);
        else if (r > 10 && !hasData) break; // Stop after 10 empty rows
      }
      return rows;
    };

    const usersRaw = await getAllData(usersSheet, 12);
    const logbookRaw = await getAllData(logbookSheet, 12);
    const testFisikRaw = await getAllData(testFisikSheet, 12);
    const masterTestRaw = await getAllData(masterTestSheet, 12);

    let users = usersRaw.map(r => mapUser(r));
    let logbook = logbookRaw.map(r => mapLogbook(r));
    const masterTests = masterTestRaw.map(r => mapMasterTest(r));
    
    let tesFisik = testFisikRaw.map(r => {
      const mapped = mapTestFisik(r);
      // Robust matching: Check if Metric matches ID or Name for backward compatibility
      const master = masterTests.find(m => m.Test_ID === mapped.Metric || m.Name === mapped.Metric);
      return { 
        ...mapped, 
        Category: master?.Category || "Umum",
        Name: master?.Name || mapped.Metric // Display name for UI
      };
    });

    // Filter by role with case-insensitive userId
    if (userRole === "client") {
      logbook = logbook.filter(l => l.User_ID?.toString().toLowerCase() === userId?.toString().toLowerCase());
      tesFisik = tesFisik.filter(t => t.User_ID?.toString().toLowerCase() === userId?.toString().toLowerCase());
      users = users.filter(u => u.User_ID?.toString().toLowerCase() === userId?.toString().toLowerCase());
    }



    const processAthleteData = (u: any, l: any[], t: any[]) => {
      const metrics = calculateMetrics(l);
      const bmi = calculateBMI(u.Weight, u.Height);
      const bmiStatus = getBMIStatus(bmi);
      
      const testsWithAchievement = t.map(test => ({
        ...test,
        achievement: calculateAchievement(test.Value, test.Target)
      }));

      const avgAchievement = testsWithAchievement.length > 0 
        ? Math.round(testsWithAchievement.reduce((acc, cur) => acc + cur.achievement, 0) / testsWithAchievement.length)
        : 0;

      return {
        user: u,
        metrics,
        bmi,
        bmiStatus,
        tes_fisik: testsWithAchievement,
        avgAchievement
      };
    };

    if (userRole === "client") {
      return NextResponse.json({
        ...processAthleteData(users[0], logbook, tesFisik),
        logbook: logbook,
        tes_fisik: tesFisik,
        masterTests
      });
    }

    const uniqueUsers = users.filter(u => u.Role === "client");
    const summary = uniqueUsers.map(u => {
      // Use case-insensitive matching for aggregation
      const uLogbook = logbook.filter(l => l.User_ID?.toString().toLowerCase() === u.User_ID?.toString().toLowerCase());
      const uTests = tesFisik.filter(t => t.User_ID?.toString().toLowerCase() === u.User_ID?.toString().toLowerCase());
      return processAthleteData(u, uLogbook, uTests);
    });

    return NextResponse.json({
      summary,
      teamBmiDistribution: {
        Normal: summary.filter(s => s.bmiStatus === "Normal (Best Mark)").length,
        Underweight: summary.filter(s => s.bmiStatus === "Underweight").length,
        Overweight: summary.filter(s => s.bmiStatus === "Overweight").length,
      },
      teamAvgAchievement: summary.length > 0
        ? Math.round(summary.reduce((acc, cur) => acc + cur.avgAchievement, 0) / summary.length)
        : 0,
      alerts: summary.filter(s => s.metrics.acwr > 1.3),
      masterTests,
      logbook, // Ensure individual charts can see all logs
      tes_fisik: tesFisik // Ensure individual charts can see all tests
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper to append a row manually (bypassing Table restrictions)
const appendRowManual = async (sheet: any, data: any, maxCols: number) => {
  await sheet.loadCells(`A1:${String.fromCharCode(64 + maxCols)}600`);
  
  // Find first truly empty row
  let lastRowIdx = 0;
  for (let r = 1; r < 600; r++) {
    const val = sheet.getCell(r, 0).value;
    if (val !== null && val !== undefined && val !== "") {
      lastRowIdx = r;
    }
  }
  
  const targetRow = lastRowIdx + 1;
  const headers: string[] = [];
  for (let c = 0; c < maxCols; c++) {
    headers[c] = sheet.getCell(0, c).value?.toString().trim() || "";
  }

  for (const key in data) {
    const colIdx = headers.findIndex(h => {
      const normalizedH = h.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normalizedK = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normalizedH === normalizedK || normalizedH.includes(normalizedK);
    });
    if (colIdx !== -1) {
      sheet.getCell(targetRow, colIdx).value = data[key];
    }
  }
  await sheet.saveUpdatedCells();
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action, payload } = body;

    switch (action) {
      case "addAthlete": {
        const sheet = await getSheet("users");
        if (!sheet) throw new Error("Sheet not found");
        
        // Manual scan for last ID
        await sheet.loadCells('A1:A500');
        let maxIdNum = 0;
        for (let i = 1; i < 500; i++) {
          const val = sheet.getCell(i, 0).value;
          if (val) {
            const match = val.toString().match(/\d+/);
            if (match) {
              const num = parseInt(match[0], 10);
              if (num > maxIdNum) maxIdNum = num;
            }
          }
        }
        const nextId = `ath-${(maxIdNum + 1).toString().padStart(3, '0')}`;
        
        await appendRowManual(sheet, {
          User_ID: nextId,
          Username: payload.username,
          Password: payload.password,
          Nama: payload.name,
          Role: "client",
          BB: payload.weight,
          TB: payload.height,
          Cabor: payload.cabor,
          Tgl_Lahir: payload.birthDate
        }, 10);
        
        return NextResponse.json({ success: true, id: nextId });
      }

      case "updateProfile": {
        const sheet = await getSheet("users");
        const rows = await sheet?.getRows();
        const row = rows?.find(r => r.get("User_ID") === payload.userId);
        if (row) {
          row.set("Nama", payload.Name);
          row.set("BB", payload.Weight);
          row.set("TB", payload.Height);
          row.set("Tgl_Lahir", payload.Birth_Date);
          await row.save();
          return NextResponse.json({ success: true });
        }
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      case "addLogbook": {
        const sheet = await getSheet("logbook_harian");
        if (!sheet) throw new Error("Sheet not found");
        const entries = Array.isArray(payload) ? payload : [payload];
        
        for (const item of entries) {
          await appendRowManual(sheet, {
            Timestamp: new Date().toISOString(),
            User_ID: item.userId,
            Tanggal: item.date,
            Sesi: item.sessionName || "",
            Aktivitas: item.activity,
            Set: item.set || 0,
            Repetisi: item.reps || 0,
            Load: item.load || 0,
            Note: item.note || ""
          }, 10);
        }
        return NextResponse.json({ success: true });
      }


      case "addTestResult": {
        const sheet = await getSheet("test_fisik");
        if (!sheet) throw new Error("Sheet not found");

        const achievement = Math.round((Number(payload.value) / Number(payload.target)) * 100);

        await appendRowManual(sheet, {
          Tanggal: payload.date,
          User_ID: payload.userId,
          Test_ID: payload.metric,
          Target: payload.target,
          Hasil: payload.value,
          "% Achievement": achievement
        }, 8);

        return NextResponse.json({ success: true });
      }



      case "addMasterTest": {
        const sheet = await getSheet("master_test");
        if (!sheet) throw new Error("Sheet not found");

        // Scan for highest ID manually
        await sheet.loadCells('A1:A200');
        let maxIdNum = 0;
        for (let i = 1; i < 200; i++) {
          const val = sheet.getCell(i, 0).value;
          if (val) {
            const match = val.toString().match(/\d+/);
            if (match) {
              const num = parseInt(match[0], 10);
              if (num > maxIdNum) maxIdNum = num;
            }
          }
        }
        const nextId = `T${(maxIdNum + 1).toString().padStart(2, '0')}`;

        await appendRowManual(sheet, {
          Test_ID: nextId,
          Komponen: payload.Category,
          Nama_Tes: payload.Name,
          Satuan: payload.Unit,
          Deskripsi: payload.Description
        }, 6);

        return NextResponse.json({ success: true });
      }

      case "updateMasterTest": {
        const sheet = await getSheet("master_test");
        const rows = await sheet?.getRows();
        const row = rows?.find(r => r.get("Test_ID") === payload.Test_ID);
        if (row) {
          row.set("Nama_Tes", payload.Name);
          row.set("Satuan", payload.Unit);
          row.set("Deskripsi", payload.Description);
          row.set("Komponen", payload.Category);
          await row.save();
          return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Test not found" }, { status: 404 });
      }

      case "deleteMasterTest": {
        const sheet = await getSheet("master_test");
        const rows = await sheet?.getRows();
        const row = rows?.find(r => r.get("Test_ID") === payload.testId);
        if (row) {
          await row.delete();
          return NextResponse.json({ success: true });
        }
        return NextResponse.json({ error: "Test not found" }, { status: 404 });
      }

      default:
        return NextResponse.json({ error: "Invalid Action" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
