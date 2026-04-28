package com.campus.dormitory.entity;

import com.campus.dormitory.enums.AccessStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AccessCard {
    private String cardId;
    private String studentId;
    private String bedId;
    private String buildingId;
    private AccessStatus status;
    private LocalDateTime issueDate;
    private LocalDateTime expiryDate;
}
