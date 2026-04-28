package com.campus.dormitory.entity;

import com.campus.dormitory.enums.MaintenanceType;
import lombok.Data;

import java.util.List;

@Data
public class MaintenanceStaff {
    private String staffId;
    private String name;
    private String phone;
    private List<MaintenanceType> specialties;
    private Boolean available;
    private Integer currentTaskCount;
}
