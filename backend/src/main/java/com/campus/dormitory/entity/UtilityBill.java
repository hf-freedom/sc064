package com.campus.dormitory.entity;

import com.campus.dormitory.enums.BillStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class UtilityBill {
    private String billId;
    private String studentId;
    private String roomId;
    private String bedId;
    private Integer billingMonth;
    private Integer billingYear;
    private BigDecimal electricityUsage;
    private BigDecimal waterUsage;
    private BigDecimal electricityCost;
    private BigDecimal waterCost;
    private BigDecimal totalAmount;
    private BillStatus status;
    private LocalDate dueDate;
    private LocalDate paidDate;
    private LocalDate generatedDate;
}
