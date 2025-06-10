import pool from '../lib/db'
import bcrypt from 'bcryptjs'

// Sample data for seeding
const sampleUsers = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    gender: 'female',
    birthdate: '1995-03-15',
    location: 'New York, NY',
    subscription_type: 'premium',
    is_verified: true,
    bio: 'Love hiking, coffee, and good conversations. Looking for someone genuine!',
    interests: ['hiking', 'coffee', 'travel', 'photography']
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    gender: 'male',
    birthdate: '1992-07-22',
    location: 'San Francisco, CA',
    subscription_type: 'premium_plus',
    is_verified: true,
    bio: 'Tech enthusiast, foodie, and weekend adventurer. Let\'s explore the city together!',
    interests: ['technology', 'food', 'music', 'fitness']
  },
  {
    name: 'Emma Wilson',
    email: 'emma.wilson@example.com',
    gender: 'female',
    birthdate: '1998-11-08',
    location: 'Los Angeles, CA',
    subscription_type: 'free',
    is_verified: false,
    bio: 'Artist and dreamer. Love painting, yoga, and sunset walks on the beach.',
    interests: ['art', 'yoga', 'beach', 'meditation']
  },
  {
    name: 'David Rodriguez',
    email: 'david.rodriguez@example.com',
    gender: 'male',
    birthdate: '1990-05-12',
    location: 'Miami, FL',
    subscription_type: 'premium',
    is_verified: true,
    bio: 'Fitness trainer and salsa dancer. Looking for someone who loves to stay active!',
    interests: ['fitness', 'dancing', 'sports', 'health']
  },
  {
    name: 'Jessica Taylor',
    email: 'jessica.taylor@example.com',
    gender: 'female',
    birthdate: '1994-09-30',
    location: 'Chicago, IL',
    subscription_type: 'free',
    is_verified: true,
    bio: 'Book lover, wine enthusiast, and travel blogger. Always planning my next adventure!',
    interests: ['books', 'wine', 'travel', 'writing']
  },
  {
    name: 'Alex Thompson',
    email: 'alex.thompson@example.com',
    gender: 'male',
    birthdate: '1996-01-18',
    location: 'Seattle, WA',
    subscription_type: 'premium',
    is_verified: false,
    bio: 'Software developer and gaming enthusiast. Love board games and craft beer!',
    interests: ['gaming', 'technology', 'beer', 'board games']
  },
  {
    name: 'Olivia Martinez',
    email: 'olivia.martinez@example.com',
    gender: 'female',
    birthdate: '1993-12-05',
    location: 'Austin, TX',
    subscription_type: 'premium_plus',
    is_verified: true,
    bio: 'Music producer and festival lover. Let\'s discover new bands together!',
    interests: ['music', 'festivals', 'concerts', 'creativity']
  },
  {
    name: 'Ryan Davis',
    email: 'ryan.davis@example.com',
    gender: 'male',
    birthdate: '1991-08-14',
    location: 'Denver, CO',
    subscription_type: 'free',
    is_verified: false,
    bio: 'Outdoor enthusiast and photographer. Love camping, skiing, and mountain biking.',
    interests: ['outdoors', 'photography', 'skiing', 'camping']
  },
  {
    name: 'Sophia Lee',
    email: 'sophia.lee@example.com',
    gender: 'female',
    birthdate: '1997-04-27',
    location: 'Boston, MA',
    subscription_type: 'premium',
    is_verified: true,
    bio: 'Medical student and volunteer. Passionate about helping others and making a difference.',
    interests: ['medicine', 'volunteering', 'science', 'helping others']
  },
  {
    name: 'James Anderson',
    email: 'james.anderson@example.com',
    gender: 'male',
    birthdate: '1989-10-03',
    location: 'Portland, OR',
    subscription_type: 'free',
    is_verified: true,
    bio: 'Chef and food blogger. Love cooking, trying new restaurants, and farmers markets.',
    interests: ['cooking', 'food', 'restaurants', 'farmers markets']
  }
]

const sampleTestimonials = [
  {
    title: 'Found My Soulmate!',
    story: 'I met my amazing partner on MingleFinder after just 2 weeks! We connected over our shared love of hiking and have been inseparable ever since. Thank you for bringing us together!',
    is_approved: true,
    is_featured: true
  },
  {
    title: 'Great Experience',
    story: 'The app is so easy to use and I love the matching algorithm. I\'ve met several interesting people and made some great friends. Highly recommend!',
    is_approved: true,
    is_featured: false
  },
  {
    title: 'Perfect Match',
    story: 'After trying many dating apps, MingleFinder was the one that actually worked! The quality of matches is so much better than other apps.',
    is_approved: false,
    is_featured: false
  },
  {
    title: 'Love Story',
    story: 'We\'re getting married next month! Met on MingleFinder 8 months ago and knew immediately we were meant for each other. Best app ever!',
    is_approved: true,
    is_featured: true
  }
]

