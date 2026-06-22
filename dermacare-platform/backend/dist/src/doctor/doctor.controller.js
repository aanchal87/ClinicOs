"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorController = void 0;
const common_1 = require("@nestjs/common");
let DoctorController = class DoctorController {
    getDashboardStats(doctorId) {
        return {
            stats: {
                todaysAppointments: 4,
                monthlyAppointments: 48,
                activePatients: 36,
                followUpsDue: 8,
                revenue: '₹24,500',
            },
            appointments: [
                {
                    id: '1',
                    patientName: 'Rohan Gupta',
                    age: 24,
                    gender: 'Male',
                    time: '10:00 AM',
                    type: 'Acne Consultation',
                    status: 'Confirmed',
                },
                {
                    id: '2',
                    patientName: 'Priya Sharma',
                    age: 29,
                    gender: 'Female',
                    time: '11:30 AM',
                    type: 'Chemical Peel Follow-Up',
                    status: 'In Progress',
                },
                {
                    id: '3',
                    patientName: 'Amit Verma',
                    age: 35,
                    gender: 'Male',
                    time: '02:00 PM',
                    type: 'Hair Loss Treatment',
                    status: 'Pending',
                },
                {
                    id: '4',
                    patientName: 'Sanya Malhotra',
                    age: 27,
                    gender: 'Female',
                    time: '04:30 PM',
                    type: 'Laser Therapy Session',
                    status: 'Pending',
                },
            ],
        };
    }
};
exports.DoctorController = DoctorController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Query)('doctorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DoctorController.prototype, "getDashboardStats", null);
exports.DoctorController = DoctorController = __decorate([
    (0, common_1.Controller)('doctor')
], DoctorController);
//# sourceMappingURL=doctor.controller.js.map