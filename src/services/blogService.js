import { fetchFromStrapi } from '@/lib/api';

export const extractCoverImage = (body = '') => {
  if (typeof body !== 'string') return '';
  const match = body.match(/^!\[cover\]\((.*?)\)/);
  return match ? match[1] : '';
};

export const getCleanBody = (body = '') => {
  if (typeof body !== 'string') return '';
  return body.replace(/^!\[cover\]\(.*?\)\s*/i, '').trim();
};

export const blogService = {
  // সকল পোস্ট ফেচ করা
  async getAllPosts(token) {
    try {
      const res = await fetchFromStrapi('/blog-posts?populate=*', { token });
      return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  },

  // পাবলিক ব্লগের জন্য শুধু ড্রাফট ছাড়া পোস্ট ফিল্টার করা
  async getPublishedPosts() {
    try {
      const all = await this.getAllPosts();
      return all.filter((p) => {
        const d = p.attributes || p;
        const title = d.title || '';
        return !title.trim().startsWith('[DRAFT]') && d.isDraft !== true && d.postStatus !== 'draft';
      });
    } catch {
      return [];
    }
  },

  // নির্দিষ্ট পোস্ট ফেচ করা
  async getPostById(id, token) {
    try {
      const posts = await this.getAllPosts(token);
      return (
        posts.find(
          (p) =>
            String(p.documentId) === String(id) ||
            String(p.id) === String(id) ||
            String(p.attributes?.slug || p.slug) === String(id)
        ) || null
      );
    } catch {
      return null;
    }
  },

  // নতুন পোস্ট তৈরি
  async createPost(formData, token) {
    let finalBody = formData.body || '';
    if (formData.cover && formData.cover.trim()) {
      finalBody = `![cover](${formData.cover.trim()})\n\n${finalBody}`;
    }
    const payload = {
      title: formData.title,
      body: finalBody,
    };
    return fetchFromStrapi('/blog-posts', {
      method: 'POST',
      token,
      body: { data: payload },
    });
  },

  // পোস্ট আপডেট
  async updatePost(id, formData, token) {
    let finalBody = formData.body || '';
    if (formData.cover && formData.cover.trim()) {
      finalBody = `![cover](${formData.cover.trim()})\n\n${finalBody}`;
    }
    const payload = {
      title: formData.title,
      body: finalBody,
    };
    return fetchFromStrapi(`/blog-posts/${id}`, {
      method: 'PUT',
      token,
      body: { data: payload },
    });
  },

  // পোস্ট ডিলিট
  async deletePost(id, token) {
    return fetchFromStrapi(`/blog-posts/${id}`, {
      method: 'DELETE',
      token,
    });
  },
};