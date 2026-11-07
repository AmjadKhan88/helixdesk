import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Ticket } from "@/models/Ticket";
import { Counter } from "@/models/Counter";

async function main() {
  await connectDB();

  const highest = await Ticket.findOne({}, { number: 1 })
    .sort({ number: -1 })
    .lean();

  const currentCounter = await Counter.findOne({ _id: "ticket" }).lean();

  console.log("Current Counter in DB:", currentCounter);
  console.log("Highest Ticket Number in DB:", highest?.number ?? "None");

  const maxNumber = highest?.number && highest.number >= 1000 ? highest.number : 1000;
  const targetSeq = maxNumber - 1000;

  if (!currentCounter || currentCounter.seq < targetSeq) {
    await Counter.updateOne(
      { _id: "ticket" },
      { $set: { seq: targetSeq } },
      { upsert: true }
    );
    console.log(`Updated Counter seq to: ${targetSeq} (Next ticket will be #${maxNumber + 1})`);
  } else {
    console.log(`Counter is already in sync (seq: ${currentCounter.seq}, Next ticket: #${1000 + currentCounter.seq + 1})`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Error synchronizing counter:", err);
  process.exit(1);
});
