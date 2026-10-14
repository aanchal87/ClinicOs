import { Controller, Get, Post, Delete, Param, UseInterceptors, UploadedFile, Body, Res, Req, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import * as express from 'express';
import { Permissions } from '../auth/permissions.decorator';

@Controller('documents')
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Get('patient/:patientId')
  @Permissions('READ_PATIENTS')
  async getDocuments(@Param('patientId') patientId: string, @Req() req: any) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.documentService.getDocuments(patientId, clinicId);
  }

  @Post('patient/:patientId')
  @Permissions('UPDATE_PATIENTS')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Param('patientId') patientId: string,
    @UploadedFile() file: any,
    @Body() dto: any,
    @Req() req: any,
  ) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.documentService.uploadDocument(patientId, file, dto, clinicId, user);
  }

  @Delete(':id')
  @Permissions('DELETE_PATIENTS')
  async deleteDocument(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    return this.documentService.deleteDocument(id, clinicId, user);
  }

  @Get(':id/download')
  @Permissions('READ_PATIENTS')
  async downloadDocument(@Param('id') id: string, @Res() res: express.Response, @Req() req: any) {
    const user = req.user;
    const clinicId = user.role === 'SUPER_ADMIN' ? undefined : user.clinicId;
    const { absolutePath, documentName } = await this.documentService.downloadDocument(id, clinicId, user);
    
    res.setHeader('Content-Disposition', `attachment; filename="${documentName}"`);
    return res.sendFile(absolutePath);
  }
}
