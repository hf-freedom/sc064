package com.campus.dormitory.entity;

import com.campus.dormitory.enums.Gender;
import lombok.Data;

import java.util.List;

@Data
public class DormitoryBuilding {
    private String buildingId;
    private String buildingName;
    private Gender genderRestriction;
    private Integer floorCount;
    private List<Integer> floors;
    private String description;
}
