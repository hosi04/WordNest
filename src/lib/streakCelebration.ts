export interface CelebrationInput {
  studiedToday: boolean // the streak counts today (this session logged at least one review)
  days: number // current streak length
  hadEarlierReviewToday: boolean // a review exists today from before this session started (any device)
  alreadyCelebratedToday: boolean // this device already showed it today
}

/** The n → n + 1 celebration belongs only to the first session of the day. */
export function shouldCelebrate(input: CelebrationInput): boolean {
  return input.studiedToday && input.days >= 1 && !input.hadEarlierReviewToday && !input.alreadyCelebratedToday
}
