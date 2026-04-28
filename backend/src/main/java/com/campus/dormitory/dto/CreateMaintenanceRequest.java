package com.campus.dormitory.dto;

import com.campus.dormitory.enums.MaintenanceType;
import lombok.Data;

@Data
public class CreateMaintenanceRequest {
    private String studentId;
    private String roomId;
    private String bedId;
    private MaintenanceType type;
    private String description;
}
