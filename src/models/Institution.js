import mongoose from 'mongoose';

const InstitutionSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  type: { type: String, default: 'K12_ACADEMY' },
  status: { type: String, default: 'ACTIVE' },
  address: { type: String },
  phone: { type: String },
  email: { type: String },
  settingsJson: { type: String, default: '{}' }
}, { timestamps: true });

export const Institution = mongoose.models.Institution || mongoose.model('Institution', InstitutionSchema);
export default Institution;
