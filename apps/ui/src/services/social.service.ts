import api from '../lib/api/client';

export enum SocialPlatform {
  FACEBOOK = 'FACEBOOK',
  TWITTER = 'TWITTER',
  LINKEDIN = 'LINKEDIN',
  INSTAGRAM = 'INSTAGRAM',
}

export const socialService = {
  getPosts: () => api.get('/social/posts'),
  
  schedulePost: (data: any) => api.post('/social/schedule', data),
  
  deletePost: (id: string) => api.delete(`/social/posts/${id}`),

  getAnalytics: () => api.get('/social/analytics'),
};
