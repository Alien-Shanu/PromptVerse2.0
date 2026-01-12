import { Author } from '../types';
import { MOCK_AUTHORS } from '../constants';

export const getAuthorProfile = async (name: string): Promise<Author> => {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 400));
  
  const existing = MOCK_AUTHORS.find(a => a.name === name);
  if (existing) return existing;

  // Fallback for unknown/new authors
  return {
    name: name,
    bio: 'A creative explorer contributing to the PromptVerse community.',
    joinedDate: new Date().toISOString().split('T')[0],
    avatarColor: 'from-gray-600 to-gray-800',
    avatarUrl: `https://api.dicebear.com/9.x/shapes/svg?seed=${name}`
  };
};