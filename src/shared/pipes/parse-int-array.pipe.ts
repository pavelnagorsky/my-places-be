import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntArrayPipe implements PipeTransform {
  transform(value: any): number[] {
    if (!value) {
      return [];
    }
    const values = Array.isArray(value) ? value : value.split(',');
    const parsedValues = values.map((val: string) => {
      const parsed = parseInt(val, 10);
      if (isNaN(parsed)) {
        throw new BadRequestException(`Invalid number: ${val}`);
      }
      return parsed;
    });
    return parsedValues;
  }
}
