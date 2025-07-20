import { Injectable } from '@nestjs/common';

@Injectable()
export class LandTaxesService {
  // Flat tax rate per square meter for demonstration
  private readonly TAX_RATE = 10;

  calculateTax(area: number): number {
    return area * this.TAX_RATE;
  }

  getTaxForParcel(parcel: { area: number }) {
    return {
      area: parcel.area,
      tax: this.calculateTax(parcel.area),
    };
  }
}
