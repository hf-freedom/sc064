package com.campus.dormitory.controller;

import com.campus.dormitory.common.Result;
import com.campus.dormitory.dto.CreateMaintenanceRequest;
import com.campus.dormitory.entity.MaintenanceRequest;
import com.campus.dormitory.entity.MaintenanceStaff;
import com.campus.dormitory.service.MaintenanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    @Autowired
    private MaintenanceService maintenanceService;

    @GetMapping("/requests")
    public Result<List<MaintenanceRequest>> getAllRequests() {
        return maintenanceService.getAllRequests();
    }

    @GetMapping("/requests/{requestId}")
    public Result<MaintenanceRequest> getRequestById(@PathVariable String requestId) {
        return maintenanceService.getRequestById(requestId);
    }

    @GetMapping("/requests/student/{studentId}")
    public Result<List<MaintenanceRequest>> getRequestsByStudent(@PathVariable String studentId) {
        return maintenanceService.getRequestsByStudent(studentId);
    }

    @GetMapping("/staff")
    public Result<List<MaintenanceStaff>> getAllStaff() {
        return maintenanceService.getAllStaff();
    }

    @PostMapping("/requests")
    public Result<MaintenanceRequest> createRequest(@RequestBody CreateMaintenanceRequest request) {
        return maintenanceService.createRequest(request);
    }

    @PutMapping("/requests/{requestId}/start")
    public Result<MaintenanceRequest> startRepair(@PathVariable String requestId,
                                                    @RequestParam(required = false) String staffId) {
        return maintenanceService.startRepair(requestId, staffId);
    }

    @PutMapping("/requests/{requestId}/complete")
    public Result<MaintenanceRequest> completeRepair(@PathVariable String requestId,
                                                       @RequestParam(required = false) String remark) {
        return maintenanceService.completeRepair(requestId, remark);
    }

    @PostMapping("/check-escalation")
    public Result<String> checkEscalation() {
        maintenanceService.checkAndEscalateRequests();
        return Result.success("报修单升级检查完成", null);
    }
}
