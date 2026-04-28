package com.campus.dormitory.service;

import com.campus.dormitory.common.Result;
import com.campus.dormitory.dto.CreateMaintenanceRequest;
import com.campus.dormitory.entity.MaintenanceRequest;
import com.campus.dormitory.entity.MaintenanceStaff;
import com.campus.dormitory.enums.MaintenanceStatus;
import com.campus.dormitory.enums.MaintenanceType;
import com.campus.dormitory.store.DataStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MaintenanceService {

    private static final int ESCALATION_HOURS = 24;

    @Autowired
    private DataStore dataStore;

    public Result<MaintenanceRequest> createRequest(CreateMaintenanceRequest request) {
        MaintenanceRequest req = new MaintenanceRequest();
        req.setRequestId("REQ" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        req.setStudentId(request.getStudentId());
        req.setRoomId(request.getRoomId());
        req.setBedId(request.getBedId());
        req.setType(request.getType());
        req.setDescription(request.getDescription());
        req.setStatus(MaintenanceStatus.SUBMITTED);
        req.setPriority(1);
        req.setEscalated(false);
        req.setSubmitTime(LocalDateTime.now());

        assignMaintenanceStaff(req);

        dataStore.getMaintenanceRequests().put(req.getRequestId(), req);

        if (req.getAssignedStaffId() != null) {
            if (!dataStore.getStaffRequestMap().containsKey(req.getAssignedStaffId())) {
                dataStore.getStaffRequestMap().put(req.getAssignedStaffId(), new java.util.ArrayList<>());
            }
            dataStore.getStaffRequestMap().get(req.getAssignedStaffId()).add(req.getRequestId());
        }

        return Result.success("报修单提交成功", req);
    }

    private void assignMaintenanceStaff(MaintenanceRequest request) {
        MaintenanceType type = request.getType();

        List<MaintenanceStaff> eligibleStaff = dataStore.getMaintenanceStaffs().values().stream()
                .filter(staff -> staff.getAvailable())
                .filter(staff -> staff.getSpecialties().contains(type))
                .sorted(Comparator.comparingInt(MaintenanceStaff::getCurrentTaskCount))
                .collect(Collectors.toList());

        if (eligibleStaff.isEmpty()) {
            eligibleStaff = dataStore.getMaintenanceStaffs().values().stream()
                    .filter(staff -> staff.getAvailable())
                    .sorted(Comparator.comparingInt(MaintenanceStaff::getCurrentTaskCount))
                    .collect(Collectors.toList());
        }

        if (!eligibleStaff.isEmpty()) {
            MaintenanceStaff assignedStaff = eligibleStaff.get(0);
            request.setAssignedStaffId(assignedStaff.getStaffId());
            request.setStatus(MaintenanceStatus.ASSIGNED);
            request.setAssignTime(LocalDateTime.now());
            assignedStaff.setCurrentTaskCount(assignedStaff.getCurrentTaskCount() + 1);
            dataStore.getMaintenanceStaffs().put(assignedStaff.getStaffId(), assignedStaff);
        }
    }

    public Result<MaintenanceRequest> getRequestById(String requestId) {
        MaintenanceRequest request = dataStore.getMaintenanceRequests().get(requestId);
        if (request == null) {
            return Result.error("报修单不存在");
        }
        return Result.success(request);
    }

    public Result<List<MaintenanceRequest>> getRequestsByStudent(String studentId) {
        List<MaintenanceRequest> requests = dataStore.getMaintenanceRequests().values().stream()
                .filter(req -> req.getStudentId().equals(studentId))
                .collect(Collectors.toList());
        return Result.success(requests);
    }

    public Result<MaintenanceRequest> startRepair(String requestId, String staffId) {
        MaintenanceRequest request = dataStore.getMaintenanceRequests().get(requestId);
        if (request == null) {
            return Result.error("报修单不存在");
        }

        if (request.getStatus() != MaintenanceStatus.ASSIGNED) {
            return Result.error("报修单状态不正确，无法开始维修");
        }

        request.setStatus(MaintenanceStatus.IN_PROGRESS);
        dataStore.getMaintenanceRequests().put(request.getRequestId(), request);

        return Result.success("开始维修", request);
    }

    public Result<MaintenanceRequest> completeRepair(String requestId, String remark) {
        MaintenanceRequest request = dataStore.getMaintenanceRequests().get(requestId);
        if (request == null) {
            return Result.error("报修单不存在");
        }

        if (request.getStatus() != MaintenanceStatus.IN_PROGRESS &&
                request.getStatus() != MaintenanceStatus.ESCALATED) {
            return Result.error("报修单状态不正确，无法完成维修");
        }

        request.setStatus(MaintenanceStatus.COMPLETED);
        request.setCompletedTime(LocalDateTime.now());
        request.setRemark(remark);
        dataStore.getMaintenanceRequests().put(request.getRequestId(), request);

        if (request.getAssignedStaffId() != null) {
            MaintenanceStaff staff = dataStore.getMaintenanceStaffs().get(request.getAssignedStaffId());
            if (staff != null && staff.getCurrentTaskCount() > 0) {
                staff.setCurrentTaskCount(staff.getCurrentTaskCount() - 1);
                dataStore.getMaintenanceStaffs().put(staff.getStaffId(), staff);
            }
        }

        return Result.success("维修完成", request);
    }

    public void checkAndEscalateRequests() {
        LocalDateTime now = LocalDateTime.now();

        for (MaintenanceRequest request : dataStore.getMaintenanceRequests().values()) {
            if (request.getStatus() == MaintenanceStatus.SUBMITTED ||
                    request.getStatus() == MaintenanceStatus.ASSIGNED ||
                    request.getStatus() == MaintenanceStatus.IN_PROGRESS) {

                LocalDateTime referenceTime = request.getSubmitTime();
                if (request.getStatus() == MaintenanceStatus.ASSIGNED) {
                    referenceTime = request.getAssignTime() != null ? request.getAssignTime() : referenceTime;
                }

                if (now.isAfter(referenceTime.plusHours(ESCALATION_HOURS)) && !request.getEscalated()) {
                    request.setStatus(MaintenanceStatus.ESCALATED);
                    request.setEscalated(true);
                    request.setPriority(request.getPriority() + 1);
                    dataStore.getMaintenanceRequests().put(request.getRequestId(), request);
                }
            }
        }
    }

    public Result<List<MaintenanceRequest>> getAllRequests() {
        List<MaintenanceRequest> requests = dataStore.getMaintenanceRequests().values().stream()
                .collect(Collectors.toList());
        return Result.success(requests);
    }

    public Result<List<MaintenanceStaff>> getAllStaff() {
        List<MaintenanceStaff> staffs = dataStore.getMaintenanceStaffs().values().stream()
                .collect(Collectors.toList());
        return Result.success(staffs);
    }
}
