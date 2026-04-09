import { getSheet } from './lib/google-sheets';
import * as dotenv from 'dotenv';
dotenv.config();

async function debug() {
  try {
    const sheet = await getSheet("master_test");
    if (!sheet) {
      console.log("Sheet not found");
      return;
    }

    const rows = await sheet.getRows();
    console.log(`Total Rows found: ${rows.length}`);
    
    rows.forEach((row, i) => {
      console.log(`Row ${i + 2}: [${row.get("Test_ID")}] ${row.get("Nama_Tes")} (${row.get("Komponen")})`);
    });

    console.log("Grid Properties:", sheet.gridProperties);
  } catch (err) {
    console.error(err);
  }
}

debug();
