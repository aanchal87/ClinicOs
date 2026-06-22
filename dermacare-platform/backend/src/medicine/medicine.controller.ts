import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { MedicineService } from './medicine.service';

@Controller('medicines')
export class MedicineController {
  constructor(private medicineService: MedicineService) {}

  @Get('search')
  async search(@Query('q') query: string) {
    return this.medicineService.searchMedicines(query);
  }

  @Post()
  async create(@Body() body: { name: string; category?: string }) {
    return this.medicineService.createMedicine(body.name, body.category);
  }
}
