package com.campus.dormitory.dto;

import lombok.Data;

@Data
public class CheckOutRequest {
    private String studentId;
    private String bedId;
    private String remark;
}
