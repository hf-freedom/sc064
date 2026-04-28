package com.campus.dormitory.entity;

import com.campus.dormitory.enums.AccommodationStatus;
import com.campus.dormitory.enums.ArrearsStatus;
import com.campus.dormitory.enums.Gender;
import lombok.Data;

import java.time.LocalDate;

@Data
public class Student {
    private String studentId;
    private String name;
    private Gender gender;
    private String college;
    private Integer grade;
    private String phone;
    private AccommodationStatus accommodationStatus;
    private ArrearsStatus arrearsStatus;
    private String currentBedId;
    private Integer disciplineCount;
    private LocalDate checkInDate;
}
