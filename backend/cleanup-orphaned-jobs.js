// # backend/cleanup-orphaned-jobs.js
// Script to find and fix jobs with deleted locations

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const readline = require('readline');

// Load environment variables
dotenv.config();

// Create models
const jobSchema = new mongoose.Schema({
  title: String,
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  },
  // Other job fields not needed for this script
  user: mongoose.Schema.Types.ObjectId,
  organization: mongoose.Schema.Types.ObjectId
});

const locationSchema = new mongoose.Schema({
  name: String,
  // Other fields not needed for this script
});

const Job = mongoose.model('Job', jobSchema);
const Location = mongoose.model('Location', locationSchema);

// Create readline interface for interactive prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for confirmation
const confirm = (question) => new Promise((resolve) => {
  rl.question(`${question} (y/n): `, (answer) => {
    resolve(answer.toLowerCase() === 'y');
  });
});

// Function to list locations for selection
const selectLocation = async (locations) => {
  return new Promise((resolve) => {
    console.log('\nAvailable locations:');
    locations.forEach((loc, index) => {
      console.log(`${index + 1}. ${loc.name} (ID: ${loc._id})`);
    });
    console.log('0. Cancel');
    
    rl.question('\nSelect a location by number: ', (answer) => {
      const selection = parseInt(answer.trim());
      if (selection === 0) {
        resolve(null);
      } else if (selection > 0 && selection <= locations.length) {
        resolve(locations[selection - 1]._id);
      } else {
        console.log('Invalid selection. Please try again.');
        selectLocation(locations).then(resolve);
      }
    });
  });
};

// Main function
const main = async () => {
  try {
    // Connect to MongoDB
    console.log(`Connecting to MongoDB at ${process.env.MONGO_URI}...`);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Find all jobs
    const allJobs = await Job.find().populate('location');
    
    // Find jobs with null locations (where the referenced location doesn't exist)
    const orphanedJobs = allJobs.filter(job => !job.location);
    
    console.log(`\nFound ${orphanedJobs.length} jobs with missing locations out of ${allJobs.length} total jobs.`);
    
    if (orphanedJobs.length === 0) {
      console.log('No cleanup needed. All jobs have valid locations.');
      await mongoose.connection.close();
      rl.close();
      return;
    }
    
    // Display orphaned jobs
    console.log('\nThe following jobs have missing locations:');
    orphanedJobs.forEach((job, index) => {
      console.log(`${index + 1}. ID: ${job._id}, Title: ${job.title}`);
    });
    
    // Ask what to do
    const shouldDelete = await confirm('\nDo you want to DELETE these jobs?');
    
    if (shouldDelete) {
      // Delete all orphaned jobs
      const deleteIds = orphanedJobs.map(job => job._id);
      await Job.deleteMany({ _id: { $in: deleteIds } });
      console.log(`\nDeleted ${orphanedJobs.length} jobs with missing locations.`);
    } else {
      // Option to reassign
      const shouldReassign = await confirm('Do you want to REASSIGN these jobs to a different location?');
      
      if (shouldReassign) {
        // Get available locations
        const availableLocations = await Location.find();
        
        if (availableLocations.length === 0) {
          console.log('\nNo locations available. Please create a location first.');
        } else {
          // Let user select a location
          const newLocationId = await selectLocation(availableLocations);
          
          if (newLocationId) {
            // Update all orphaned jobs with the new location
            const updateIds = orphanedJobs.map(job => job._id);
            await Job.updateMany(
              { _id: { $in: updateIds } },
              { $set: { location: newLocationId } }
            );
            
            const selectedLocation = availableLocations.find(loc => loc._id.toString() === newLocationId.toString());
            console.log(`\nReassigned ${orphanedJobs.length} jobs to location: ${selectedLocation.name}`);
          } else {
            console.log('\nOperation cancelled.');
          }
        }
      } else {
        console.log('\nNo changes were made to the database.');
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    rl.close();
  }
};

// Run the script
main();