package com.campus.dormitory.entity;

import com.campus.dormitory.enums.MaintenanceStatus;
import com.campus.dormitory.enums.MaintenanceType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MaintenanceRequest {
    private String requestId;
    private String studentId;
    private String roomId;
    private String bedId;
    private MaintenanceType type;
    private String description;
    private MaintenanceStatus status;
    private String assignedStaffId;
    private LocalDateTime submitTime;
    private LocalDateTime assignTime;
    private LocalDateTime completedTime;
    private Integer priority;
    private Boolean escalated;
    private String remark;
}
