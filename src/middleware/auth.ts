import type { FastifyRequest, FastifyReply } from 'fastify'

export async function apiKeyAuth(request: FastifyRequest, reply: FastifyReply) {
  const key = request.headers['x-api-key']
  if (!key || key !== process.env.API_KEY) {
    reply.status(401).send({ error: 'Unauthorized' })
  }
}
