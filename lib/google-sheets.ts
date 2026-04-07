import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.trim().replace(/^["'](.+)["']$/, '$1').replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID || '', serviceAccountAuth);

let loadPromise: Promise<void> | null = null;

export async function getLoadedDoc() {
  if (!loadPromise) {
    // Ensure we only call loadInfo once and handle the promise correctly
    loadPromise = doc.loadInfo().catch(err => {
      loadPromise = null; // Reset on failure so it can retry
      throw err;
    });
  }
  await loadPromise;
  return doc;
}

export async function getSheet(title: string) {
  const d = await getLoadedDoc();
  return d.sheetsByTitle[title];
}