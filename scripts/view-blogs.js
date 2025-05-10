const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const viewBlogs = async () => {
  try {
    console.log('Fetching all blog posts...');
    
    const blogPosts = await prisma.blogPost.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });
    
    if (blogPosts.length === 0) {
      console.log('No blog posts found in the database.');
      return;
    }
    
    console.log(`Found ${blogPosts.length} blog posts:`);
    console.log('------------------------');
    
    blogPosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   ID: ${post.id}`);
      console.log(`   Slug: ${post.slug}`);
      console.log(`   Published: ${post.published ? 'Yes' : 'No'}`);
      console.log(`   Author: ${post.author.name} (${post.author.email})`);
      console.log(`   Created: ${post.createdAt}`);
      console.log(`   Comments: ${post._count.comments}`);
      console.log(`   Likes: ${post._count.likes}`);
      console.log('------------------------');
    });
    
  } catch (error) {
    console.error('Error fetching blog posts:', error);
  } finally {
    await prisma.$disconnect();
  }
};

viewBlogs()
  .catch((error) => {
    console.error('Error running script:', error);
    process.exit(1);
  }); 