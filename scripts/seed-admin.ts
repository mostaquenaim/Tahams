import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../src/Global/Entities/user.entity';

async function run() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Admin';

  if (!email || !password) {
    console.error(
      'ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env before running `npm run seed:admin`.',
    );
    process.exit(1);
  }

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [UserEntity],
    synchronize: true,
  });

  await dataSource.initialize();
  const userRepo = dataSource.getRepository(UserEntity);

  try {
    const existing = await userRepo.findOne({ where: { email } });
    if (existing) {
      console.log(
        `A user with email ${email} already exists (id ${existing.id}, role "${existing.role}") - skipping, no changes made.`,
      );
      return;
    }

    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt());
    const admin = userRepo.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
    });
    await userRepo.save(admin);

    console.log(`Admin account created: ${email} (role: admin)`);
  } finally {
    await dataSource.destroy();
  }
}

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
