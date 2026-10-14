/**
 * WeDate Realistic Demonstration Seed Script
 * Populates database with fictional adult student profiles using authentic stock photography.
 * Seeds initial likes, reciprocal matches, chat messages, and notifications.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { connectDB, disconnectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Profile from '../src/models/Profile.js';
import Swipe from '../src/models/Swipe.js';
import Match from '../src/models/Match.js';
import Chat from '../src/models/Chat.js';
import Message from '../src/models/Message.js';
import Notification from '../src/models/Notification.js';
import Block from '../src/models/Block.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

const domain = process.env.ALLOWED_EMAIL_DOMAIN || 'campus.edu';

// 12 Fictional adult student demo profiles with genuine Unsplash portrait stock photography
const DEMO_USERS = [
  {
    email: `aarav.sharma@${domain}`,
    name: 'Aarav Sharma',
    dateOfBirth: new Date('2003-04-15'), // Age 23
    gender: 'Man',
    genderPreference: ['Woman', 'Everyone'],
    department: 'Computer Engineering',
    academicYear: 'Final Year (BE)',
    bio: 'Building indie software, passionate about machine learning and open source. On weekends you will find me cafe hopping in Bandra with a notebook or playing acoustic fingerstyle guitar.',
    interests: ['Coding', 'AI & Machine Learning', 'Music', 'Design'],
    hobbies: ['Cafe Hopping', 'Guitar / Jamming', 'Reading', 'Trekking & Hiking'],
    relationshipGoals: ['Long-term relationship'],
    height: 178,
    languages: ['English', 'Hindi', 'Marathi'],
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        caption: 'Coffee walk around old town'
      },
      {
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
        isPrimary: false,
        caption: 'Campus hackathon finals'
      }
    ]
  },
  {
    email: `ananya.deshmukh@${domain}`,
    name: 'Ananya Deshmukh',
    dateOfBirth: new Date('2004-08-22'), // Age 22
    gender: 'Woman',
    genderPreference: ['Man', 'Everyone'],
    department: 'Information Technology',
    academicYear: 'Third Year (TE)',
    bio: 'UI designer and tech enthusiast. I enjoy film photography, analog synthesizers, contemporary architecture, and finding peaceful reading spots between lectures.',
    interests: ['Design', 'Film & Cinema', 'Photography', 'Literature'],
    hobbies: ['Cafe Hopping', 'Museums & Galleries', 'Reading', 'Trekking & Hiking'],
    relationshipGoals: ['Long-term relationship', 'Open to exploring'],
    height: 165,
    languages: ['English', 'Marathi', 'Hindi'],
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        caption: 'Sunlit afternoon at the library'
      },
      {
        url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
        isPrimary: false,
        caption: 'Art gallery exhibit'
      }
    ]
  },
  {
    email: `rohan.mehta@${domain}`,
    name: 'Rohan Mehta',
    dateOfBirth: new Date('2003-11-10'), // Age 22
    gender: 'Man',
    genderPreference: ['Woman', 'Everyone'],
    department: 'Data Science',
    academicYear: 'Third Year (TE)',
    bio: 'Data science student who loves marathon training, specialty coffee, and late night discussions on sci-fi novels and philosophy.',
    interests: ['Coding', 'Philosophy', 'Debating', 'AI & Machine Learning'],
    hobbies: ['Fitness & Gym', 'Reading', 'Cafe Hopping', 'Podcasts'],
    relationshipGoals: ['Long-term relationship'],
    height: 182,
    languages: ['English', 'Hindi', 'Gujarati'],
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        caption: 'Morning jog before classes'
      }
    ]
  },
  {
    email: `diya.kulkarni@${domain}`,
    name: 'Diya Kulkarni',
    dateOfBirth: new Date('2005-02-14'), // Age 21
    gender: 'Woman',
    genderPreference: ['Man', 'Everyone'],
    department: 'Electronics & Telecom',
    academicYear: 'Second Year (SE)',
    bio: 'IoT hardware hobbyist and indie music fan. Big fan of street food trails, badminton matches after college, and quiet weekend cooking sessions.',
    interests: ['Robotics', 'Music', 'Design', 'Coding'],
    hobbies: ['Badminton', 'Cooking & Baking', 'Guitar / Jamming', 'Gaming'],
    relationshipGoals: ['Short-term relationship', 'Casual dating'],
    height: 162,
    languages: ['English', 'Marathi', 'Hindi'],
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        caption: 'Campus festival moments'
      }
    ]
  },
  {
    email: `kabir.verma@${domain}`,
    name: 'Kabir Verma',
    dateOfBirth: new Date('2002-09-05'), // Age 24
    gender: 'Man',
    genderPreference: ['Woman', 'Everyone'],
    department: 'Artificial Intelligence',
    academicYear: 'Postgraduate (PG)',
    bio: 'Researching neural networks by day, amateur landscape photographer by night. Always down for exploring secluded forts in the Western Ghats.',
    interests: ['AI & Machine Learning', 'Photography', 'Philosophy', 'Film & Cinema'],
    hobbies: ['Trekking & Hiking', 'Podcasts', 'Museums & Galleries', 'Reading'],
    relationshipGoals: ['Long-term relationship', 'Friendship & Study partner'],
    height: 175,
    languages: ['English', 'Hindi'],
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        caption: 'Sunrise hike in Sahyadris'
      }
    ]
  },
  {
    email: `priya.iyer@${domain}`,
    name: 'Priya Iyer',
    dateOfBirth: new Date('2004-01-30'), // Age 22
    gender: 'Woman',
    genderPreference: ['Man', 'Everyone'],
    department: 'Computer Engineering',
    academicYear: 'Final Year (BE)',
    bio: 'Full-stack developer, classical dancer, and board games aficionado. Looking for genuine conversations, shared humor, and someone to explore hidden bookshops with.',
    interests: ['Coding', 'Theatre', 'Literature', 'Music'],
    hobbies: ['Reading', 'Cafe Hopping', 'Badminton', 'Cooking & Baking'],
    relationshipGoals: ['Long-term relationship'],
    height: 168,
    languages: ['English', 'Hindi', 'Tamil', 'Marathi'],
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        caption: 'At our annual department drama fest'
      }
    ]
  },
  {
    email: `tanmay.patil@${domain}`,
    name: 'Tanmay Patil',
    dateOfBirth: new Date('2003-07-19'), // Age 23
    gender: 'Man',
    genderPreference: ['Woman', 'Everyone'],
    department: 'Information Technology',
    academicYear: 'Third Year (TE)',
    bio: 'Cloud architecture enthusiast, PC gamer, and gym regular. Always up for a quick chai break or a late-night debate on sci-fi films.',
    interests: ['Coding', 'Film & Cinema', 'Debating', 'Design'],
    hobbies: ['Gaming', 'Fitness & Gym', 'Cafe Hopping', 'Podcasts'],
    relationshipGoals: ['Open to exploring'],
    height: 180,
    languages: ['English', 'Marathi', 'Hindi'],
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        caption: 'Post workout chai with friends'
      }
    ]
  },
  {
    email: `meera.nair@${domain}`,
    name: 'Meera Nair',
    dateOfBirth: new Date('2004-06-11'), // Age 22
    gender: 'Woman',
    genderPreference: ['Man', 'Everyone'],
    department: 'Biomedical',
    academicYear: 'Third Year (TE)',
    bio: 'Bioengineering researcher with a passion for psychology and indie cinema. Love weekend pottery workshops, acoustic concerts, and exploring seaside promenades.',
    interests: ['Philosophy', 'Literature', 'Film & Cinema', 'Design'],
    hobbies: ['Museums & Galleries', 'Trekking & Hiking', 'Guitar / Jamming', 'Reading'],
    relationshipGoals: ['Long-term relationship'],
    height: 160,
    languages: ['English', 'Hindi', 'Malayalam'],
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        caption: 'Weekend workshop at the seaside'
      }
    ]
  },
  {
    email: `aditya.joshi@${domain}`,
    name: 'Aditya Joshi',
    dateOfBirth: new Date('2005-05-03'), // Age 21
    gender: 'Man',
    genderPreference: ['Woman', 'Everyone'],
    department: 'Computer Engineering',
    academicYear: 'Second Year (SE)',
    bio: 'Competitive programmer and rhythm guitarist. Looking for a study buddy and someone who appreciates good filter coffee and spontaneous campus road trips.',
    interests: ['Coding', 'Music', 'Robotics'],
    hobbies: ['Guitar / Jamming', 'Badminton', 'Cafe Hopping', 'Gaming'],
    relationshipGoals: ['Friendship & Study partner', 'Open to exploring'],
    height: 176,
    languages: ['English', 'Marathi', 'Hindi'],
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        caption: 'Jam session at the student center'
      }
    ]
  },
  {
    email: `isha.singh@${domain}`,
    name: 'Isha Singh',
    dateOfBirth: new Date('2003-12-28'), // Age 22
    gender: 'Woman',
    genderPreference: ['Man', 'Everyone'],
    department: 'Management Studies',
    academicYear: 'Final Year (BE)',
    bio: 'President of the campus debate society. Passionate about product management, espresso, and rooftop stargazing. Love honest conversations and thoughtful debate.',
    interests: ['Debating', 'Philosophy', 'Literature', 'Design'],
    hobbies: ['Reading', 'Fitness & Gym', 'Podcasts', 'Cafe Hopping'],
    relationshipGoals: ['Long-term relationship', 'Open to exploring'],
    height: 170,
    languages: ['English', 'Hindi', 'Punjabi'],
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        caption: 'Inter-university debate tournament'
      }
    ]
  },
  {
    email: `siddharth.rao@${domain}`,
    name: 'Siddharth Rao',
    dateOfBirth: new Date('2004-10-14'), // Age 22
    gender: 'Man',
    genderPreference: ['Woman', 'Everyone'],
    department: 'Electronics & Telecom',
    academicYear: 'Third Year (TE)',
    bio: 'Drones, embedded systems, and marathon cycling. Looking for someone genuine to share laughter, campus chai, and adventurous bike rides.',
    interests: ['Robotics', 'Coding', 'Photography'],
    hobbies: ['Fitness & Gym', 'Trekking & Hiking', 'Gaming', 'Cooking & Baking'],
    relationshipGoals: ['Long-term relationship'],
    height: 181,
    languages: ['English', 'Hindi', 'Kannada'],
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        caption: 'Weekend cycling along the coastline'
      }
    ]
  },
  {
    email: `zoya.khan@${domain}`,
    name: 'Zoya Khan',
    dateOfBirth: new Date('2005-09-02'), // Age 21
    gender: 'Woman',
    genderPreference: ['Man', 'Everyone'],
    department: 'Artificial Intelligence',
    academicYear: 'Second Year (SE)',
    bio: 'Fascinated by computer vision and cinematography. I spend my free time sketching storyboards, baking sourdough, and playing vintage arcade games.',
    interests: ['AI & Machine Learning', 'Film & Cinema', 'Design', 'Coding'],
    hobbies: ['Cooking & Baking', 'Gaming', 'Museums & Galleries', 'Reading'],
    relationshipGoals: ['Casual dating', 'Open to exploring'],
    height: 164,
    languages: ['English', 'Hindi', 'Urdu'],
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        caption: 'Cinema society screening night'
      }
    ]
  }
];

const seedDatabase = async (shouldDisconnect = true) => {
  console.log('[Seed] Starting WeDate database seeding...');
  await connectDB();

  // Clear existing demonstration data
  console.log('[Seed] Clearing previous collections...');
  await User.deleteMany({});
  await Profile.deleteMany({});
  await Swipe.deleteMany({});
  await Match.deleteMany({});
  await Chat.deleteMany({});
  await Message.deleteMany({});
  await Notification.deleteMany({});
  await Block.deleteMany({});

  const defaultPassword = 'WeDatePass123!';
  const createdUsers = [];
  const createdProfiles = [];

  console.log(`[Seed] Creating ${DEMO_USERS.length} student profiles...`);
  for (const userData of DEMO_USERS) {
    const user = new User({
      email: userData.email,
      password: defaultPassword,
      isVerified: true,
      status: 'active'
    });
    await user.save();
    createdUsers.push(user);

    const profile = new Profile({
      user: user._id,
      name: userData.name,
      dateOfBirth: userData.dateOfBirth,
      gender: userData.gender,
      genderPreference: userData.genderPreference,
      department: userData.department,
      academicYear: userData.academicYear,
      bio: userData.bio,
      interests: userData.interests,
      hobbies: userData.hobbies,
      relationshipGoals: userData.relationshipGoals,
      height: userData.height,
      languages: userData.languages,
      photos: userData.photos,
      isVisible: true,
      isCompleted: true
    });
    await profile.save();
    createdProfiles.push(profile);
  }

  console.log('[Seed] User accounts & profiles created successfully.');

  // Create reciprocal likes & mutual match between Aarav Sharma (index 0) and Ananya Deshmukh (index 1)
  const aarav = createdUsers[0];
  const ananya = createdUsers[1];

  console.log('[Seed] Creating mutual match between Aarav & Ananya...');
  await Swipe.create([
    { actor: aarav._id, target: ananya._id, action: 'like' },
    { actor: ananya._id, target: aarav._id, action: 'like' }
  ]);

  const pairKey = [aarav._id.toString(), ananya._id.toString()].sort().join('_');
  const match1 = new Match({
    users: [aarav._id, ananya._id],
    pairKey,
    isActive: true
  });
  await match1.save();

  const chat1 = new Chat({
    match: match1._id,
    participants: [aarav._id, ananya._id],
    lastMessage: {
      text: 'Hey Ananya! Loved your photo from the old town coffee walk.',
      sender: aarav._id,
      createdAt: new Date(Date.now() - 15 * 60 * 1000)
    }
  });
  await chat1.save();

  // Seed realistic conversation messages
  await Message.create([
    {
      chat: chat1._id,
      match: match1._id,
      sender: aarav._id,
      recipient: ananya._id,
      content: 'Hey Ananya! Nice to connect with another IT/tech enthusiast here.',
      messageType: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      chat: chat1._id,
      match: match1._id,
      sender: ananya._id,
      recipient: aarav._id,
      content: 'Hey Aarav! Same here! I saw you are into acoustic guitar and cafe hopping too. Any favorite spots around the campus area?',
      messageType: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 60 * 60 * 1000)
    },
    {
      chat: chat1._id,
      match: match1._id,
      sender: aarav._id,
      recipient: ananya._id,
      content: 'Definitely! There is a quiet roastery just 10 mins away from the campus library with great cold brews and courtyard seating. We should check it out sometime this week!',
      messageType: 'text',
      isRead: false,
      createdAt: new Date(Date.now() - 15 * 60 * 1000)
    }
  ]);

  // Notifications
  await Notification.create([
    {
      recipient: aarav._id,
      sender: ananya._id,
      type: 'match',
      title: 'New Mutual Match!',
      message: 'You and Ananya Deshmukh liked each other! Start the conversation.',
      data: { matchId: match1._id, chatId: chat1._id }
    },
    {
      recipient: ananya._id,
      sender: aarav._id,
      type: 'match',
      title: 'New Mutual Match!',
      message: 'You and Aarav Sharma liked each other! Start the conversation.',
      data: { matchId: match1._id, chatId: chat1._id }
    }
  ]);

  // Also create a second match: Rohan Mehta (index 2) and Priya Iyer (index 5)
  const rohan = createdUsers[2];
  const priya = createdUsers[5];
  console.log('[Seed] Creating mutual match between Rohan & Priya...');
  await Swipe.create([
    { actor: rohan._id, target: priya._id, action: 'like' },
    { actor: priya._id, target: rohan._id, action: 'like' }
  ]);

  const pairKey2 = [rohan._id.toString(), priya._id.toString()].sort().join('_');
  const match2 = new Match({
    users: [rohan._id, priya._id],
    pairKey: pairKey2,
    isActive: true
  });
  await match2.save();

  const chat2 = new Chat({
    match: match2._id,
    participants: [rohan._id, priya._id],
    lastMessage: {
      text: 'Hi Priya! Always great to meet another classical literature reader.',
      sender: rohan._id,
      createdAt: new Date(Date.now() - 30 * 60 * 1000)
    }
  });
  await chat2.save();

  await Message.create({
    chat: chat2._id,
    match: match2._id,
    sender: rohan._id,
    recipient: priya._id,
    content: 'Hi Priya! Always great to meet another classical literature reader on campus.',
    messageType: 'text',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000)
  });

  // Seed some one-sided likes (e.g. Diya likes Aarav, Kabir likes Ananya)
  await Swipe.create([
    { actor: createdUsers[3]._id, target: aarav._id, action: 'like' },
    { actor: createdUsers[4]._id, target: ananya._id, action: 'like' }
  ]);

  console.log(`\n======================================================`);
  console.log(`✅ WeDate Database Seeded Successfully!`);
  console.log(`👥 Total Accounts: ${createdUsers.length}`);
  console.log(`❤️  Mutual Matches: 2`);
  console.log(`💬 Chats & Persistent Messages: Active`);
  console.log(`🔑 Demo User Login: ${aarav.email}`);
  console.log(`🔑 Demo User Password: ${defaultPassword}`);
  console.log(`======================================================\n`);

  if (shouldDisconnect) {
    await disconnectDB();
  }
};

export { seedDatabase };

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase(true).catch((err) => {
    console.error('[Seed Error]', err);
    process.exit(1);
  });
}

