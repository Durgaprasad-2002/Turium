import OpenAI from "openai";
import { env } from "../config/env.js";

export function createOpenAiClient() {
  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
}
