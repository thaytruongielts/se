
import type { Timer } from './types';

export const INITIAL_TIME_SECONDS = 30 * 60; // 30 minutes
export const RATE_PER_MINUTE_VND = 10000;

export const TIMER_CONFIGS: Omit<Timer, 'isRunning' | 'timeLeft'>[] = [
  { id: 1, title: 'Fanpage: IELTS Listening 8.5', description: 'Create a new post for the fanpage.' },
  { id: 2, title: 'Fanpage: Think Like a Billionaire', description: 'Draft content for financial mindset.' },
  { id: 3, title: 'Personal Facebook Growth', description: 'Connect with new friends on the primary account.' },
  { id: 4, title: 'Fanpage: Raising Genius Children', description: 'Develop content for the parenting page.' },
  { id: 5, title: 'Content: Reel Guru', description: 'Plan and script the next viral reel.' },
  { id: 6, title: 'Content: Reel Cartoon', description: 'Produce an animated reel.' },
  { id: 7, title: 'Fanpage: Parents of IELTS Students', description: 'Engage with the parent community.' },
  { id: 8, title: 'Fanpage: Rolex Watch Owners', description: 'Curate content for luxury watch enthusiasts.' },
  { id: 9, title: 'Fanpage: District 1 Homeowners', description: 'Create posts for the central homeowners group.' },
  { id: 10, title: 'Fanpage: Mercedes Owners', description: 'Develop content for Mercedes-Benz fans.' },
  { id: 11, title: 'Fanpage: IELTS 8.5 Free Apps', description: 'Promote and discuss free learning tools.' },
  { id: 12, title: 'Fanpage: Top 5% Mindset', description: 'Share insights on elite thinking and strategy.' },
];
