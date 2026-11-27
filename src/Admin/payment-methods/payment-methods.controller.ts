/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { Public, RequirePermissions } from 'src/Rbac/access.decorators';
import { P } from 'src/Rbac/permissions';
import { deliveryFeeConfig } from '../delivery-fees';
import { UpdatePaymentMethodDto } from './payment-methods.dto';
import { PaymentMethodsService } from './payment-methods.service';

// Unknown fields are an error, not silently dropped.
const Strict = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});

// Checkout details that used to be hard-coded in the storefront: payment
// methods (numbers, instructions) and delivery fees. The backend is the only
// copy; the storefront reads these routes.
@Controller('admin')
export class PaymentMethodsController {
  constructor(private readonly paymentMethods: PaymentMethodsService) {}

  // Active payment methods for the storefront (checkout, pay-online page,
  // home page icons).
  @Public()
  @Get('checkout/payment-methods')
  listForCheckout() {
    return this.paymentMethods.listForCheckout();
  }

  // Delivery fees and the Dhaka areas they depend on. The same table prices
  // every order on the server (src/Admin/delivery-fees.ts).
  @Public()
  @Get('checkout/delivery-fees')
  deliveryFees() {
    return deliveryFeeConfig();
  }

  @RequirePermissions(P.PAYMENT_METHODS_MANAGE)
  @Get('payment-methods')
  listForAdmin() {
    return this.paymentMethods.listForAdmin();
  }

  // Audited (AuditInterceptor) with a named action and before/after.
  @RequirePermissions(P.PAYMENT_METHODS_MANAGE)
  @Patch('payment-methods/:id')
  async update(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(Strict) dto: UpdatePaymentMethodDto,
  ) {
    const { data, audit } = await this.paymentMethods.update(id, dto);
    req.audit = audit;
    return data;
  }
}
