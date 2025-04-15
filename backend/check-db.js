// # backend/check-db.js
// Simple script to check the MongoDB database contents

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Job model (simplified version)
const JobSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  startTime: Date,
  endTime: Date,
  duration: Number,
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  },
  tags: [String],
  notes: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: Date,
  updatedAt: Date
});

const Job = mongoose.model('Job', JobSchema);

// Connect to the database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');

  try {
    // Find all jobs
    const jobs = await Job.find({});
    console.log('All jobs in database:');
    
    jobs.forEach(job => {
      console.log(`\nJob ID: ${job._id}`);
      console.log(`Title: ${job.title}`);
      console.log(`Duration (minutes): ${job.duration}`);
      console.log(`User: ${job.user}`);
      console.log(`Location: ${job.location}`);
      console.log(`Created: ${job.createdAt}`);
    });

    // Calculate total hours using aggregation
    const totalHoursResult = await Job.aggregate([
      { $group: { _id: null, totalMinutes: { $sum: '$duration' } } }
    ]);
    
    console.log('\nAggregation result:');
    console.log(totalHoursResult);
    
    if (totalHoursResult.length > 0) {
      const totalHours = totalHoursResult[0].totalMinutes / 60;
      console.log(`Total hours calculated: ${totalHours.toFixed(1)}`);
    } else {
      console.log('No hours calculated from aggregation');
    }
    
  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    // Close the connection
    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
})
.catch(err => {
  console.error('Error connecting to MongoDB:', err);
});