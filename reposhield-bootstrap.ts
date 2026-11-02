import { clean, generateReport } from "reposhield-scan";

const report = await clean({ root: process.cwd(), mode: "ci", failOn: "high" });
process.stderr.write(generateReport(report, { format: "text" }));

if (!report.safe) process.exit(1);
await import("./src/server.js");
