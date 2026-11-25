import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { UserEntity } from '../src/Global/Entities/user.entity';
import { RoleEntity } from '../src/Global/Entities/roles.entity';

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

  // Boots the same module graph the app itself uses (AppModule -> TypeOrmModule with
  // autoLoadEntities), so the DB connection and schema always match production exactly -
  // no risk of this script drifting out of sync with the real entity graph.
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  try {
    const userRepo = app.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );

    const existing = await userRepo.findOne({ where: { email } });
    if (existing) {
      console.log(
        `A user with email ${email} already exists (id ${existing.id}, role "${existing.role}") - skipping, no changes made.`,
      );
      return;
    }

    // The app context has already booted, so RbacService has created the
    // built-in roles - give the new admin the Owner role directly (the boot
    // backfill would otherwise only do it on the next app start).
    const roleRepo = app.get<Repository<RoleEntity>>(
      getRepositoryToken(RoleEntity),
    );
    const ownerRole = await roleRepo.findOne({ where: { key: 'owner' } });
    if (!ownerRole) {
      console.warn(
        'Owner role not found (RBAC boot sync failed?) - the account will get it on the next app start.',
      );
    }

    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt());
    const admin = userRepo.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      staffRoleId: ownerRole?.id ?? null,
    });
    await userRepo.save(admin);

    console.log(
      `Admin account created: ${email} (role: admin, staff role: ${ownerRole ? 'Owner' : 'pending'})`,
    );
  } finally {
    await app.close();
  }
}

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
