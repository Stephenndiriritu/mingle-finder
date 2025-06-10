import pool from "@/lib/db"

export async function getSuccessStories() {
  try {
    // For now, always return mock data to avoid database issues
    // TODO: Implement proper database schema and then enable database queries
    console.log("Using mock success stories data")
    return getMockSuccessStories()

    // Commented out database query until schema is properly set up
    /*
    // First, check if the testimonials table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'testimonials'
      );
    `)

    const tableExists = tableCheck.rows[0].exists

    if (!tableExists) {
      console.log("Testimonials table does not exist, returning mock data")
      return getMockSuccessStories()
    }

    const result = await pool.query(
      `SELECT
        t.id,
        t.title,
        t.story,
        u.name as names,
        u.location,
        t.photo_url as image_url,
        t.created_at
      FROM
        testimonials t
      JOIN
        users u ON t.user_id = u.id
      WHERE
        t.is_approved = true
      ORDER BY
        t.is_featured DESC,
        t.created_at DESC
      LIMIT 12`
    )

    if (result.rows.length === 0) {
      return getMockSuccessStories()
    }

    return result.rows
    */
  } catch (error) {
    console.error("Error fetching success stories:", error)
    return getMockSuccessStories()
  }
}

function getMockSuccessStories() {
  return [
    {
      id: 1,
      title: "Found Love When We Least Expected",
      story: "We matched on Mingle Finder and instantly connected over our shared love of hiking and photography. After our first date at a local trail, we knew this was something special.",
      names: "Emma & James",
      location: "Colorado Springs, CO",
      image_url: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: "From Match to Marriage",
      story: "What started as a casual conversation on Mingle Finder turned into daily video calls, weekend visits, and eventually, a proposal. We're getting married next spring!",
      names: "Michael & Sarah",
      location: "Austin, TX",
      image_url: "https://images.unsplash.com/photo-1620057657132-a3646aaa3c28?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      title: "Second Chance at Love",
      story: "After my divorce, I never thought I'd find love again. Thanks to Mingle Finder's personality matching, I connected with someone who truly understands me. We've been together for 2 years now.",
      names: "David & Jennifer",
      location: "Chicago, IL",
      image_url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
      created_at: new Date().toISOString()
    }
  ]
}

export async function getPressReleases() {
  try {
    const result = await pool.query(`
      SELECT id, title, excerpt, content, publish_date
      FROM press_releases
      WHERE is_published = true
      ORDER BY publish_date DESC
      LIMIT 10
    `)
    return result.rows
  } catch (error) {
    console.error("Error fetching press releases:", error)
    return [] // Return empty array if table doesn't exist
  }
}

export async function getJobListings() {
  try {
    const result = await pool.query(`
      SELECT id, title, department, location, type, description
      FROM job_listings
      WHERE is_active = true
      ORDER BY created_at DESC
    `)
    return result.rows
  } catch (error) {
    console.error("Error fetching job listings:", error)
    return [] // Return empty array if table doesn't exist
  }
}

export async function getHelpArticles(search?: string) {
  try {
    const query = search
      ? `SELECT id, title, content, category, updated_at
         FROM help_articles
         WHERE is_published = true
         AND (title ILIKE $1 OR content ILIKE $1)
         ORDER BY updated_at DESC`
      : `SELECT id, title, content, category, updated_at
         FROM help_articles
         WHERE is_published = true
         ORDER BY category, title`

    const params = search ? [`%${search}%`] : []
    const result = await pool.query(query, params)
    return result.rows
  } catch (error) {
    console.error("Error fetching help articles:", error)
    return [] // Return empty array if table doesn't exist
  }
}
