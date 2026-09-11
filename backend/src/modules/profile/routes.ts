import type { FastifyInstance, preHandlerHookHandler } from 'fastify';
import { z } from 'zod';
import { ProfileRepository } from './repository.js';

const profileUpdateSchema = z
  .object({ display_name: z.string().trim().min(1).max(100) })
  .strict();

export async function registerProfileRoutes(
  app: FastifyInstance,
  repository: ProfileRepository,
  requireVerifiedIdentity: preHandlerHookHandler,
): Promise<void> {
  app.get('/api/v1/profile/me', { preHandler: requireVerifiedIdentity }, async (request) => {
    const identity = request.identity!;
    const profile = await repository.getOrCreate(identity.userId, identity.displayName);
    return { profile };
  });

  app.patch('/api/v1/profile/me', { preHandler: requireVerifiedIdentity }, async (request, reply) => {
    const parsed = profileUpdateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Display name must contain 1 to 100 characters.' },
      });
    }

    const profile = await repository.updateDisplayName(request.identity!.userId, parsed.data.display_name);
    return { profile };
  });
}
