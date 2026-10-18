import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  settings: {
    language: { type: String, enum: ["javascript", "python", "java", "cpp"], default: "javascript" },
    fontSize: { type: Number, min: 10, max: 28, default: 14 },
    theme: { type: String, enum: ["dark", "light"], default: "dark" },
  },
}, { timestamps: true });
export default mongoose.models.User || mongoose.model("User", UserSchema);
