import bcrypt from 'bcryptjs';
import { connectMongo } from '../src/config/mongo.js';
import { User } from '../src/models/User.js';
import mongoose from 'mongoose';

async function ensureUsers() {
  await connectMongo();

  const defaultPassword = 'CampusNoa@2026!';
  const passwordHash = await bcrypt.hash(defaultPassword, 12);

  const personas = [
    {
      email: 'viceprincipal@campusnoa.edu',
      fullName: 'Dr. K. Radhakrishnan',
      roleCode: 'VICE_PRINCIPAL',
      institutionId: 'INST-001',
      phone: '+91 98221 00003'
    },
    {
      email: 'vp@school.edu',
      fullName: 'Dr. K. Radhakrishnan',
      roleCode: 'VICE_PRINCIPAL',
      institutionId: 'INST-001',
      phone: '+91 98221 00003'
    },
    {
      email: 'hod@campusnoa.edu',
      fullName: 'Prof. Yash Pal',
      roleCode: 'HOD',
      institutionId: 'INST-001',
      phone: '+91 98221 00004'
    },
    {
      email: 'hod.science@school.edu',
      fullName: 'Prof. Yash Pal',
      roleCode: 'HOD',
      institutionId: 'INST-001',
      phone: '+91 98221 00004'
    },
    {
      email: 'student@campusnoa.edu',
      fullName: 'Aryan Kapoor',
      roleCode: 'STUDENT',
      institutionId: 'INST-001',
      phone: '+91 98220 55667'
    },
    {
      email: 'teen.student@school.edu',
      fullName: 'Aryan Kapoor',
      roleCode: 'STUDENT',
      institutionId: 'INST-001',
      phone: '+91 98220 55667'
    }
  ];

  for (const p of personas) {
    const existing = await User.findOne({ email: p.email });
    if (!existing) {
      await User.create({
        ...p,
        passwordHash,
        status: 'ACTIVE',
        auth0Sub: `auth0|${p.email.replace(/[@.]/g, '_')}`
      });
      console.log(`✅ Provisioned missing persona user: ${p.email} (${p.roleCode})`);
    } else {
      console.log(`ℹ️ Persona user already exists: ${p.email} (${p.roleCode})`);
    }
  }

  await mongoose.disconnect();
  console.log('🎉 Persona provisioning complete.');
}

ensureUsers().catch(err => {
  console.error('Error provisioning personas:', err);
  process.exit(1);
});
