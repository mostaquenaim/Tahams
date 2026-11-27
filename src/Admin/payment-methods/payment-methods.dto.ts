/* eslint-disable prettier/prettier */
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  ACCOUNT_NUMBER_PATTERN,
  ICON_PATTERN,
  MAX_INSTRUCTIONS,
} from './payment-method-rules';

// '' and whitespace mean "clear it" for the text fields.
const trimToNull = ({ value }) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

// Keeps the customer-facing line breaks, normalises Windows ones and trims.
const tidyInstructions = ({ value }) => {
  if (typeof value !== 'string') return value;
  const tidied = value.replace(/\r\n?/g, '\n').trim();
  return tidied === '' ? null : tidied;
};

// Every field is optional (send only what changes); unknown fields are
// refused by the controller's strict ValidationPipe. `null` clears the text
// fields; the switches and sort order can't be null.
export class UpdatePaymentMethodDto {
  @IsOptional()
  @Transform(tidyInstructions)
  @IsString()
  @MaxLength(MAX_INSTRUCTIONS)
  instructions?: string | null;

  @IsOptional()
  @Transform(trimToNull)
  @IsString()
  @Matches(ACCOUNT_NUMBER_PATTERN, {
    message: 'Account number must be 6-20 digits, with no spaces or dashes.',
  })
  accountNumber?: string | null;

  @IsOptional()
  @Transform(trimToNull)
  @IsString()
  @Matches(ICON_PATTERN, {
    message: 'Icon must be an image path in the storefront public folder, like /bkash-bnw.png.',
  })
  icon?: string | null;

  @ValidateIf((o) => o.payOnline !== undefined)
  @IsBoolean()
  payOnline?: boolean;

  @ValidateIf((o) => o.isActive !== undefined)
  @IsBoolean()
  isActive?: boolean;

  @ValidateIf((o) => o.sortOrder !== undefined)
  @IsInt()
  @Min(0)
  @Max(1000)
  sortOrder?: number;
}
