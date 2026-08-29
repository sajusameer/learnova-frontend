import { fetchFromStrapi } from '@/lib/api';

// Helper to extract image URL from Markdown body or fallback
export function extractCoverImage(body) {
  if (!body) return 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80';
  const match = body.match(/!\[.*?\]\((.*?)\)/);
  return match ? match[1] : 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80';
}

// Helper to clean body text (remove cover image markdown from preview text)
export function getCleanBody(body) {
  if (!body) return '';
  return body.replace(/!\[.*?\]\(.*?\)\n*/g, '').trim();
}

export const blogService = {
  // Public: Get published blog posts
  async getPublishedPosts() {
    try {
      const res = await fetchFromStrapi('/blog-posts?populate=*&sort=createdAt:desc');
      const posts = res.data || [];

      return posts.filter((post) => {
        const pData = post.attributes || post;
        const status = pData.postStatus || pData.status || 'published';
        return status === 'published';
      });
    } catch {
      return [];
    }
  },

  // Public: Get single post
  async getPostById(id) {
    try {
      const res = await fetchFromStrapi(`/blog-posts/${id}?populate=*`);
      return res.data || null;
    } catch {
      return null;
    }
  },

  // Content Manager: Get all posts
  async getAllPostsForManager(token) {
    try {
      const res = await fetchFromStrapi('/blog-posts?populate=*&sort=createdAt:desc', { token });
      return res.data || [];
    } catch {
      return [];
    }
  },

  // Content Manager: Create post with cover image embedded safely
  async createPost(postData, userId, token) {
    let finalBody = postData.body;
    if (postData.cover && postData.cover.trim()) {
      finalBody = `![cover](${postData.cover.trim()})\n\n${postData.body}`;
    }

    const payload = {
      data: {
        title: postData.title,
        body: finalBody,
        postStatus: postData.postStatus || 'published',
        author: userId,
      },
    };

    try {
      return await fetchFromStrapi('/blog-posts', {
        method: 'POST',
        token,
        body: JSON.stringify(payload),
      });
    } catch {
      // Fallback if author relation is not supported
      const safePayload = {
        data: {
          title: postData.title,
          body: finalBody,
          postStatus: postData.postStatus || 'published',
        },
      };
      return await fetchFromStrapi('/blog-posts', {
        method: 'POST',
        token,
        body: JSON.stringify(safePayload),
      });
    }
  },

  // Delete post
  async deletePost(id, token) {
    return await fetchFromStrapi(`/blog-posts/${id}`, {
      method: 'DELETE',
      token,
    });
  },
  // Content Manager: Update post
async updatePost(id, postData, token) {
  const payload = {
    data: {
      title: postData.title,
      body: postData.body,
      postStatus: postData.postStatus,
    },
  };

  return await fetchFromStrapi(`/blog-posts/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  });
},
};

