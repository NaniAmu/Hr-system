const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/hr_system").then(async () => {
  console.log("=== FIXING HR DATABASE ===\n");
  
  const userCol = mongoose.connection.collection("users");
  const empCol = mongoose.connection.collection("employees");
  
  // 1. Delete ghost user
  const ghostId = new mongoose.Types.ObjectId("699527192192a0b8fd85f169");
  const del = await userCol.deleteOne({ _id: ghostId });
  console.log("1. Deleted ghost user:", del.deletedCount);
  
  // 2. Find correct user
  const correctUser = await userCol.findOne({ email: "eng.head@helpdesk.com" });
  if (!correctUser) {
    console.log("ERROR: Correct user not found!");
    process.exit(1);
  }
  console.log("2. Correct user _id:", correctUser._id.toString());
  
  // 3. Update employee userId
  const upd = await empCol.updateOne(
    { email: "eng.head@helpdesk.com" },
    { $set: { userId: correctUser._id, status: "ACTIVE" } }
  );
  console.log("3. Updated employee:", upd.modifiedCount);
  
  // 4. Verify
  const emp = await empCol.findOne({ email: "eng.head@helpdesk.com" });
  console.log("\n=== VERIFICATION ===");
  console.log("User _id:", correctUser._id.toString());
  console.log("Employee userId:", emp.userId.toString());
  console.log("Match:", correctUser._id.toString() === emp.userId.toString() ? "✅ YES" : "❌ NO");
  
  await mongoose.connection.close();
  console.log("\n✅ Database fixed!");
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
