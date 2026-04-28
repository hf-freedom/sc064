package com.campus.dormitory.dto;

import lombok.Data;

@Data
public class RoomChangeRequest {
    private String studentId;
    private String oldBedId;
    private String newBedId;
    private String reason;
}
