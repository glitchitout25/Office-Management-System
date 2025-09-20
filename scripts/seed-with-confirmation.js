const readline = require('readline');
const seedDatabase = require('./seed');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🌱 MongoDB Database Seeder');
console.log('==========================');
console.log('');
console.log('This script will:');
console.log('• Clear all existing data from the database');
console.log('• Create 5 sample departments');
console.log('• Create 8 sample employees');
console.log('• Create 1 admin user');
console.log('• Set up department heads and supervisor relationships');
console.log('');
console.log('⚠️  WARNING: This will DELETE all existing data!');
console.log('');

rl.question('Are you sure you want to continue? (yes/no): ', async (answer) => {
  if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
    console.log('');
    console.log('Starting database seeding...');
    console.log('');
    
    try {
      await seedDatabase();
      console.log('');
      console.log('✅ Database seeding completed successfully!');
    } catch (error) {
      console.error('');
      console.error('❌ Database seeding failed:', error.message);
      process.exit(1);
    }
  } else {
    console.log('');
    console.log('❌ Seeding cancelled by user');
  }
  
  rl.close();
});
