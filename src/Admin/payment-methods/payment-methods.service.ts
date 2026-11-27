/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PaymentMethodEntity } from 'src/Global/Entities/paymentMethod.entity';
import {
  EditableDetails,
  checkMethod,
  isPayLaterMethod,
  planDefaultFill,
} from './payment-method-rules';
import { UpdatePaymentMethodDto } from './payment-methods.dto';

const EDITABLE_FIELDS: (keyof EditableDetails)[] = [
  'instructions',
  'accountNumber',
  'icon',
  'payOnline',
  'isActive',
  'sortOrder',
];

const pickEditable = (method: PaymentMethodEntity): EditableDetails => ({
  instructions: method.instructions ?? null,
  accountNumber: method.accountNumber ?? null,
  icon: method.icon ?? null,
  payOnline: !!method.payOnline,
  isActive: method.isActive !== false,
  sortOrder: Number.isFinite(Number(method.sortOrder)) ? Number(method.sortOrder) : 100,
});

const byDisplayOrder = (a: PaymentMethodEntity, b: PaymentMethodEntity) =>
  (a.sortOrder ?? 100) - (b.sortOrder ?? 100) || a.id - b.id;

@Injectable()
export class PaymentMethodsService implements OnModuleInit {
  private readonly logger = new Logger(PaymentMethodsService.name);

  constructor(
    @InjectRepository(PaymentMethodEntity)
    private readonly repo: Repository<PaymentMethodEntity>,
  ) {}

  // One-time fill of the details the storefront used to hard-code, into the
  // rows that existed before they moved here (see payment-method-rules.ts).
  // Only rows without configuredAt are considered, and each update re-checks
  // that in its WHERE clause, so it can't overwrite an admin's edit even if
  // two server processes start at once. Never blocks startup.
  async onModuleInit() {
    try {
      const pending = await this.repo.find({ where: { configuredAt: IsNull() } });
      if (!pending.length) return;

      const { fill, ambiguous, unmatched } = planDefaultFill(pending);
      for (const row of fill) {
        const result = await this.repo
          .createQueryBuilder()
          .update(PaymentMethodEntity)
          .set({ ...row.details, configuredAt: () => 'now()' })
          .where('id = :id AND "configuredAt" IS NULL', { id: row.id })
          .execute();
        if (result.affected) {
          this.logger.log(`Filled checkout details for payment method #${row.id} "${row.name}" (${row.kind}).`);
        }
      }
      for (const { kind, rows } of ambiguous) {
        this.logger.warn(
          `Not filling "${kind}" details: more than one payment method matches (${rows
            .map((r) => `#${r.id} "${r.name}"`)
            .join(', ')}). Set them on the admin Payment methods page.`,
        );
      }
      if (unmatched.length) {
        this.logger.warn(
          `Payment methods with no known details: ${unmatched
            .map((r) => `#${r.id} "${r.name}"`)
            .join(', ')}. They stay hidden from online payment until set on the admin page.`,
        );
      }
    } catch (error) {
      this.logger.error('Could not fill payment method details', error as any);
    }
  }

  // What the storefront may see: active methods only, in display order,
  // without internal fields.
  async listForCheckout() {
    const methods = await this.repo.find({ where: { isActive: true } });
    return methods.sort(byDisplayOrder).map((m) => ({
      id: m.id,
      name: m.name,
      icon: m.icon,
      instructions: m.instructions,
      accountNumber: m.accountNumber,
      payOnline: !!m.payOnline,
    }));
  }

  // Everything, for the admin page, with whether each one is cash on
  // delivery / pickup (those can't be made online or switched off).
  async listForAdmin() {
    const methods = await this.repo.find();
    return methods.sort(byDisplayOrder).map((m) => ({
      id: m.id,
      name: m.name,
      ...pickEditable(m),
      configuredAt: m.configuredAt,
      payLater: isPayLaterMethod(m),
    }));
  }

  // Returns the saved method plus a before/after for the audit log.
  async update(id: number, dto: UpdatePaymentMethodDto) {
    const method = await this.repo.findOneBy({ id });
    if (!method) throw new NotFoundException('Payment method not found.');

    const changes = EDITABLE_FIELDS.filter((field) => dto[field] !== undefined);
    if (!changes.length) throw new BadRequestException('Nothing to change.');

    const before = pickEditable(method);
    const after: EditableDetails = { ...before };
    for (const field of changes) (after as any)[field] = dto[field];

    // A plain string: Nest would send an array argument as the whole
    // response body, and the admin page reads `message`.
    const problems = checkMethod(method, after);
    if (problems.length) throw new BadRequestException(problems.join(' '));

    Object.assign(method, after, { configuredAt: new Date() });
    const saved = await this.repo.save(method);

    const changed = Object.fromEntries(
      EDITABLE_FIELDS.filter((f) => before[f] !== after[f]).map((f) => [
        f,
        { from: before[f], to: after[f] },
      ]),
    );
    return {
      data: {
        id: saved.id,
        name: saved.name,
        ...pickEditable(saved),
        configuredAt: saved.configuredAt,
        payLater: isPayLaterMethod(saved),
      },
      audit: {
        action: 'payment_method.update',
        entity: 'payment_method',
        entityId: saved.id,
        changes: changed,
      },
    };
  }
}
