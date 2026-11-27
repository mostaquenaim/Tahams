import { ValidationPipe } from '@nestjs/common';
import { UpdatePaymentMethodDto } from './payment-methods.dto';

// Same options as the controller's Strict pipe.
const pipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});
const run = (body: any) =>
  pipe.transform(body, { type: 'body', metatype: UpdatePaymentMethodDto });

describe('UpdatePaymentMethodDto', () => {
  it('accepts and tidies a normal edit', async () => {
    const dto = await run({
      instructions: '  Merchant: 01700000000\r\nRef: name  ',
      accountNumber: ' 01700000000 ',
      icon: '/bkash-bnw.png',
      payOnline: true,
      isActive: true,
      sortOrder: 20,
    });
    expect(dto).toMatchObject({
      instructions: 'Merchant: 01700000000\nRef: name',
      accountNumber: '01700000000',
      icon: '/bkash-bnw.png',
    });
  });

  it('turns blank text into null (clear)', async () => {
    const dto = await run({ instructions: '   ', accountNumber: '', icon: '' });
    expect(dto).toMatchObject({ instructions: null, accountNumber: null, icon: null });
  });

  it.each([
    [{ accountNumber: '01700-000000' }],
    [{ accountNumber: '+8801700000000' }],
    [{ accountNumber: '123' }],
    [{ icon: 'https://evil.example/x.png' }],
    [{ icon: '/../x.png' }],
    [{ payOnline: 'yes' }],
    [{ payOnline: null }],
    [{ isActive: null }],
    [{ sortOrder: -1 }],
    [{ sortOrder: 1.5 }],
    [{ sortOrder: null }],
    [{ instructions: 'x'.repeat(1001) }],
    [{ name: 'Renamed' }], // not editable here
    [{ configuredAt: null }], // internal
  ])('refuses %p', async (body) => {
    await expect(run(body)).rejects.toBeDefined();
  });
});
