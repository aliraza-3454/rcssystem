'use strict';
/**
 * RCS Seed Script — MS SQL Server Express
 * Run after the database tables are created via rcs_db_setup.sql
 *
 * Usage:  node seed.js
 */
const path   = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });
require('./src/models/index');

const { connectDB, sequelize } = require('./src/config/db');
const { User }                 = require('./src/models');

const accounts = [

  // ─────────────────────────────────────────
  //  ADMIN
  // ─────────────────────────────────────────
  {
    name:       'System Admin',
    email:      'admin@rcs.edu',
    password:   'password123',
    role:       'admin',
    department: 'Computer Science',
    expertise:  [],
    isActive:   true,
  },

  // ─────────────────────────────────────────
  //  SUPERVISORS — Add more below this line
  // ─────────────────────────────────────────
  {
    name:       'Dr. Rubina Ghazal',
    email:      'supervisor@rcs.edu',
    password:   'password123',
    role:       'supervisor',
    department: 'Computer Science',
    expertise:  ['Artificial Intelligence', 'Machine Learning', 'NLP'],
    isActive:   true,
  },
  {
    name:       'Dr. Ahmed Khan',
    email:      'ahmed.khan@rcs.edu',
    password:   'password123',
    role:       'supervisor',
    department: 'Computer Science',
    expertise:  ['Cybersecurity', 'Network Security', 'Blockchain'],
    isActive:   true,
  },
  {
    name:       'Dr. Fatima Malik',
    email:      'fatima.malik@rcs.edu',
    password:   'password123',
    role:       'supervisor',
    department: 'Software Engineering',
    expertise:  ['Web Development', 'Cloud Computing', 'DevOps'],
    isActive:   true,
  },
  {
    name:       'Dr. Usman Tariq',
    email:      'usman.tariq@rcs.edu',
    password:   'password123',
    role:       'supervisor',
    department: 'Computer Science',
    expertise:  ['Data Science', 'Deep Learning', 'Computer Vision'],
    isActive:   true,
  },
  {
    name:       'Dr. Sana Iqbal',
    email:      'sana.iqbal@rcs.edu',
    password:   'password123',
    role:       'supervisor',
    department: 'Information Technology',
    expertise:  ['Database Systems', 'Big Data', 'Data Mining'],
    isActive:   true,
  },

  // ─────────────────────────────────────────
  //  STUDENTS
  // ─────────────────────────────────────────
  {
    name:       'Abdul Aleem',
    email:      'student@rcs.edu',
    password:   'password123',
    role:       'student',
    regNo:      '22-ARID-588',
    department: 'Computer Science',
    expertise:  [],
    isActive:   true,
  },
  {
    name:       'Hifzu-ur-Rehman',
    email:      'hifzu@rcs.edu',
    password:   'password123',
    role:       'student',
    regNo:      '22-ARID-636',
    department: 'Computer Science',
    expertise:  [],
    isActive:   true,
  },
  {
    name:       'Ali Raza',
    email:      'ali@rcs.edu',
    password:   'password123',
    role:       'student',
    regNo:      '22-ARID-3082',
    department: 'Computer Science',
    expertise:  [],
    isActive:   true,
  },
];

async function seed() {
  console.log('\n🌱 RCS Seed Script Starting...\n');

  await connectDB();

  let created = 0;
  let skipped = 0;

  for (const acc of accounts) {
    try {
      const [user, wasCreated] = await User.findOrCreate({
        where:    { email: acc.email },
        defaults: acc,
      });
      if (wasCreated) {
        console.log('✅ Created  : [' + user.role.padEnd(10) + '] ' + user.email);
        created++;
      } else {
        console.log('⚠️  Exists  : [' + user.role.padEnd(10) + '] ' + user.email);
        skipped++;
      }
    } catch (err) {
      console.error('❌ Failed   : ' + acc.email + ' — ' + err.message);
    }
  }

  console.log('\n📊 Summary: ' + created + ' created, ' + skipped + ' already existed\n');

  console.log('┌──────────────────────────────────────────────────────────────┐');
  console.log('│                   DEMO LOGIN CREDENTIALS                    │');
  console.log('├──────────────┬─────────────────────────────┬────────────────┤');
  console.log('│ Role         │ Email                       │ Password       │');
  console.log('├──────────────┼─────────────────────────────┼────────────────┤');
  console.log('│ Admin        │ admin@rcs.edu               │ password123    │');
  console.log('│ Supervisor 1 │ supervisor@rcs.edu          │ password123    │');
  console.log('│ Supervisor 2 │ ahmed.khan@rcs.edu          │ password123    │');
  console.log('│ Supervisor 3 │ fatima.malik@rcs.edu        │ password123    │');
  console.log('│ Supervisor 4 │ usman.tariq@rcs.edu         │ password123    │');
  console.log('│ Supervisor 5 │ sana.iqbal@rcs.edu          │ password123    │');
  console.log('│ Student 1    │ student@rcs.edu             │ password123    │');
  console.log('│ Student 2    │ hifzu@rcs.edu               │ password123    │');
  console.log('│ Student 3    │ ali@rcs.edu                 │ password123    │');
  console.log('└──────────────┴─────────────────────────────┴────────────────┘\n');

  await sequelize.close();
  process.exit(0);
}

seed().catch(err => {
  console.error('\n❌ Seed failed:', err.message);
  process.exit(1);
});