async function seedDatabase() {
  console.log('🌱 Starting database seeding...')
  
  try {
    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 12)
    
    console.log('👥 Seeding users...')
    
    // Insert users (skip if already exists)
    for (const user of sampleUsers) {
      // Check if user already exists
      const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [user.email])

      let userId
      if (existingUser.rows.length > 0) {
        userId = existingUser.rows[0].id
        console.log(`⏭️  User already exists: ${user.name} (${user.email})`)
      } else {
        const userResult = await pool.query(`
          INSERT INTO users (name, email, password_hash, gender, birthdate, location, subscription_type, is_verified, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())
          RETURNING id
        `, [
          user.name,
          user.email,
          hashedPassword,
          user.gender,
          user.birthdate,
          user.location,
          user.subscription_type,
          user.is_verified
        ])

        userId = userResult.rows[0].id
        console.log(`✅ Created user: ${user.name} (${user.email})`)
      }

      // Create profile for user (skip if already exists)
      const existingProfile = await pool.query('SELECT id FROM profiles WHERE user_id = $1', [userId])

      if (existingProfile.rows.length === 0) {
        const nameParts = user.name.split(' ')
        const firstName = nameParts[0]
        const lastName = nameParts.slice(1).join(' ') || ''

        await pool.query(`
          INSERT INTO profiles (user_id, first_name, last_name, gender, birth_date, bio, interests, age, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        `, [
          userId,
          firstName,
          lastName,
          user.gender,
          user.birthdate,
          user.bio,
          user.interests,
          new Date().getFullYear() - new Date(user.birthdate).getFullYear()
        ])

        console.log(`✅ Created profile for: ${user.name}`)
      } else {
        console.log(`⏭️  Profile already exists for: ${user.name}`)
      }

      // Create user preferences (skip if already exists)
      const existingPrefs = await pool.query('SELECT id FROM user_preferences WHERE user_id = $1', [userId])

      if (existingPrefs.rows.length === 0) {
        await pool.query(`
          INSERT INTO user_preferences (user_id, created_at, updated_at)
          VALUES ($1, NOW(), NOW())
        `, [userId])

        console.log(`✅ Created preferences for: ${user.name}`)
      } else {
        console.log(`⏭️  Preferences already exist for: ${user.name}`)
      }
    }
    
    console.log('📝 Seeding testimonials...')
    
    // Get some user IDs for testimonials
    const userIds = await pool.query('SELECT id FROM users WHERE email != $1 LIMIT 4', ['admin@minglefinder.com'])
    
    // Insert testimonials
    for (let i = 0; i < sampleTestimonials.length; i++) {
      const testimonial = sampleTestimonials[i]
      const userId = userIds.rows[i]?.id
      
      if (userId) {
        await pool.query(`
          INSERT INTO testimonials (user_id, title, story, is_approved, is_featured, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        `, [
          userId,
          testimonial.title,
          testimonial.story,
          testimonial.is_approved,
          testimonial.is_featured
        ])
        
        console.log(`✅ Created testimonial: ${testimonial.title}`)
      }
    }
    
    console.log('💕 Seeding matches and swipes...')

    // Get all user IDs (excluding admin)
    const allUsers = await pool.query('SELECT id FROM users WHERE email != $1', ['admin@minglefinder.com'])
    const userIdList = allUsers.rows.map(row => row.id)

    // Create some swipes and matches
    let matchCount = 0
    let swipeCount = 0

    for (let i = 0; i < userIdList.length; i++) {
      for (let j = i + 1; j < userIdList.length; j++) {
        const user1 = userIdList[i]
        const user2 = userIdList[j]

        // 30% chance of mutual like (match)
        if (Math.random() < 0.3) {
          // Both users like each other
          await pool.query(`
            INSERT INTO swipes (swiper_id, swiped_id, is_like, created_at)
            VALUES ($1, $2, true, NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days')
          `, [user1, user2])

          await pool.query(`
            INSERT INTO swipes (swiper_id, swiped_id, is_like, created_at)
            VALUES ($1, $2, true, NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days')
          `, [user2, user1])

          // Create match
          await pool.query(`
            INSERT INTO matches (user1_id, user2_id, created_at)
            VALUES ($1, $2, NOW() - INTERVAL '${Math.floor(Math.random() * 25)} days')
          `, [user1, user2])

          matchCount++
          swipeCount += 2
        } else if (Math.random() < 0.6) {
          // One-sided like
          await pool.query(`
            INSERT INTO swipes (swiper_id, swiped_id, is_like, created_at)
            VALUES ($1, $2, true, NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days')
          `, [user1, user2])

          swipeCount++
        }
      }
    }

    console.log(`✅ Created ${matchCount} matches and ${swipeCount} swipes`)

    console.log('💬 Seeding messages...')

    // Get some matches to create messages for
    const matches = await pool.query('SELECT user1_id, user2_id FROM matches LIMIT 5')
    let messageCount = 0

    const sampleMessages = [
      "Hey! How's your day going?",
      "I love your profile! We have so much in common.",
      "Would you like to grab coffee sometime?",
      "That photo from your hiking trip is amazing!",
      "Thanks for the match! Looking forward to chatting.",
      "What's your favorite restaurant in the city?",
      "I see you're into photography too! What's your favorite subject?",
      "Hope you're having a great week!"
    ]

    for (const match of matches.rows) {
      const users = [match.user1_id, match.user2_id]

      // Create 3-8 messages between matched users
      const numMessages = Math.floor(Math.random() * 6) + 3

      for (let i = 0; i < numMessages; i++) {
        const senderId = users[i % 2] // Alternate between users
        const receiverId = users[(i + 1) % 2]
        const message = sampleMessages[Math.floor(Math.random() * sampleMessages.length)]

        // Find the match_id for these users
        const matchResult = await pool.query(`
          SELECT id FROM matches
          WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)
        `, [match.user1_id, match.user2_id])

        if (matchResult.rows.length > 0) {
          const matchId = matchResult.rows[0].id

          await pool.query(`
            INSERT INTO messages (match_id, sender_id, content, created_at)
            VALUES ($1, $2, $3, NOW() - INTERVAL '${Math.floor(Math.random() * 20)} days')
          `, [matchId, senderId, message])
        }

        messageCount++
      }
    }

    console.log(`✅ Created ${messageCount} messages`)

    console.log('🚨 Seeding reports...')

    // Create some sample reports
    const reportReasons = [
      'Inappropriate photos in profile',
      'Sending harassing messages',
      'Profile seems fake with stolen photos',
      'Sending spam messages with external links',
      'Inappropriate behavior during conversation',
      'Fake profile using someone else\'s photos'
    ]

    let reportCount = 0

    for (let i = 0; i < 6; i++) {
      const reporterIndex = Math.floor(Math.random() * userIdList.length)
      let reportedIndex = Math.floor(Math.random() * userIdList.length)

      // Make sure reporter and reported are different
      while (reportedIndex === reporterIndex) {
        reportedIndex = Math.floor(Math.random() * userIdList.length)
      }

      const reason = reportReasons[Math.floor(Math.random() * reportReasons.length)]
      const status = Math.random() < 0.3 ? 'resolved' : 'pending'
      const priority = Math.floor(Math.random() * 3) + 1 // 1-3 priority

      await pool.query(`
        INSERT INTO reports (reporter_id, reported_id, reason, status, priority, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '${Math.floor(Math.random() * 15)} days')
      `, [userIdList[reporterIndex], userIdList[reportedIndex], reason, status, priority])

      reportCount++
    }

    console.log(`✅ Created ${reportCount} reports`)

    console.log('🔔 Seeding notifications...')

    // Create some notifications
    const notificationTypes = ['new_match', 'new_message', 'profile_view', 'like_received']
    const notificationContents = [
      'You have a new match! Start chatting now.',
      'You received a new message.',
      'Someone viewed your profile.',
      'Someone liked your profile!'
    ]

    let notificationCount = 0

    for (let i = 0; i < 20; i++) {
      const userIndex = Math.floor(Math.random() * userIdList.length)
      const notificationType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
      const content = notificationContents[Math.floor(Math.random() * notificationContents.length)]
      const isRead = Math.random() < 0.4 // 40% chance of being read

      await pool.query(`
        INSERT INTO notifications (user_id, type, content, is_read, created_at)
        VALUES ($1, $2, $3, $4, NOW() - INTERVAL '${Math.floor(Math.random() * 10)} days')
      `, [userIdList[userIndex], notificationType, content, isRead])

      notificationCount++
    }

    console.log(`✅ Created ${notificationCount} notifications`)

    console.log('🎉 Database seeding completed successfully!')
    console.log(`📊 Summary:`)
    console.log(`   - ${sampleUsers.length} users created`)
    console.log(`   - ${sampleUsers.length} profiles created`)
    console.log(`   - ${sampleTestimonials.length} testimonials created`)
    console.log(`   - ${matchCount} matches created`)
    console.log(`   - ${swipeCount} swipes created`)
    console.log(`   - ${messageCount} messages created`)
    console.log(`   - ${reportCount} reports created`)
    console.log(`   - ${notificationCount} notifications created`)
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
  } finally {
    await pool.end()
  }
}

// Run the seeding
seedDatabase()
