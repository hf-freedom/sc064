package com.campus.dormitory.entity;

import lombok.Data;

import java.util.List;

@Data
public class DormitoryRoom {
    private String roomId;
    private String buildingId;
    private Integer floor;
    private String roomNumber;
    private Integer bedCount;
    private List<String> bedIds;
    private String lastMeterReadingDate;
}
