package com.campus.dormitory.entity;

import lombok.Data;

import java.time.LocalDate;

@Data
public class DisciplineRecord {
    private String recordId;
    private String studentId;
    private String bedId;
    private String roomId;
    private String violationType;
    private String description;
    private LocalDate violationDate;
    private String penalty;
}
