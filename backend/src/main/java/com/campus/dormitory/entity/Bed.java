package com.campus.dormitory.entity;

import com.campus.dormitory.enums.BedStatus;
import com.campus.dormitory.enums.Gender;
import lombok.Data;

@Data
public class Bed {
    private String bedId;
    private String roomId;
    private String buildingId;
    private String bedNumber;
    private BedStatus status;
    private Gender genderRestriction;
    private String studentId;
}
