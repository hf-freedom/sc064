package com.campus.dormitory.store;

import com.campus.dormitory.entity.*;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class DataStore {

    private final Map<String, Student> students = new ConcurrentHashMap<>();
    private final Map<String, DormitoryBuilding> buildings = new ConcurrentHashMap<>();
    private final Map<String, DormitoryRoom> rooms = new ConcurrentHashMap<>();
    private final Map<String, Bed> beds = new ConcurrentHashMap<>();
    private final Map<String, AccessCard> accessCards = new ConcurrentHashMap<>();
    private final Map<String, UtilityBill> utilityBills = new ConcurrentHashMap<>();
    private final Map<String, MaintenanceRequest> maintenanceRequests = new ConcurrentHashMap<>();
    private final Map<String, DisciplineRecord> disciplineRecords = new ConcurrentHashMap<>();
    private final Map<String, MaintenanceStaff> maintenanceStaffs = new ConcurrentHashMap<>();

    private final Map<String, List<String>> buildingRoomMap = new ConcurrentHashMap<>();
    private final Map<String, List<String>> roomBedMap = new ConcurrentHashMap<>();
    private final Map<String, List<String>> studentBillMap = new ConcurrentHashMap<>();
    private final Map<String, List<String>> studentDisciplineMap = new ConcurrentHashMap<>();
    private final Map<String, List<String>> staffRequestMap = new ConcurrentHashMap<>();

    public Map<String, Student> getStudents() {
        return students;
    }

    public Map<String, DormitoryBuilding> getBuildings() {
        return buildings;
    }

    public Map<String, DormitoryRoom> getRooms() {
        return rooms;
    }

    public Map<String, Bed> getBeds() {
        return beds;
    }

    public Map<String, AccessCard> getAccessCards() {
        return accessCards;
    }

    public Map<String, UtilityBill> getUtilityBills() {
        return utilityBills;
    }

    public Map<String, MaintenanceRequest> getMaintenanceRequests() {
        return maintenanceRequests;
    }

    public Map<String, DisciplineRecord> getDisciplineRecords() {
        return disciplineRecords;
    }

    public Map<String, MaintenanceStaff> getMaintenanceStaffs() {
        return maintenanceStaffs;
    }

    public Map<String, List<String>> getBuildingRoomMap() {
        return buildingRoomMap;
    }

    public Map<String, List<String>> getRoomBedMap() {
        return roomBedMap;
    }

    public Map<String, List<String>> getStudentBillMap() {
        return studentBillMap;
    }

    public Map<String, List<String>> getStudentDisciplineMap() {
        return studentDisciplineMap;
    }

    public Map<String, List<String>> getStaffRequestMap() {
        return staffRequestMap;
    }
}
