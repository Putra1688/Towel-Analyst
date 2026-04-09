import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getLoadedDoc, getSheet } from "@/lib/google-sheets";
import { calculateMetrics, calculateBMI, getBMIStatus, calculateAchievement } from "@/lib/calculations";

// Helper to map spreadsheet data to internal application format
const mapUser = (row: any) => ({
  User_ID: row.User_ID || "",
  Username: row.Username || "",
  Password: row.Password || "",
  Name: row.Nama || "",
  Role: row.Role || "client",
  Weight: Number(row.BB) || 0,
  Height: Number(row.TB) || 0,
  Cabor: row.Cabor || "",
  Birth_Date: row.Tgl_Lahir || ""
});

const mapLogbook = (row: any) => ({
  User_ID: row.User_ID || "",
  Date: row.Tanggal || "",
  Sesi: row.Sesi || "",
  Activity: row.Nama_Aktivitas || "",
  Set: Number(row.Set) || 0,
  Repetisi: Number(row.Repetisi) || 0,
  Load: Number(row.Load) || 0,
  Note: row.Note || "",
  // Legacy fields
  RPE: Number(row.RPE) || 0,
  Duration: Number(row.Durasi) || 0
});


const mapMasterTest = (row: any) => {
  // Normalize keys to handle variations in spreadsheet headers (e.g., trailing spaces)
  const obj: any = {};
  for (const key in row) {
    obj[key.trim()] = row[key];
  }
  return {
    Test_ID: obj.Test_ID || "",
    Name: obj.Nama_Tes || "",
    Unit: obj.Satuan || "",
    Description: obj.Deskripsi || "",
    Category: obj.Komponen || "Umum"
  };
};


const mapTestFisik = (row: any) => ({
  Date: row.Tanggal || "",
  User_ID: row.User_ID || "",
  Metric: row.Test_ID || "",
  Target: Number(row.Target) || 0,
  Value: Number(row.Hasil) || 0,
  achievement: Number(row.Achievement) || 0
});



export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userRole = (session.user as any).role;
  const userId = (session.user as any).userId;

  try {
    const usersSheet = await getSheet("users");
    const logbookSheet = await getSheet("logbook_harian");
    const testFisikSheet = await getSheet("test_fisik");
    const masterTestSheet = await getSheet("master_test");

    if (!usersSheet || !logbookSheet || !testFisikSheet || !masterTestSheet) {
      throw new Error("One or more required sheets are missing in the Google Spreadsheet.");
    }

    const usersRaw = await usersSheet.getRows();
    const logbookRaw = await logbookSheet.getRows();
    const testFisikRaw = await testFisikSheet.getRows();
    const masterTestRaw = await masterTestSheet.getRows();

    let users = usersRaw.map(r => mapUser(r.toObject()));
    let logbook = logbookRaw.map(r => mapLogbook(r.toObject()));
    // Use loadCells to bypass potentially restricted Table ranges
    await masterTestSheet.loadCells('A1:E200');
    const masterTestRows = [];
    for (let i = 1; i < 200; i++) {
      const id = masterTestSheet.getCell(i, 0).value;
      if (!id) continue;
      masterTestRows.push({
        Test_ID: id.toString(),
        Name: masterTestSheet.getCell(i, 2).value?.toString() || "",
        Unit: masterTestSheet.getCell(i, 3).value?.toString() || "",
        Description: masterTestSheet.getCell(i, 4).value?.toString() || "",
        Category: masterTestSheet.getCell(i, 1).value?.toString() || "Umum"
      });
    }
    const masterTests = masterTestRows;

    let tesFisik = testFisikRaw.map(r => {
      const base = mapTestFisik(r.toObject());
      const master = masterTests.find(m => m.Name === base.Metric || m.Test_ID === base.Metric);
      return { ...base, Category: master?.Category || "Umum" };
    });

    // Filter by role
    if (userRole === "client") {
      logbook = logbook.filter(l => l.User_ID === userId);
      tesFisik = tesFisik.filter(t => t.User_ID === userId);
      users = users.filter(u => u.User_ID === userId);
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
        masterTests
      });
    }

    const uniqueUsers = users.filter(u => u.Role === "client");
    const summary = uniqueUsers.map(u => {
      const uLogbook = logbook.filter(l => l.User_ID === u.User_ID);
      const uTests = tesFisik.filter(t => t.User_ID === u.User_ID);
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
      masterTests
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action, payload } = body;

    switch (action) {
      case "addAthlete": {
        const sheet = await getSheet("users");
        const rows = await sheet?.getRows();
        const nextIdNumber = (rows?.length || 0) + 1;
        const nextId = `ath-${nextIdNumber.toString().padStart(3, '0')}`;
        
        await sheet?.addRow({
          User_ID: nextId,
          Username: payload.username,
          Password: payload.password,
          Nama: payload.name,
          Role: "client",
          BB: payload.weight,
          TB: payload.height,
          Cabor: payload.cabor,
          Tgl_Lahir: payload.birthDate
        });
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
        const entries = Array.isArray(payload) ? payload : [payload];
        
        for (const item of entries) {
          await sheet?.addRow({
            Timestamp: new Date().toISOString(),
            User_ID: item.userId,
            Tanggal: item.date,
            Sesi: item.sessionName || "",
            Nama_Aktivitas: item.activity,
            Set: item.set || 0,
            Repetisi: item.reps || 0,
            Load: item.load || 0,
            Note: item.note || ""
          });
        }
        return NextResponse.json({ success: true });
      }


      case "addTestResult": {
        const sheet = await getSheet("test_fisik");
        await sheet?.addRow({
          Tanggal: payload.date,
          User_ID: payload.userId,
          Test_ID: payload.metric,
          Target: payload.target,
          Hasil: payload.value,
          Achievement: Math.round((payload.value / payload.target) * 100)
        });
        return NextResponse.json({ success: true });
      }



      case "addMasterTest": {
        const sheet = await getSheet("master_test");
        if (!sheet) throw new Error("Sheet not found");

        // Load a safe range to detect true end of data (bypassing Table ranges)
        await sheet.loadCells('A1:E200');
        
        let lastRowIdx = 0;
        let maxIdNum = 0;
        
        // Scan for highest ID and last occupied row
        for (let i = 1; i < 200; i++) {
          const idValue = sheet.getCell(i, 0).value;
          if (idValue) {
            lastRowIdx = i;
            const match = idValue.toString().match(/\d+/);
            if (match) {
              const num = parseInt(match[0], 10);
              if (num > maxIdNum) maxIdNum = num;
            }
          }
        }

        const nextId = `T${(maxIdNum + 1).toString().padStart(2, '0')}`;
        const targetRow = lastRowIdx + 1;

        // Write directly to cells to ensure it works even with Table range restrictions
        sheet.getCell(targetRow, 0).value = nextId;
        sheet.getCell(targetRow, 1).value = payload.Category;
        sheet.getCell(targetRow, 2).value = payload.Name;
        sheet.getCell(targetRow, 3).value = payload.Unit;
        sheet.getCell(targetRow, 4).value = payload.Description;
        
        await sheet.saveUpdatedCells();

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
