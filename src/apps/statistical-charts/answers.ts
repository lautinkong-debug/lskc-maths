import { createContext, useContext } from "react";
export const AnswersContext = createContext(true);
export const useAnswers = () => useContext(AnswersContext);
