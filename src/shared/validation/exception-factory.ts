import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export const exceptionFactory = (validationErrors: ValidationError[] = []) => {
  throw new BadRequestException(
    validationErrors.map((error) => ({
      field: error.property,
      error: Object.values(error.constraints ?? []).join(', '),
    })),
  );
};
