import { directedNumbersDefinition } from "./directed-numbers/challenge/definition";

export const challengeDefinitions={"directed-numbers":directedNumbersDefinition} as const;
export type ChallengeAppSlug=keyof typeof challengeDefinitions;
