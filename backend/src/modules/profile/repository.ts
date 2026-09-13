import type { QueryResultRow } from 'pg';
import type { Database } from '../../db/database.js';

interface ProfileRow extends QueryResultRow {
  user_id: string;
  display_name: string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface Profile {
  userId: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export class ProfileRepository {
  constructor(private readonly database: Database) {}

  async getOrCreate(userId: string, requestedName?: string): Promise<Profile> {
    const displayName = normalizeInitialName(requestedName);
    await this.database.query(
      `INSERT INTO public.profiles (user_id, display_name)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId, displayName],
    );
    const result = await this.database.query<ProfileRow>(
      `SELECT user_id, display_name, created_at, updated_at
       FROM public.profiles
       WHERE user_id = $1`,
      [userId],
    );
    if (!result.rows[0]) throw new Error('Profile unavailable after creation');
    return mapProfile(result.rows[0]);
  }

  async updateDisplayName(userId: string, displayName: string): Promise<Profile> {
    const result = await this.database.query<ProfileRow>(
      `UPDATE public.profiles
       SET display_name = $2
       WHERE user_id = $1
       RETURNING user_id, display_name, created_at, updated_at`,
      [userId, displayName],
    );
    if (!result.rows[0]) return this.getOrCreate(userId, displayName);
    return mapProfile(result.rows[0]);
  }
}

function normalizeInitialName(value?: string): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length <= 100 ? trimmed : 'Learner';
}

function mapProfile(row: ProfileRow): Profile {
  return {
    userId: row.user_id,
    displayName: row.display_name,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}
