const jwt = require('jsonwebtoken');
const User = require('../../modules/user/user.model');
const Project = require('../../modules/project/project.model');

let ioInstance;

const initSocket = (io) => {
  ioInstance = io;

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Unauthorized: No token provided'));

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) return next(new Error('Unauthorized: User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Unauthorized: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    
    // Join personal room (for notifications)
    socket.join(`user:${userId}`);
    
    // Join project rooms user is member of
    const projects = await Project.find({ 'members.userId': userId });
    projects.forEach(project => {
      socket.join(`project:${project._id.toString()}`);
    });

    // Join org rooms user is member of (for dashboard stats)
    const Org = require('../../modules/org/org.model');
    const orgs = await Org.find({ 'members.userId': userId });
    orgs.forEach(org => {
      socket.join(`org:${org._id.toString()}`);
    });
    
    // Event: Rejoin rooms on reconnect
    socket.on('client:rejoin_rooms', async () => {
      const projects = await Project.find({ 'members.userId': userId });
      projects.forEach(project => {
        socket.join(`project:${project._id.toString()}`);
      });
      const orgs = await Org.find({ 'members.userId': userId });
      orgs.forEach(org => {
        socket.join(`org:${org._id.toString()}`);
      });
    });

    // Event: join a specific project room
    socket.on('join:project', async (projectId) => {
      try {
        const project = await Project.findById(projectId);
        if (project && project.members.some(m => m.userId.toString() === userId)) {
          socket.join(`project:${projectId}`);
        } else {
          socket.emit('error', { message: 'Unauthorized to join this project room' });
        }
      } catch (err) {
        socket.emit('error', { message: 'Failed to join project room' });
      }
    });
    
    // Event: leave a project room
    socket.on('leave:project', (projectId) => {
      socket.leave(`project:${projectId}`);
    });
    
    // Event: join a chat channel
    socket.on('join:channel', (channelId) => {
      socket.join(`channel:${channelId}`);
    });
    
    // Chat events
    socket.on('chat:typing', ({ channelId }) => {
      socket.to(`channel:${channelId}`).emit('chat:typing', {
        userId,
        userName: socket.user.name,
        channelId
      });
    });
    
    socket.on('chat:stop_typing', ({ channelId }) => {
      socket.to(`channel:${channelId}`).emit('chat:stop_typing', { userId, channelId });
    });
    
    socket.on('disconnect', () => {
      io.emit('user:offline', { userId });
    });
    
    // Broadcast online status
    io.emit('user:online', { userId });
  });
};

const getIO = () => {
  if (!ioInstance) throw new Error('Socket.io is not initialized');
  return ioInstance;
};

module.exports = { initSocket, getIO };
