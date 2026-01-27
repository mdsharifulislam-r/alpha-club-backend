
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

const serviceAccountPath = path.join(process.cwd(), 'fcmServiceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  throw new Error(
    `Service account key file not found at ${serviceAccountPath}. Please ensure the file exists.`
  );
}

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))
  ),
});

export default admin;
