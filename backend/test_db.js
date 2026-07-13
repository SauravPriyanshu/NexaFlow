require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/modules/user/user.model');
const Organization = require('./src/modules/org/org.model');
const Project = require('./src/modules/project/project.model');
const Task = require('./src/modules/task/task.model');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const user = await User.findOne({ email: 'sauravpriyanshu21@gmail.com' });
  if (!user) {
    console.log('User not found');
    process.exit(0);
  }
  console.log('User ID:', user._id);

  const orgs = await Organization.find({ 'members.user': user._id });
  console.log(`User belongs to ${orgs.length} orgs`);

  for (const org of orgs) {
    const projects = await Project.find({ orgId: org._id });
    console.log(`Org ${org.name} has ${projects.length} projects`);
    
    for (const project of projects) {
      const tasks = await Task.find({ projectId: project._id });
      console.log(`  Project ${project.name} has ${tasks.length} tasks`);
    }
  }

  process.exit(0);
}

test().catch(console.error);
