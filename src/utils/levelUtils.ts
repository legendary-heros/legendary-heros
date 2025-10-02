export interface UserLevel {
  name: string;
  tier: string;
  stars: number;
  description: string;
  color: string;
  textColor: string;
  bgColor: string;
}

/**
 * Determines the user level based on their score
 * @param score - The user's current score
 * @returns UserLevel object with level information
 */
export const getUserLevel = (score: number): UserLevel => {
  if (score >= 1000) {
    return {
      name: 'SS Level',
      tier: 'master',
      stars: 5,
      description: 'Monster, God',
      color: 'from-yellow-400 to-orange-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    };
  } else if (score >= 500) {
    return {
      name: 'S Level',
      tier: 'expert',
      stars: 4,
      description: 'A hero who has ability to change round situation',
      color: 'from-purple-400 to-pink-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    };
  } else if (score >= 250) {
    return {
      name: 'A Level',
      tier: 'professional',
      stars: 3,
      description: 'A hero who can do rampage in round',
      color: 'from-blue-400 to-cyan-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    };
  } else if (score >= 100) {
    return {
      name: 'B Level',
      tier: 'intermediate',
      stars: 2,
      description: 'A hero who is good at carry and support both and sometimes takes 1 place in the round',
      color: 'from-green-400 to-emerald-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    };
  } else if (score >= 50) {
    return {
      name: 'C Level',
      tier: 'beginner',
      stars: 1,
      description: 'A hero who is good at carry',
      color: 'from-blue-400 to-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    };
  } else {
    return {
      name: 'D Level',
      tier: 'novice',
      stars: 0,
      description: 'A new hero starting their journey',
      color: 'from-slate-300 to-slate-400',
      textColor: 'text-slate-600',
      bgColor: 'bg-slate-50'
    };
  }
};

