package com.campus.dormitory.dto;

import lombok.Data;

@Data
public class PayBillRequest {
    private String billId;
    private String studentId;
}
