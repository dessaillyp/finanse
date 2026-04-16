/**
 * Seed script — populates the DB with sample data for local development.
 * Run with: node src/config/seeds.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Income  = require('../models/Income');
const Expense = require('../models/Expense');

const incomeData = [
  { amount: 55000, description: 'Salario mensual',     source: 'salary',     date: new Date('2026-04-01') },
  { amount: 12000, description: 'Proyecto freelance',  source: 'freelance',  date: new Date('2026-04-10') },
  { amount: 8000,  description: 'Dividendos ETF',      source: 'investment', date: new Date('2026-04-15') },
];

const expenseData = [
  { amount: 18000, description: 'Renta departamento',  category: 'housing',       date: new Date('2026-04-01') },
  { amount: 5500,  description: 'Súper semanal x4',    category: 'food',          date: new Date('2026-04-07') },
  { amount: 2200,  description: 'Gasolina + UBER',      category: 'transport',     date: new Date('2026-04-05') },
  { amount: 1800,  description: 'Gym + farmacia',       category: 'health',        date: new Date('2026-04-12') },
  { amount: 3200,  description: 'Concierto + Netflix',  category: 'entertainment', date: new Date('2026-04-20') },
  { amount: 1200,  description: 'Curso de inglés',      category: 'education',     date: new Date('2026-04-08') },
  { amount: 900,   description: 'Luz + internet',       category: 'utilities',     date: new Date('2026-04-03'), isRecurring: true },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finance_db');
  console.log('Connected to DB');

  await Income.deleteMany({});
  await Expense.deleteMany({});
  console.log('Cleared existing data');

  await Income.insertMany(incomeData);
  await Expense.insertMany(expenseData);
  console.log(`Seeded ${incomeData.length} income records and ${expenseData.length} expenses`);

  await mongoose.disconnect();
  console.log('Done');
};

seed().catch((err) => { console.error(err); process.exit(1); });
