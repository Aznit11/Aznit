const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const seedBlogs = async () => {
  try {
    console.log('Seeding blog posts...');

    // Get admin user
    const adminUser = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    });

    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      return;
    }

    console.log('Found admin user:', adminUser.email);

    // Create blog posts
    const blogPosts = [
      {
        title: 'The Art of Moroccan Rug Weaving',
        slug: 'art-of-moroccan-rug-weaving',
        content: `<h1>The Art of Moroccan Rug Weaving</h1>
        <p>Morocco's rich textile tradition has been passed down through generations, with rug weaving being one of its most distinctive art forms. These handcrafted pieces tell stories of Berber culture, traditions, and the skilled artisans who create them.</p>
        
        <h2>The Heritage Behind Every Knot</h2>
        <p>Each Moroccan rug represents more than just a decorative piece—it embodies centuries of cultural heritage.</p>`,
        excerpt: 'Discover the ancient traditions and techniques behind authentic Moroccan rug weaving.',
        imageUrl: '/images/blog/moroccan-rugs.jpg',
        published: true,
        publishedAt: new Date(),
        categories: 'Home Decor, Craftsmanship, Textiles',
        tags: 'rugs, berber, weaving, traditional, home decor',
        authorId: adminUser.id
      },
      {
        title: 'Moroccan Spices: A Culinary Journey',
        slug: 'moroccan-spices-culinary-journey',
        content: `<h1>Moroccan Spices: A Culinary Journey</h1>
        <p>Moroccan cuisine is celebrated worldwide for its bold flavors and aromatic qualities, largely attributable to its masterful use of spices.</p>
        
        <h2>Essential Moroccan Spices</h2>
        <p>The Moroccan spice palette is diverse and complex.</p>`,
        excerpt: 'Explore the vibrant world of Moroccan spices.',
        imageUrl: '/images/blog/moroccan-spices.jpg',
        published: true,
        publishedAt: new Date(Date.now() - 86400000), // yesterday
        categories: 'Culinary, Spices, Food',
        tags: 'spices, cooking, tagine, ras el hanout, food',
        authorId: adminUser.id
      },
      {
        title: 'The Beauty of Moroccan Hammam Rituals',
        slug: 'beauty-moroccan-hammam-rituals',
        content: `<h1>The Beauty of Moroccan Hammam Rituals</h1>
        <p>The Moroccan hammam, a traditional bathhouse experience, represents one of the oldest and most cherished wellness rituals in North African culture.</p>
        
        <h2>Historical Origins</h2>
        <p>Hammams have been a cornerstone of Moroccan culture since the arrival of Islam, which emphasizes physical cleanliness as a component of spiritual purity.</p>`,
        excerpt: 'Discover the ancient tradition of Moroccan hammam bathing rituals.',
        imageUrl: '/images/blog/moroccan-hammam.jpg',
        published: true,
        publishedAt: new Date(Date.now() - 172800000), // 2 days ago
        categories: 'Beauty, Wellness, Traditions',
        tags: 'hammam, skincare, beldi soap, beauty ritual, argan oil',
        authorId: adminUser.id
      }
    ];

    console.log(`Attempting to create ${blogPosts.length} blog posts...`);

    for (const post of blogPosts) {
      try {
        // Check if blog post with this slug already exists
        const existingPost = await prisma.blogPost.findUnique({
          where: { slug: post.slug }
        });

        if (!existingPost) {
          const createdPost = await prisma.blogPost.create({
            data: post
          });
          console.log(`Created blog post: ${post.title} with ID: ${createdPost.id}`);
        } else {
          console.log(`Blog post with slug "${post.slug}" already exists. Skipping.`);
        }
      } catch (postError) {
        console.error(`Error creating blog post "${post.title}":`, postError);
      }
    }

    console.log('Blog posts seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding blog posts:', error);
  } finally {
    await prisma.$disconnect();
  }
};

seedBlogs()
  .catch((error) => {
    console.error('Error running seed script:', error);
    process.exit(1);
  }); 