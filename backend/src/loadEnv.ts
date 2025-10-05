import { config } from 'dotenv';
import { resolve } from 'node:path';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';

config({ path: resolve(process.cwd(), envFile) });
