import { handleApiRequest } from '../src/handlers.mjs';

export default async function handler(req, res) {
  return handleApiRequest(req, res);
}
